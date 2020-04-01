import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { Store, emptyStore } from './models/store.js';
// import App from './App';
import 'hint.css';
import './styles/busList.scss';
import './styles/bookings.scss';
import './styles/folder-tabs.scss';
import './styles/about.scss';
import './styles/lock.scss';
import './styles/editMember.scss';
import './styles/memberlist-grid.scss';
import './styles/mainpage-grid.scss';
import './styles/panel.scss';
import './styles/payments.scss';
import './styles/normalize.scss';
import './styles/watermark.scss';
import './styles/react-select.scss';
import './styles/paymentsSummary.scss';
import './styles/settings.scss';
import { monitorChanges } from './ducks/dbChangeMonitoringMobx.mjs';
import * as serviceWorker from './serviceWorker';
// import { store, StoreContext } from './models/StoreContext.js';
import { Provider } from 'mobx-react';
import { IconsLoad } from './fontAwesome2.js';

import MainLayout from './Components/layouts/MainLayout.js';

import { db } from './models/testDB.js';

// const store = Store.create(emptyStore, { db, useFullHistory: true, reset: false });
// const store = Store.create(emptyStore, { db, useFullHistory: true, reset: true });
const store = Store.create(emptyStore, { db, useFullHistory: false, reset: false });
store.signin.load();

monitorChanges(db, store);
// store.load().then(() => {
ReactDOM.render(
  <Provider store={store}>
    <div>
      <IconsLoad />
      <MainLayout />
    </div>
  </Provider>,
  document.getElementById('root'),
);
// });

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.register();
