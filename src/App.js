import React, { Component } from "react";
//import Pipeline from "@pipeline-ui-2/pipeline"; //change to import Pipeline from 'Pipeline for realtime editing Pipeline index.js, and dependency to: "Pipeline": "file:..",

import "./App.scss";
import Sidebar from "./components/Sidebar/Sidebar";

var friends = [
  {
    pic: "",
    name: "Landon",
  },
  {
    pic: "",
    name: "Ginger",
  },
  {
    pic: "",
    name: "Henry",
  },
];

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      msgLength: 0,
    };
  }

  render() {
    return (
      <div className="App">
        <Sidebar />
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
              <div className="submit-container">
                <button type="submit" className="send">
                  Send {this.state.msgLength}/480
                </button>
              </div>
            </form>
          </div>
          <div className="box friends">
            {friends.map((props) => {
              return (
                <button className="friend-container">
                  <div className="profile"></div>
                  <p className="name">{props.name}</p>
                </button>
              );
            })}
          </div>
          <div className="box config"></div>
        </div>
      </div>
    );
  }
}

export default App;
