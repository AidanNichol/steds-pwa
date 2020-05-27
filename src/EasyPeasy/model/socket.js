import { action, thunk } from 'easy-peasy';
import { wsUrl } from '../use-data-api';
import Logit from 'logit';
var logit = Logit('components/layouts/MainLayout');
export const socket = {
  socket: null,

  setSocket: action((state, payload) => (state.socket = payload)),
  // addListener: action(
  //   (state, onMessage) =>
  //     (state.socket.onmessage = (event) => {
  //       logit('socket message', event.data);
  //       const data = JSON.parse(event.data);
  //       onMessage(data);
  //     }),
  // ),
};
socket.send = action((state, payload) => {
  logit('send', payload);
  state.socket.send(JSON.stringify(payload));
});
socket.load = thunk((actions, payload, { getStoreState, getStoreActions }) => {
  const socket = new WebSocket(wsUrl);
  socket.onmessage = (event) => {
    logit('socket message', event.data);
    const data = JSON.parse(event.data);
    if (data.changed) getStoreActions().walkBookingStatus.setStale(true);
    if (getStoreState().accountStatus.accountId === data.changed) {
      getStoreActions().accountStatus.setStale(true);
    }
  };
  actions.setSocket(socket);
});
export default socket;
