import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
// import 'hint.css';
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
// import * as serviceWorker from './serviceWorker';
import { App } from './app';
import { StoreProvider } from 'easy-peasy';
import epStore from './store/store';
import { IconsLoad } from './fontAwesome2';
import { ReactQueryDevtools } from 'react-query-devtools';

// import ServiceWorkerWrapper from './Components/layouts/SWwrapper';

// import MainLayout from './Components/layouts/MainLayout';

console.log('epStore Provider', epStore, StoreProvider);

ReactDOM.render(
  <>
    <StoreProvider store={epStore}>
      <App />
      <IconsLoad />
    </StoreProvider>
    <ReactQueryDevtools initialIsOpen={false} />
  </>,
  document.getElementById('root'),
);
// });

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
// serviceWorker.register();
