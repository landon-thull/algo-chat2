import React, { Component } from "react";
import Pipeline from "@pipeline-ui-2/pipeline"; //change to import Pipeline from 'Pipeline for realtime editing Pipeline index.js, and dependency to: "Pipeline": "file:..",

import "./App.scss";
import Sidebar from "./components/Sidebar/Sidebar";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="App">
        <Sidebar />
        <div className="content">
          <div className="box chat">
            <div className="section-header">
              <div className="current">
                <div className="profile" />
                <p className="name">Testing</p>
              </div>
            </div>
            <div className="messages"></div>
            <div className="chat-input">
              <textarea minLength={3} />
              <button className="send">Send</button>
            </div>
          </div>
          <div className="box friends">Testing</div>
          <div className="box config"></div>
        </div>
      </div>
    );
  }
}

export default App;
