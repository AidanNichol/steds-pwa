import React, { Component } from 'react';
// import logo from './logo.svg';
// import './App.css';
import debug from 'debug';
import { ChangeLog } from './Components/views/bookings/PaymentStatusLog.js';
import { LoadingStatus } from './Components/views/LoadingStatus.js';
window.debug = debug;
class App extends Component {
  render() {
    return (
      <div className="App">
        <LoadingStatus />
        <ChangeLog accId="A2065" style={{ width: 508 }} />>
      </div>
    );
  }
}

export default App;
