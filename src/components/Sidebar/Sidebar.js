import React, { Component } from "react";
import "./Sidebar.scss";

//import { P2p } from "../../svg.js";

class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="SideBar">
        <button className="side-button">Peer to Peer</button>
        <button className="side-button">Forum</button>
      </div>
    );
  }
}

export default Sidebar;
