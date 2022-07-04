import React, { Component } from "react";
import Pipeline from "@pipeline-ui-2/pipeline";

import "./App.scss";

const myAlgoWallet = Pipeline.init();

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      msgLength: 0,
      addr: "",
    };
  }

  switchConnector = (e) => {
    Pipeline.pipeConnector = e.target.value;
    console.log(e.target.value);
  };

  handleConnect = () => {
    Pipeline.connect(myAlgoWallet).then((data) => {
      this.setState({ addr: data });
      console.log(data);
    });
  };

  render() {
    return (
      <div className="App">
        <div className="header">
          <p className="wallet-number">WALLET: {this.state.addr}</p>
          <div className="wallet-container">
            <select className="wallet" onChange={this.switchConnector}>
              <option value="myAlgoWallet">MyAlgoWallet</option>
              <option value="WalletConnect">WalletConnect</option>
              <option value="AlgoSigner">AlgoSigner</option>
            </select>
            <button className="button-primary" onClick={this.handleConnect}>
              {this.state.addr < 5 ? "Connect Wallet" : "Connected!"}
            </button>
          </div>
        </div>
        <div className="content">
          <div className="box chat">
            <div className="section-header">
              <div className="current">
                <div className="profile"></div>
                <p className="name">Testing</p>
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
              <button type="submit" className="send">
                Send
              </button>
            </form>
          </div>
          <div className="box friends"></div>
          <div className="box config">
            <div className="deploy">
              <h2>Deploy to Chat</h2>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
