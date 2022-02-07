import React, { Component } from "react";
import Pipeline from '@pipeline-ui-2/pipeline'; //change to import Pipeline from 'Pipeline for realtime editing Pipeline index.js, and dependency to: "Pipeline": "file:..",

import algosdk from 'algosdk'

const myAlgoWallet = Pipeline.init();

Pipeline.main = false;

var ready = false

var canvasId = 2

var mynet = (Pipeline.main) ? "MainNet" : "TestNet";

const tealNames = ["chat"]

const tealContracts = {
  chat: {},
}

var refresh = false

async function getContracts() {
  for (let i = 0; i < tealNames.length; i++) {
    let name = tealNames[i]
    let data = await fetch("teal/" + name + ".txt")
    tealContracts[name].program = await data.text()
    let data2 = await fetch("teal/" + name + " clear.txt")
    tealContracts[name].clearProgram = await data2.text()
  }
}

function base64ToArrayBuffer(data) {
  let newData = Buffer.from(data, 'base64');
  console.log(newData);
  return newData;
}

function addAlpha(data) {
  let newData = [];
  let counter = -1
  for (var i = 0; i < data.length; i++) {
    if (counter < 2) { newData.push(data[i]); counter++; }
    else { newData.push(255); newData.push(data[i]); counter = 0; }
  }
  newData.push(255);
  return newData;

}

function addTableRow(data) {
  let table = document.getElementById("chatLog");
  let row = table.insertRow(0);
  let cell1 = row.insertCell(0);
  cell1.innerHTML = data;
  row.className = "message"
}

function rgbFrom8(data) {
  let newData = [];
  for (var i = 0; i < data.length; i++) {
    let pixel = data[i];
    let r = (pixel >> 5) * 32;
    let g = ((pixel & 28) >> 2) * 32;
    let b = (pixel & 3) * 64;
    newData.push(r);
    newData.push(g);
    newData.push(b);
  }
  return newData;
}

async function fetchNote(txid) {

  let indexerURL = 'https://algoindexer.algoexplorerapi.io/v2/transactions/'

  /* if (Pipeline.main == true) {
    indexerURL = indexerURL + 'algoindexer.algoexplorerapi.io/v2/transactions/'
  }
  else {
    indexerURL = indexerURL + "algoindexer.testnet.algoexplorerapi.io/v2/transactions/"
  } */

  let url2 = indexerURL + txid
  try {
    let data = await fetch(url2)
    let data2 = await data.json()
    let data3 = data2.transaction.note
    return data3
  } catch (error) {
    console.log(error)
  }
}

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      net: mynet,
      txID: "",
      myAddress: "",
      balance: 0,
      appAddress: "",
      goal: 0,
      level: 0,
      fundAmount: "Not fetched yet...",
      share: 0,
      depositAmount: 0,
      myProfits: 0,
      withdrawn: 0,
      contribution: 0,
      data: "",
      messages: []
    }
  }

  componentDidMount() {
    getContracts()
  }

  fetchBalance = (addr) => {
    Pipeline.balance(addr).then(
      data => {
        this.setState({ balance: data });
      }
    );
  }

  setNet = (event) => {
    if (event.target.value === "TestNet") {
      Pipeline.main = false
      this.setState({ net: "TestNet" })
    }
    else {
      Pipeline.main = true
      this.setState({ net: "MainNet" })
    }

  }

  handleConnect = () => {
    Pipeline.connect(myAlgoWallet).then(
      data => {
        this.setState({ myAddress: data });
        setInterval(() => this.fetchBalance(this.state.myAddress), 5000)
      }
    );
  }

  switchConnector = (event) => {
    Pipeline.pipeConnector = event.target.value
    console.log(Pipeline.pipeConnector)
  }

  deploy = async () => {

    let name = "chat"

    Pipeline.deployTeal(tealContracts[name].program, tealContracts[name].clearProgram, [0, 4, 0, 0], ["create"]).then(data => {
      document.getElementById("appid").value = data;
      this.setState({ appAddress: algosdk.getApplicationAddress(data) });
    })
  }

  delete = async () => {
    Pipeline.deleteApp(document.getElementById("appid").value).then(data => {
      this.setState({ txID: data })
    })
  }

  optIn = async () => {
    let appId = document.getElementById("appid").value
    this.state.appAddress = algosdk.getApplicationAddress(parseInt(appId))
    let args = []
    args.push("register")
    Pipeline.optIn(appId, args).then(data => {
      this.setState({ txID: data });

    })
  }

  changePic = async () => {

    let appId = document.getElementById("appid").value

    let appAddress = algosdk.getApplicationAddress(parseInt(appId))
    let pictx = document.getElementById("picAddress").value
    console.log(pictx)

    Pipeline.appCall(appId, ["pic", pictx]).then(data => { this.setState({ txID: data }) })
  }

  changeName = async () => {

    let appId = document.getElementById("appid").value

    let appAddress = algosdk.getApplicationAddress(parseInt(appId))
    let name = document.getElementById("userName").value
    console.log(name)

    Pipeline.appCall(appId, ["name", name]).then(data => { this.setState({ txID: data }) })
  }

  fund = async () => {
    let appId = document.getElementById("appid").value
    let appAddress = algosdk.getApplicationAddress(parseInt(appId))
    let famt = parseInt(document.getElementById("fundAmt").value)
    Pipeline.appCallWithTxn(appId, ["fund"], appAddress, famt, "funding", 0, [appAddress]).then(
      data => { this.setState({ txID: data }) })
  }

  deposit = async () => {
    let appId = document.getElementById("appid").value
    let appAddress = algosdk.getApplicationAddress(parseInt(appId))
    let depositAmt = parseInt(document.getElementById("depAmt").value)
    Pipeline.appCallWithTxn(appId, ["deposit"], appAddress, depositAmt, "depositing", 0, [appAddress]).then(
      data => { this.setState({ txID: data }) })
  }

  modifyTeal = () => {
    let newGoal = document.getElementById("newGoal").value
    let search1 = "BKGZZRBHXOBCD5HMITYZ5CI3V3LS6OMLUT2I7C7QIRU6VA3B2BXUFRN2BE";
    let search2 = "3000000"
    let searchTerms = [search1, search2]
    let replacements = [document.getElementById("recipient").value, newGoal]

    for (let i = 0; i < replacements.length; i++) {
      tealContracts["daoDeposit"].program = tealContracts["daoDeposit"].program.replaceAll(searchTerms[i], replacements[i])
      console.log(tealContracts["daoDeposit"].program)
    }
    this.setState({ goal: newGoal })
    alert("Contract modified! Check console log to preview")
  }

  check = () => {
    this.readGlobal(document.getElementById("appid").value)
  }

  post = async () => {

    let appId = document.getElementById("appid").value

    let appAddress = algosdk.getApplicationAddress(parseInt(appId))
    let myMessage = document.getElementById("postMessage").value

    Pipeline.appCall(appId, ["chat", myMessage]).then(data => { this.setState({ txID: data }) })
  }

  readGlobal = async (appId) => {
    let details = {
      creator: "",
      name: "",
      message: "",
      picTxid:""
    }
    Pipeline.readGlobalState(appId).then(
      data => {
        console.log("App Data")
        console.log(data)
        let keyIndex = ""
        for (let i = 0; i < data.length; i++) {
          let thisKey = window.atob(data[i].key)
          console.log(thisKey)

          switch (thisKey) {
            case "pic":
              keyIndex = i;
              let myPicTxid = data[keyIndex].value.bytes
              this.handleFetch(window.atob(myPicTxid))
              details.picData = window.atob(myPicTxid)
              break;
            case "chat":
              keyIndex = i;
              let myMessage = window.atob(data[keyIndex].value.bytes)
              details.message = myMessage
              console.log(myMessage)
              break;
            case "name":
              keyIndex = i;
              let myName = window.atob(data[keyIndex].value.bytes)
              details.name = myName
              console.log(myName)
              document.getElementById("name").innerText = myName
              break;
            case "Creator":
              keyIndex = i;
              let creator = data[keyIndex].value.bytes
              details.creator = creator
              break;
            default:
              break;
          }
        }

        canvasId++
        let canvas = document.getElementById("canvas2")
        let url = canvas.toDataURL("image/png");
        addTableRow('<td><img src="' + url + '"></img><span class="messageName">' + details.name + "_" + appId + '</span><span class="messageText">' + " " + details.message + "</td>")

      })
  }

  readLocalState = async (net, addr, appIndex) => {

    try {

      let url = ""

      if (!net) {
        url = "https://algoindexer.testnet.algoexplorerapi.io"
      }
      else {
        url = "https://algoindexer.algoexplorerapi.io"
      }

      let appData = await fetch(url + '/v2/accounts/' + addr)
      let appJSON = await appData.json()
      let AppStates = await appJSON.account["apps-local-state"]
      AppStates.forEach(state => {
        if (state.id === parseInt(appIndex)) {
          let keyvalues = state["key-value"]
          keyvalues.forEach(entry => {
            if (entry.key === "YW10") {
              let contribution = entry.value.uint
              this.setState({ share: parseInt((contribution / this.state.goal) * 100) || 0 })
            }
            if (entry.key === "d2l0aGRyYXdu") {
              let withdrawn = entry.value.uint
              this.setState({ withdrawn: withdrawn || 0 })
            }
          })
        }
      })
    }
    catch (error) { console.log(error) }
  }

  startRefresh = () => {
    this.check()
    //if(!refresh){setInterval(() => this.check(),5000)}
    //refresh = true
  }

  handleFetch = (txid) => {
    fetchNote(txid).then(data =>
      this.setState({ data: base64ToArrayBuffer(data) }, () =>
        this.drawData()));
  }

  drawData = () => {
    var canvas = document.getElementById('canvas2');
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const newData = addAlpha(rgbFrom8(this.state.data));
    var pic = new Uint8ClampedArray(newData);
    var imgData = new ImageData(pic, 30, 30);
    var renderer = document.createElement('canvas');
    renderer.getContext('2d').putImageData(imgData, 0, 0);
    ctx.drawImage(renderer, 0, 0, 300, 150);
  }

  render() {
    return (
      <div align="center">
        <h1>Algo Chat</h1>
        <table className="table" width="100%">
          <tbody>
            <tr><td width="50%">

              <select onClick={this.setNet}>
                <option>TestNet</option>
                <option>MainNet</option>
              </select>
              <h2>{this.state.net}</h2>
              <select onChange={this.switchConnector}>
                <option>myAlgoWallet</option>
                <option>WalletConnect</option>
                <option>AlgoSigner</option>
              </select>

              <button onClick={this.handleConnect}>Click to Connect</button><br></br>
              <p>{"Connected Address: " + this.state.myAddress}</p>
              <p>{"Balance: " + this.state.balance}</p>



              <h1>ACTIONS</h1>
              <button onClick={this.deploy}>Deploy Contract</button>
              <button onClick={this.optIn}>Opt In</button>
              <input placeholder="App Id" id="appid" type="number"></input>
              <p>{"Application Address: " + this.state.appAddress}</p>
              <br></br><br></br>
              <button onClick={this.delete}>Delete App</button>
              <h3>Profile Actions:</h3>
              <input type="text" id="picAddress" placeholder="txid of pic"></input>
              <button onClick={this.changePic}>Fuse</button><br></br>
              <input type="text" id="userName" placeholder="user name"></input>
              <button onClick={this.changeName}>Change Name</button>
            </td><td>
                <p>{"Transaction ID: " + this.state.txID}</p>
                <h1>I Am:</h1>
                <p id="name"></p>
                <canvas id="canvas2" height="30px" width="30px"></canvas><br></br>
                <button onClick={this.startRefresh}>Refresh</button>
                <input type="text" id="postMessage"></input>
                <button onClick={this.post}>Post</button>
                <table id="chatLog"></table>
              </td></tr>
          </tbody>
        </table>
        <button onClick={async () => {
          let data = await this.readGlobal()
          alert(data)

        }}>Test</button>
      </div >

    );
  }
}

export default App;
