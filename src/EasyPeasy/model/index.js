import { action, thunk } from 'easy-peasy';
import { fetchData } from '../use-data-api';

import { walkBookingStatus } from './walkBookingStatus';
import { patches } from './patches';
import { members } from './members';
import { banking } from './banking';
import { socket } from './socket';
import { payments } from './payments';
import { reports } from './reports';
import { accountStatus } from './accountStatus';
import { router } from './router';
import { user } from './user';
import Logit from 'logit';
// import { getWeekYearWithOptions } from 'date-fns/fp';

var logit = Logit('epStore');

// note the use of this which refers to observable instance of the store
const storeModel = {
  loaded: false,
  loading: false,
  router,
  user,
  walkBookingStatus,
  accountStatus,
  firstBooking: '0000-00-00',
  names: new Map(),
  members,
  accounts: [],
  walks: [],
  patches,
  banking,
  socket,
  payments,
  reports,
  setLoading: action((state, bool) => {
    state.loading = bool;
  }),
  setLoaded: action((state, bool) => {
    state.loaded = bool;
  }),

  setValue: action((state, { name, value }) => {
    state[name] = value;
  }),
  loadNames: thunk(async (actions, payload, { getState }) => {
    logit('actions/loadnames', actions);

    await actions.members.loadMembers();
    logit('Members', getState().members.list);
    const accs = await fetchData('Account/index');
    const wlks = await fetchData('Walk/index');
    logit('Accounts', accs);
    logit('Walks', wlks);
    actions.setValue({ name: 'accounts', value: accs.data });
    actions.setValue({ name: 'walks', value: wlks.data });
    const names = new Map();
    const mems = getState().members.list;
    [...mems, ...accs.data, ...wlks.data].forEach((item) => {
      const { id, ...rest } = item;
      names.set(id, rest);
    });
    actions.setValue({ name: 'names', value: names });
  }),
  getStartDate: thunk(async (actions) => {
    const res = await fetchData(`Walk/firstBooking`);
    logit('store fetchData returned', res);
    actions.setValue({ name: 'firstBooking', value: res.data[0].firstBooking });
  }),
  hydrate: thunk(async (actions, payload, { getState }) => {
    const state = getState();
    if (state.loaded || state.loading) return;
    await actions.setLoading(true);

    await actions.loadNames();
    await actions.getStartDate();
    await actions.accountStatus.getStartDate();
    await actions.walkBookingStatus.setStale(true);
    await actions.banking.getLatestBanking();
    await actions.setLoading(false);
    await actions.setLoaded(true);
    await actions.socket.load();
  }),
};

export default storeModel;
