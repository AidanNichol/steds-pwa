import React, { Component } from 'react';
import 'FA-Icons.js';
// import logo from './logo.svg';
// import './App.css';
import debug from 'debug';
import { ChangeLog } from './Components/views/bookings/PaymentStatusLog.js';
import { LoadingStatus } from './Components/views/LoadingStatus.js';
import { library, config } from '@fortawesome/fontawesome-svg-core';

import { faBus, faCar, faSlash } from '@fortawesome/free-solid-svg-icons';
import { faBus as B, faCar as C, faSlash as X } from '@fortawesome/free-solid-svg-icons';
import { faClock as W } from '@fortawesome/pro-regular-svg-icons';
import { faClock } from '@fortawesome/pro-regular-svg-icons';
console.warn('fa-config', config);

config.showMissingIcons = true;

library.add(faBus, faCar, faSlash, faClock, B, C, W, X);

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
