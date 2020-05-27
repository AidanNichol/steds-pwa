import React, { FC, useEffect } from 'react';
import { Modal } from './modal';
import * as serviceWorker from '../../serviceWorker';

const ServiceWorkerWrapper: FC = () => {
  const [showReload, setShowReload] = React.useState(false);
  const [waitingWorker, setWaitingWorker] = React.useState<ServiceWorker | null>(null);
  //   const [isModalOpen, setModalOpen] = React.useState(false);
  // const closeModal =()=>setModalOpen(false)

  const onSWUpdate = (registration: ServiceWorkerRegistration) => {
    setShowReload(true);
    setWaitingWorker(registration.waiting);
  };

  useEffect(() => {
    serviceWorker.register({ onUpdate: onSWUpdate });
  }, []);

  const reloadPage = () => {
    waitingWorker?.postMessage({ type: 'SKIP_WAITING' });
    setShowReload(false);
    window.location.reload(true);
  };

  return (
    <Modal isOpen={showReload} style={{ background: 'yellow', height: '30%' }}>
      <div>A new version is available!</div>
      <footer>
        <button onClick={reloadPage}>Reload</button>
      </footer>
    </Modal>
  );
};

export default ServiceWorkerWrapper;
