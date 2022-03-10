import React, { Component } from "react";
import Pipeline from '@pipeline-ui-2/pipeline'; //change to import Pipeline from 'Pipeline for realtime editing Pipeline index.js, and dependency to: "Pipeline": "file:..",

import algosdk from 'algosdk'
import logo from "./logo.svg";
import "./bootstrap.css";
import "./App.css";

//add app id 69417489 to input on frontend for testing without deployment

const myAlgoWallet = Pipeline.init();

Pipeline.main = false;

var toggled = true

var friendsTxid = ""

var canvasId = 2

var friendsFetched = false
var showDetail = false;
var mynet = (Pipeline.main) ? "MainNet🔴" : "TestNet🚧";

const tealNames = ["chat"]

const tealContracts = {
  chat: {},
}

const previousPosts = {}

var friends = []

var refresh = false

function show() {
  showDetail = !showDetail
  if (showDetail) {

    document.getElementById("containerz").style.display = "block"
  }
  else {
    document.getElementById("containerz").style.display = "none"  }
}

async function getContracts() {
  for (let i = 0; i < tealNames.length; i++) {
    let name = tealNames[i]
    let data = await fetch("teal/" + name + ".txt")
    tealContracts[name].program = await data.text()
    let data2 = await fetch("teal/" + name + " clear.txt")
    tealContracts[name].clearProgram = await data2.text()
  }
}

function sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
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

function addTableRow(data, className) {
  let table = document.getElementById("chatLog");
  let row = table.insertRow(0);
  let cell1 = row.insertCell(0);
  cell1.innerHTML = data;
  cell1.className = className
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
      messages: [],
      list: [],
      toggled: "block",
      mlength:0
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
      this.setState({ net: "TestNet🚧" })
    }
    else {
      Pipeline.main = true
      this.setState({ net: "MainNet🔴" })
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

    Pipeline.deployTeal(tealContracts[name].program, tealContracts[name].clearProgram, [0, 5, 0, 0], ["create"]).then(data => {
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
    alert(pictx)
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

    let appId = document.getElementById("appid").value

    let friendsAndMe = [...friends, appId]

    for (let i = 0; i < friendsAndMe.length; i++) {
      this.readGlobal(friendsAndMe[i])
      sleep(1000)
    }
  }

  post = async () => {

    let appId = document.getElementById("appid").value
    if (appId === "") { alert("you forgot to tell us what your app Id is!") }

    else {
      let appAddress = algosdk.getApplicationAddress(parseInt(appId))
      let myMessage = document.getElementById("postMessage").value

      Pipeline.appCall(appId, ["chat", myMessage]).then(data => {
        this.setState({ txID: data })
        this.startRefresh()
      })
    }
  }

  readGlobal = async (appId) => {
    try {
      let data = await Pipeline.readGlobalState(appId)

      let details = {
        creator: "",
        name: "",
        message: "",
        picData: ""
      }

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
            break;
          case "Creator":
            keyIndex = i;
            let creator = data[keyIndex].value.bytes
            details.creator = creator
            break;
          case "friends":
            keyIndex = i;
            friendsTxid = window.atob(data[keyIndex].value.bytes)
            console.log("FriendsTxid:")
            console.log(friendsTxid)
            if(!friendsFetched){
              this.getFriends()
              friendsFetched = false
            }
            break;
          default:
            break;
        }
      }

      if (previousPosts[appId] !== details.message) {

        if (details.picData !== "") {
          await this.handleFetch(details.picData)
        }
        canvasId++
        let canvas = document.getElementById("canvas2")
        let url = canvas.toDataURL("image/png");

        if (details.picData === "") { url = "anon.png" }

        let myId = document.getElementById("appid").value

        let messageClass = "others alert text-left alert-info "

        if (myId === appId) { messageClass = "alert text-left alert-success me" }

        addTableRow('<div id="upperMessage" class="upperMessage-' + messageClass + '"><img width="30px" class="avatar-' + messageClass + '" src="' + url + '"></img><span class="messageName">' + details.name + "_" + appId + '</span></div><div class="messageText">' + " " + details.message + "</div>", messageClass)

        this.setState({mlength:this.state.mlength + 1})
      }

      previousPosts[appId] = details.message

      console.log(details)

      return details
    }
    catch (error) { console.log(error) }
  }
  

  startRefresh = () => {
    this.check()
    if (!refresh) { setInterval(() => this.check(), 5000) }
    refresh = true
  }

  getFriends = async () => {

    let url = ""
    if (Pipeline.main) {
      url = "https://algoindexer.algoexplorerapi.io"
    }
    else {
      url = "https://algoindexer.testnet.algoexplorerapi.io"
    }

    let data = await fetch(url + "/v2/transactions/" + friendsTxid)
    let dataJson = await data.json()
    let parsed = window.atob(dataJson.transaction.note).split(",")
    let newArray = []
    parsed.forEach(item => {
      newArray.push(parseInt(item))
    })
    console.log(newArray)
    friends = newArray

  }

  handleFetch = async (txid) => {
    let data = await fetchNote(txid)
    this.setState({ data: base64ToArrayBuffer(data) }, () =>
      this.drawData());
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

  addFriend = async () => {
    let friendId = document.getElementById("addFriend").value
    let appid = document.getElementById("appid").value

    if (!friends.includes(friendId) && !(appid === friendId)) {

      let friendsDetails = await this.readGlobal(friendId)

      if (friendsDetails !== undefined){
      
      console.log(friendsDetails)
      friends.push(friendId)
      let friendName = friendsDetails.name + "_" + friendId
      this.setState({ list: [...this.state.list, friendName] })
      let friendsMod = friends.toString().replace(/\"/g,"")
      alert(friendsMod)
      let txid = await Pipeline.send(Pipeline.address,0,friendsMod,undefined,undefined,0)
      alert(txid)
      let txid2 = await Pipeline.appCall(parseInt(appid),["friends",txid])
      this.setState({txID:txid2})
      }
      else{
        alert("invalid app id")
      }
    }
    else {
      alert("you are attempting to add yourself or add a friend more than once!")
    }
  }

  

  options = () => {
    toggled = !toggled
    if (toggled) {
      this.setState({ toggled: "block" })
      document.getElementById("toggler").innerText = "Hide"
    }
    else {
      this.setState({ toggled: "none" })
      document.getElementById("toggler").innerText = "Show"
    }

  }

  render() {
    const loadingSpin = this.state.loading ? "App-logo Spin" : "App-logo";
    return (
      <div align="center">
        <header className="py-3 mb-4 border-bottom">
        <div class="App container bg-light shadow  app-header-2">
        <div className=" d-flex align-items-center mb-lg-0 me-lg-auto text-dark text-decoration-none badge-net">

        <h2 className=" badge bg-warning form-select form-btn">{this.state.net}</h2>
        </div>
        <div className="d-flex align-items-center mb-lg-0 me-lg-auto text-dark text-decoration-none">
       
        <select className="form-select" onClick={this.setNet}>
            <option>TestNet</option>
            <option>MainNet</option>
            </select>
            <select className="form-select" onChange={this.switchConnector}>
            <option>myAlgoWallet</option>
            <option>WalletConnect</option>
            <option>AlgoSigner</option>
          </select>
        </div>
            </div>
        </header>

        <div class="App container bg-light shadow  app-header mb-4">
            <a href="/" className="d-flex align-items-center mb-3 mb-lg-0 me-lg-auto text-dark text-decoration-none">
            <div>{"Transaction ID: " + this.state.txID}</div>
            </a>
            <a href="/" className="d-flex align-items-center mb-3 mb-lg-0 me-lg-auto text-dark text-decoration-none">
              <div>{"Connected Address: " + this.state.myAddress}</div>
            </a>
            </div>
        
        
       
        
        <div className="App container bg-light shadow">
          <header className="App-header">
            <h1 className="App-title">
              Algo Chat
              <span className="px-2" role="img" aria-label="Chat">
                💬
              </span>
            </h1>
            
          </header>

          <div className="row">
            <div className="col-4  pt-3 border-right">
              <h6>Say something about Algorand</h6>
              <div className="comment-form" />
              <div ><div className="form-group"></div><div className="form-group"><textarea className="form-control" placeholder="🤬 Your Comment" name="message" rows="5" spellCheck="false" type="text" id="postMessage"></textarea></div><div className="alert alert-danger" style={{ display: "none" }}>Something went wrong while submitting form.</div><div className="form-group">
                <button className="btn btn-primary form-group" onClick={this.post}>Comment ➤</button>
                </div></div>
            </div>
            <div className="col-8  pt-3 bg-white comment-list">
              <div className="comment-list"
                loading={this.state.loading}
                comments={this.state.comments}
              />
              <div className="comment-list"><h5 className="text-muted mb-4"><span className="badge badge-success">{this.state.mlength}</span> Comment</h5><div className="comments-list"><div className="alert text-center alert-info">Be the first to comment</div> <div ><table width="100%" className="" id="chatLog"></table></div></div></div></div><footer className="App-footer"> 
              
              <div class="col">
              <div class="row">
              <button className="form-select form-btn" onClick={this.handleConnect}>Click to Connect</button>
              <button  className="btn btn-bd-light" onClick={this.startRefresh}>Refresh</button>

              </div>
              </div>
              <div class="row">
              <div class="col">
              
              <button className="btn btn-bd-light" onClick={show} class="btn btn-primary form-group">⚙️ Expand Controls</button>
              </div></div>
              
              <div id="containerz-1">
              
            <canvas id="canvas2" height="30px" width="30px" style={{ display: "none" }}></canvas>


          
              
              
              </div>
              <div id="containerz" className="App container actions ">
          <div className="col footer-2">

                  <div className="bl-1" width="50%">
                    <button className="btn btn-sm btn-bd-light mb-2 mb-md-0" onClick={this.deploy}>Deploy Contract</button>
                    <button className="btn btn-sm btn-bd-light mb-2 mb-md-0" onClick={this.optIn}>Opt In</button>
                    <input className="form-control ds-input" placeholder="App Id" id="appid" type="number"></input>
                    <input id="userName" className="form-control" placeholder="😎 Your Name" name="name" type="text" />
                    <p>{"Application Address: " + this.state.appAddress}</p>
                    <button className="btn btn-success" onClick={this.changeName}>Change Name</button>
                    <p>Change Profile Pic</p>
                    <button className="btn btn-danger" onClick={this.delete}>Delete App</button>
                    <input className="form-control ds-input" type="text" id="picAddress" placeholder="txid of pic"></input>
                    <button className="btn btn-sm btn-bd-light mb-2 mb-md-0" onClick={this.changePic}>Fuse</button>
                  </div>
                  <div className="bl-2" width="50%">
                  <h3>My Friends:</h3>
                    <p>{this.state.list}</p>
                    <input className="form-control ds-input" type="text" id="addFriend" placeholder="friend's app id"></input>
                    <button className="btn btn-sm btn-bd-light mb-2 mb-md-0" onClick={this.addFriend}>Add Friend</button>

                  

                   
                    <br></br><br></br>
                   
                    


                   
                  </div>
          </div>
        </div>
            </footer></div>
        </div>
        <p>
              Brought to you by{" "}
              <a className="text-light" href="https://headline-inc.com">
                HEADLINE
              </a>
            </p>
        
      </div >

    );
  }
}

export default App;
