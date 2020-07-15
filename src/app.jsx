import React, { useState } from 'react';
// import { useStoreState, useStoreActions } from 'easy-peasy';
import styled from 'styled-components';
import { IconsLoad } from './fontAwesome2';
import MainLayout from './Components/layouts/MainLayout';
import { Modal } from './Components/layouts/modal';
import logo from './images/St.EdwardsLogoSimple.svg';
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
// import './styles/settings.scss';

import * as serviceWorker from './serviceWorker';
export const App = () => {
  const [SW, setSW] = useState({
    serviceWorkerUpdated: false,
    serviceWorkerRegistration: null,
  });
  const setUpdate = (payload) => {
    console.warn('SWupdate', payload);
    setSW({
      serviceWorkerUpdated: !SW.serviceWorkerUpdated,
      serviceWorkerRegistration: payload,
    });
  };
  const isServiceWorkerUpdated = SW.serviceWorkerUpdated;
  // const serviceWorkerRegistration = useStoreState(
  //   (s) => s.SW.data.serviceWorkerRegistration,
  // );
  // const setInit = useStoreActions((a) => a.SW.setInit);
  // const setUpdate = useStoreActions((a) => a.SW.setUpdate);

  const updateServiceWorker = () => {
    const registrationWaiting = SW.serviceWorkerRegistration.waiting;

    if (registrationWaiting) {
      registrationWaiting.postMessage({ type: 'SKIP_WAITING' });

      registrationWaiting.addEventListener('statechange', (e) => {
        if (e.target.state === 'activated') {
          window.location.reload();
        }
      });
    }
  };
  serviceWorker.register({
    // onSuccess: () => { setInit(); },
    onUpdate: (registration) => setUpdate(registration),
  });
  return (
    <div>
      <IconsLoad />
      <MainLayout />
      {isServiceWorkerUpdated && (
        <Modal isOpen={true} style={{ background: 'white', height: '20%' }}>
          <UpdateHdr>
            <img className='logo' src={logo} width='40px' alt='' />
            St.Edwards Booking System
          </UpdateHdr>
          <div>New Version of the Program is Available</div>
          <footer>
            <button onClick={updateServiceWorker}>Update</button>
          </footer>
        </Modal>
        // <Alert
        //   text='There is a new version available.'
        //   buttonText='Update'
        //   onClick={updateServiceWorker}
        // />
      )}
    </div>
  );
};
const UpdateHdr = styled.div`
  font-size: 1.6em;
  font-weight: bold;
  img {
    margin-right: 0.5em;
  }
`;
