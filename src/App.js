import React, { Component } from "react";
import Pipeline from "@pipeline-ui-2/pipeline";

import algosdk from "algosdk";
import "./App.scss";

const myAlgoWallet = Pipeline.init();

Pipeline.main = false;

let storedApp = localStorage.getItem("algoChat");

const tealNames = ["chat"];

const tealContracts = {
  chat: {},
};

async function getContracts() {
  for (let i = 0; i < tealNames.length; i++) {
    let name = tealNames[i];
    let data = await fetch("teal/" + name + ".txt");
    tealContracts[name].program = await data.text();
    let data2 = await fetch("teal/" + name + " clear.txt");
    tealContracts[name].clearProgram = await data2.text();
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      txId: "",
      appId: "",
      appAddr: "",
      addr: "",
      net: "TestNet",
      msgLength: 0,
    };
  }

  componentDidMount() {
    getContracts();

    if (storedApp !== null) {
      this.setState({ appId: storedApp });
      let url = "";

      if (Pipeline.main) {
        url = "https://algoexplorer.io/application";
      } else {
        url = "https://testnet.algoexplorer.io/application";
      }
      this.setState({ appUrl: url + "/" + storedApp });
    } else {
      alert("You don't have a connected app yet");
    }
  }

  switchConnector = (e) => {
    Pipeline.pipeConnector = e.target.value;
    console.log(e.target.value);
  };

  switchNet = (e) => {
    if (this.state.net === "TestNet") {
      Pipeline.main = true;
      this.setState({ net: "MainNet" });
    } else {
      Pipeline.main = false;
      this.setState({ net: "TestNet" });
    }
  };

  handleConnect = () => {
    Pipeline.connect(myAlgoWallet).then((data) => {
      this.setState({ addr: data });
      console.log(data);
    });
  };

  deploy = async () => {
    let name = "chat";

    Pipeline.deployTeal(
      tealContracts[name].program,
      tealContracts[name].clearProgram,
      [1, 1, 0, 6],
      ["create"]
    ).then(async (data) => {
      let appAddr = await algosdk.getApplicationAddress(data);
      localStorage.setItem("algoChat", data);
      let url = "";

      if (Pipeline.main) {
        url = "https://algoexplorer.io/application";
      } else {
        url = "https://testnet.algoexplorer.io/application";
      }
      this.setState({ appUrl: url + "/" + data });
      this.setState({ appAddr: appAddr });
      this.setState({ addId: data });

      console.log(this.state.appAddr);
    });
  };

  render() {
    return (
      <div className="App">
        <div className="header">
          <div className="wallet-container">
            <div className="switch-container">
              TestNet
              <label className="switch">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    this.switchNet();
                  }}
                />
                <span className="slider round"></span>
              </label>
              MainNet
            </div>
            <div className="">
              <select className="wallet" onChange={this.switchConnector}>
                <option value="myAlgoWallet">MyAlgoWallet</option>
                <option value="WalletConnect">WalletConnect</option>
                <option value="AlgoSigner">AlgoSigner</option>
              </select>
              <button
                className="button-primary button"
                onClick={this.handleConnect}
              >
                {this.state.addr < 5 ? "Connect Wallet" : "Connected!"}
              </button>
            </div>
          </div>
        </div>
        <div className="content">
          <div className="box chat">
            <div className="section-header">
              <div className="current">
                <div className="profile"></div>
                <p className="name">Testing</p>
              </div>
              <div className="app-info">
                <p>App ID: {this.state.appId}</p>
                <p>Transaction: {this.state.txId}</p>
              </div>
            </div>
            <div className="messages"></div>
            <form className="chat-input">
              <textarea
                minLength={3}
                onChange={(e) => {
                  let msg = e.target.value;
                  this.setState({ msgLength: msg.length });
                  console.log(this.state.msgLength);
                }}
              />
              <button type="submit" className="send button">
                Send
              </button>
            </form>
          </div>
          <div className="box friends"></div>
          <div className="box config">
            <div className="deploy">
              <h2>Deploy to Chat</h2>
              <button
                className="button-primary button"
                onClick={() => this.deploy()}
              >
                {this.state.appId.length > 0 ? "Deployed!" : "Deploy"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
