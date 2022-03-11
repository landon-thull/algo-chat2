import React, { Component } from "react";
import Pipeline from '@pipeline-ui-2/pipeline'; //change to import Pipeline from 'Pipeline for realtime editing Pipeline index.js, and dependency to: "Pipeline": "file:..",

import algosdk from 'algosdk'
import logo from "./logo.svg";
import "./bootstrap.css";
import "./App.css";
import {Svg9,Svg10} from './svgs.js'
import Faq from './faq'


//add app id 69417489 to input on frontend for testing without deployment

const myAlgoWallet = Pipeline.init();

Pipeline.main = false;

let storedApp = localStorage.getItem("algoChat")

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

var dark = true;

function toggleMode() {
  dark = !dark;
  if (dark) {
    document.getElementById("sun").style.display = "block";
    document.getElementById("moon").style.display = "none";
  } else {
    document.getElementById("sun").style.display = "none";
    document.getElementById("moon").style.display = "block";
  }
  var element = document.body;
  element.classList.toggle("light");
}

function show() {
  showDetail = !showDetail
  if (showDetail) {

    document.getElementById("containerz").style.display = "block"
  }
  else {
    document.getElementById("containerz").style.display = "none"  }
}
function showSocial() {
  showDetail = !showDetail
  if (showDetail) {

    document.getElementById("containerz-social").style.display = "block"
  }
  else {
    document.getElementById("containerz-social").style.display = "none"  }
    
}

function close() {
    document.getElementById("containerz").style.display = "none"  
  
  }

  function closeSocial() {
    document.getElementById("containerz-social").style.display = "none"
  
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
      mlength:0,
      myUrl: "",
      txidUrl:"",
      appId:""
    }
  }

  componentDidMount() {
    getContracts()
    if (storedApp !== null) {
      document.getElementById("appid").value = storedApp
      this.setState({ appId: storedApp })
      let url = ""

      if (Pipeline.main) {
        url = "https://algoexplorer.io/application"
      }
      else {
        url = "https://testnet.algoexplorer.io/application"
      }
      this.setState({ appUrl: url + "/" + storedApp })
    }
    else { alert("You don't have a connected app yet") }
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
        let url = ""

        if (Pipeline.main) {
          url = "https://algoexplorer.io/address"
        }
        else {
          url = "https://testnet.algoexplorer.io/address"
        }
        this.setState({
          myUrl: url + "/" + data
        })

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
      localStorage.setItem("algoChat", data)
      this.setState({ appId: data })
      let url = ""

      if (Pipeline.main) {
        url = "https://algoexplorer.io/application"
      }
      else {
        url = "https://testnet.algoexplorer.io/application"
      }
      this.setState({ appUrl: url + "/" + data })
      this.setState({ appAddress: algosdk.getApplicationAddress(data) });
    })
  }

  delete = async () => {
    Pipeline.deleteApp(document.getElementById("appid").value).then(data => {
      localStorage.clear()
      this.setState({ txID: data })
      this.makeTxidClick(data)
    })
  }

  optIn = async () => {
    let appId = document.getElementById("appid").value
    this.state.appAddress = algosdk.getApplicationAddress(parseInt(appId))
    let args = []
    args.push("register")
    Pipeline.optIn(appId, args).then(data => {
      this.setState({ txID: data });
      this.makeTxidClick(data)

    })
  }

  changePic = async () => {

    let appId = document.getElementById("appid").value

    let appAddress = algosdk.getApplicationAddress(parseInt(appId))
    let pictx = document.getElementById("picAddress").value
    alert(pictx)
    console.log(pictx)

    Pipeline.appCall(appId, ["pic", pictx]).then(data => { this.setState({ txID: data })
    this.makeTxidClick(data) })
  }

  changeName = async () => {

    let appId = document.getElementById("appid").value

    let appAddress = algosdk.getApplicationAddress(parseInt(appId))
    let name = document.getElementById("userName").value
    console.log(name)

    Pipeline.appCall(appId, ["name", name]).then(data => { this.setState({ txID: data }) 
    this.makeTxidClick(data)})
  }

  fund = async () => {
    let appId = document.getElementById("appid").value
    let appAddress = algosdk.getApplicationAddress(parseInt(appId))
    let famt = parseInt(document.getElementById("fundAmt").value)
    Pipeline.appCallWithTxn(appId, ["fund"], appAddress, famt, "funding", 0, [appAddress]).then(
      data => { this.setState({ txID: data })
      this.makeTxidClick(data) })
  }

  deposit = async () => {
    let appId = document.getElementById("appid").value
    let appAddress = algosdk.getApplicationAddress(parseInt(appId))
    let depositAmt = parseInt(document.getElementById("depAmt").value)
    Pipeline.appCallWithTxn(appId, ["deposit"], appAddress, depositAmt, "depositing", 0, [appAddress]).then(
      data => { this.setState({ txID: data })
      this.makeTxidClick(data)})
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
        this.makeTxidClick(data)
        this.startRefresh()
      })
    }
  }
  makeTxidClick = (txid) => {

    let url = ""
    
    if (Pipeline.main){
      url = "https://algoexplorer.io/tx/"
    }
    else{
      url = "https://testnet.algoexplorer.io/tx/"
    }
    
    this.setState({txidUrl:url + txid})
    
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

        addTableRow('<div id="upperMessage" className="upperMessage-' + messageClass + '"><img width="30px" className="avatar-' + messageClass + '" src="' + url + '"></img><span className="messageName">' + details.name + "_" + appId + '</span></div><div className="messageText">' + " " + details.message + "</div>", messageClass)

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

    return (
      <div align="center">
      
        <header className="py-3 mb-4 border-bottom">
        <div className="App container bg-light shadow  app-header-2">
        <div className=" d-flex align-items-center mb-lg-0 me-lg-auto text-dark text-decoration-none badge-net">

        <h2 className=" badge bg-warning form-select form-btn">{this.state.net}</h2>
        </div>
        <div className="d-flex align-items-center mb-lg-0 me-lg-auto text-dark text-decoration-none">
        <div className="flex-start">
        <Faq/>
        <a
  target="_blank"
  rel="noreferrer"
  className="shoulder__item"
  href="https://github.com/headline-design"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={25}
    height={25}
    className="navbar-nav-svg d-inline-block align-text-top"
    viewBox="0 0 512 499.36"
    role="img"
  >
    <path
      fillRule="evenodd"
      d="M256 0C114.64 0 0 114.61 0 256c0 113.09 73.34 209 175.08 242.9 12.8 2.35 17.47-5.56 17.47-12.34 0-6.08-.22-22.18-.35-43.54-71.2 15.49-86.2-34.34-86.2-34.34-11.64-29.57-28.42-37.45-28.42-37.45-23.27-15.84 1.73-15.55 1.73-15.55 25.69 1.81 39.21 26.38 39.21 26.38 22.84 39.12 59.92 27.82 74.5 21.27 2.33-16.54 8.94-27.82 16.25-34.22-56.84-6.43-116.6-28.43-116.6-126.49 0-27.95 10-50.8 26.35-68.69-2.63-6.48-11.42-32.5 2.51-67.75 0 0 21.49-6.88 70.4 26.24a242.65 242.65 0 0 1 128.18 0c48.87-33.13 70.33-26.24 70.33-26.24 14 35.25 5.18 61.27 2.55 67.75 16.41 17.9 26.31 40.75 26.31 68.69 0 98.35-59.85 120-116.88 126.32 9.19 7.9 17.38 23.53 17.38 47.41 0 34.22-.31 61.83-.31 70.23 0 6.85 4.61 14.81 17.6 12.31C438.72 464.97 512 369.08 512 256.02 512 114.62 397.37 0 256 0z"
    />
  </svg>
</a>

        <button
                    onClick={()=>{
                      toggleMode()
                    }}
                      id="toggle-css"
                      target="_blank"
                      rel="noreferrer"
                      className="shoulder__item ml-2"
                    >
                      <Svg9/>
                    <Svg10/>
                    </button>
                    <button
                   onClick={this.handleConnect}
                      target="_blank"
                      rel="noreferrer"
                      className="shoulder__item ml-2"
                    >

                  <svg className="svg-inline--fa fa-wallet " aria-hidden="true" focusable="false" data-prefix="fas" data-icon="wallet" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" data-fa-i2svg="">
                    <path d="M461.2 128H80c-8.84 0-16-7.16-16-16s7.16-16 16-16h384c8.84 0 16-7.16 16-16 0-26.51-21.49-48-48-48H64C28.65 32 0 60.65 0 96v320c0 35.35 28.65 64 64 64h397.2c28.02 0 50.8-21.53 50.8-48V176c0-26.47-22.78-48-50.8-48zM416 336c-17.67 0-32-14.33-32-32s14.33-32 32-32 32 14.33 32 32-14.33 32-32 32z"></path></svg>
                    </button>
                    </div>
                    <div className="flex-start">
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
            </div>
        </header>

        <div className="App container bg-light shadow  app-header mb-4">
            <a target="_blank"  href={this.state.txidUrl} className="d-flex align-items-center mt-2 mb-2 me-lg-auto text-dark text-decoration-none">
            <div className="address-elipse">{"Transaction ID: " + this.state.txID}</div>
            </a>
            <a target="_blank"  href={this.state.myUrl} className="d-flex align-items-center mt-2 mb-2 me-lg-auto text-dark text-decoration-none">
              <div className="address-elipse">{"Connected Address: " + this.state.myAddress}</div>
            </a>
            <a target="_blank"  href={this.state.appUrl} className="d-flex align-items-center mt-2 mb-2 me-lg-auto text-dark text-decoration-none">
              <div className="address-elipse">{"Connected App: " + this.state.appId}</div>
            </a>
            </div>
        
        
       
        
        <div className="App container bg-light shadow">
          <header className="App-header">
            <h1 className="App-title">
              algochat
              <span className="px-1" role="img" aria-label="Chat">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chat-left-dots" viewBox="0 0 16 16">
  <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"></path>
  <path d="M5 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"></path>
</svg>
              </span>
            </h1>
            
          </header>

          <div className="row">
          <div className="commands-row">
            <div className="col-4  pt-3 border-right">
              <h6>Say something about Algorand!</h6>
              <div className="comment-form" />
              <div ><div className="form-group"></div>
              <div className="form-group"><textarea className="form-control" placeholder="👋 Your message" name="message" rows="5" spellCheck="false" type="text" id="postMessage"></textarea></div>
              <div className="alert alert-danger" style={{ display: "none" }}>Something went wrong while submitting form.</div><div className="form-group">
                <button className="btn btn--generate-link" onClick={this.post}>Comment ➤</button>
                </div></div>
            </div>
            <div className="col-8  pt-3 bg-white comment-list">
                <div className="comment-list"
                loading={this.state.loading}
                comments={this.state.comments}
              />
              <div className="comment-list"><h5 className="text-muted mb-4">
                <span className="badge badge-success">{this.state.mlength}</span> Comments</h5>
                <div className="comments-list"><div className="alert text-center alert-info">Be the first to comment</div> <div >
                  <table width="100%" className="" id="chatLog"></table></div></div></div></div>
                  
                  
                  </div>
                  <footer className="App-footer"> 
              
              <div className="controls-row">
             
            
              <button className="btn-pills btn btn-primary mb-2 mr-2" onClick={this.handleConnect}> Connect</button>
              <button onClick={showSocial}  className="btn-pills btn btn-light mr-2 mb-2 ">😎 Friends</button>
              <button onClick={show}  className="btn-pills btn btn-light mr-2 mb-2 ">⚙️ Controls</button>
              <button  className=" btn-pills btn btn-light mb-2 " onClick={this.startRefresh}>Refresh</button>
              
             
              </div>
              <div className="controls-row-2">

</div>
     
              <div id="containerz-1">
              
            <canvas id="canvas2" height="30px" width="30px"  style={{ display: "none" }}></canvas>


          
              
              
              </div>
              <div id="containerz" className="App container actions ">
                <div className="header-row">
                  <h3>Actions</h3>
              <button type="button" onClick={close} className="btn-pills btn-close" aria-label="Close"></button>
              </div>
          <div className="col footer-2 w-100">
            <div className="flex-opt">
          <button className=" btn-pills  btn-pills btn btn-light mb-2 mr-2" onClick={this.deploy}>Deploy Contract</button>
                  
                    </div>
                  <div className="bl-1 w-100">
                    <div className="command-btns">
                    <input className="form-control ds-input mb-3" placeholder="App Id" id="appid" type="number"></input>
                  
                    <input id="userName" className="form-control mb-3" placeholder="😎 Your Name" name="name" type="text" />
                    <button className="btn btn-success  btn-pills  btn-pills btn btn-light mb-2 mr-2" onClick={this.changeName}>Change Name</button>
                    <label>Change Profile Pic</label>
                    <input className="form-control ds-input mb-3" type="text" id="picAddress" placeholder="txid of pic"></input>
                    <button className="btn-pills btn btn-sm btn-bd-light mb-3 mb-md-0" onClick={this.changePic}>Update PFP</button>
                    <button className="btn-pills btn btn-danger mt-3 mb-3" onClick={this.delete}>Delete App</button>
                    </div>
                    

                  </div>

                    <br></br><br></br>
                   
                    


                   
                  </div>
          </div>
           <div id="containerz-social" className="App container actions " style={{display: "none"}}>
           <div className="header-row">
           <h3>My Friends</h3>
              <button type="button" onClick={closeSocial} className="btn-close btn-pills" aria-label="Close"></button>
              </div>
          <div className="col footer-2 w-100">
          <div className="bl-1 w-100">

                    <div className="command-btns">
                    <input className="form-control ds-input mt-3" type="text" id="addFriend" placeholder="friend's app id"></input>

                    <button className="btn btn-secondary mt-3 " onClick={this.addFriend}>Add Friend</button>
                    </div>
                  </div>
         
                    <p>{this.state.list}</p>
                   

                  
                  
          </div>
            </div>
       </footer>
        </div>

        </div>
        <div className="right-row mb-4"><h4 className="built-by"> Built by <a className="text-light brand-light" href="https://headline-inc.com">HEADLINE</a></h4><div className="flex-start">
  <a
    target="_blank"
    href="https://algocloud.org"
    rel="noreferrer"
    className="shoulder__item"
    href="https://github.com/headline-design"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      className="bi bi-cloud-fill"
      viewBox="0 0 16 16"
    >
      <path d="M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383z" />
    </svg>
  </a>
  <a
href="https://pipeline-ui.com"
    target="_blank"
    rel="noreferrer"
    className="shoulder__item ml-2"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      className="bi bi-gear-fill"
      viewBox="0 0 16 16"
    >
      <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z" />
    </svg>
  </a>
  <a target="_blank" 
  href="https://daotools.org"
  rel="noreferrer" className="shoulder__item ml-2">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    className="bi bi-wrench-adjustable-circle-fill"
    viewBox="0 0 16 16"
  >
    <path d="M6.705 8.139a.25.25 0 0 0-.288-.376l-1.5.5.159.474.808-.27-.595.894a.25.25 0 0 0 .287.376l.808-.27-.595.894a.25.25 0 0 0 .287.376l1.5-.5-.159-.474-.808.27.596-.894a.25.25 0 0 0-.288-.376l-.808.27.596-.894Z" />
    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16Zm-6.202-4.751 1.988-1.657a4.5 4.5 0 0 1 7.537-4.623L7.497 6.5l1 2.5 1.333 3.11c-.56.251-1.18.39-1.833.39a4.49 4.49 0 0 1-1.592-.29L4.747 14.2a7.031 7.031 0 0 1-2.949-2.951ZM12.496 8a4.491 4.491 0 0 1-1.703 3.526L9.497 8.5l2.959-1.11c.027.2.04.403.04.61Z" />
  </svg>
</a>

  <a 
  href="https://twitter.com/headline_crypto"
  target="_blank"
  rel="noreferrer" className="shoulder__item ml-2">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      className="bi bi-twitter"
      viewBox="0 0 16 16"
    >
      <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z" />
    </svg>
  </a>
  
</div>
</div>
            
      

           
      </div >

    );
  }
}

export default App;
