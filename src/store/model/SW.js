import { action } from 'easy-peasy';
// import * as serviceWorker from '../../serviceWorker';

export const SW = {
  data: {
    serviceWorkerInitialized: false,
    serviceWorkerUpdated: false,
    serviceWorkerRegistration: null,
  },
  setInit: action((state) => {
    console.warn('SWinit', state);
    state.data.serviceWorkerInitialized = !state.data.serviceWorkerInitialized;
  }),
  setUpdate: action((state, payload) => {
    console.warn('SWupdate', { state, payload });
    state.data.serviceWorkerUpdated = !state.data.serviceWorkerUpdated;
    state.data.serviceWorkerRegistration = payload;
  }),
};
