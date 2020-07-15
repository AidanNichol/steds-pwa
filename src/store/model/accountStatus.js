// import { fetchData } from '../use-data-api';
import { action, thunk, thunkOn, computed, debug } from 'easy-peasy';
import { fetchData } from '../use-data-api';
import { produceWithPatches, enablePatches } from 'immer';
import { bookingChange, annotateBooking, paymentReceived } from './fundsManager';
//   break;
import { prepareBookings, preparePayments, prepareRefunds } from './displayLog2';

import _ from 'lodash';
import Logit from '../../logit';

var logit = Logit('store/accountStatus');
enablePatches();
/*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃                    Model                                 ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ 
*/
export const accountStatus = {
  accountId: null,
  name: '',
  bookings: {
    balance: 0,
    status: [],
    Members: [],
    bookings: {},
    payments: {},
    bookingsStack: [],
    paymentsStack: [],
    lastAction: '',
  },
  stale: false,
  historicData: [],
  data: [],
  sortFn: 'byDate',
  endDate: '9999-99-99', // going backwards through time
  startDate: '0000-00-00',
};
/*
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                     Actions                              ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ 
*/
accountStatus.setAccount = action((state, accountId) => {
  logit('setAccount', accountId);
  state.accountId = accountId;
  state.endDate = '9999-99-99';
  state.historicData = [];
});
accountStatus.setAccountName = action((state, name) => {
  state.name = name;
});
accountStatus.setBookings = action((state, data) => {
  state.bookings = data;
});
accountStatus.setHistoricData = action((state, data) => {
  state.historicData = data;
});

accountStatus.setStartDate = action((state, startDate) => {
  state.startDate = startDate;
});
accountStatus.setEndDate = action((state, endDate) => {
  logit('endDate set:', endDate);
  state.endDate = endDate;
});
accountStatus.setSortFn = action((state, sortFn) => {
  state.sortFn = sortFn;
});
accountStatus.setStale = action((state, bool) => {
  state.stale = bool;
});
/*
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                      Thunks                              ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ 
*/
accountStatus.onSetPage = thunkOn(
  (actions, storeActions) => storeActions.router.setPage,
  (actions, { payload: page }) => {
    if (page === 'bookings') actions.getAccountFromMember();
  },
);
accountStatus.getAccountFromMember = thunk((actions, payload, { getStoreState }) => {
  const id = getStoreState().members?.current?.data.accountId;
  if (id) actions.setAccount(id);
});
accountStatus.getStartDate = thunk(async (actions) => {
  const res = await fetchData(`Walk/firstBooking`);
  logit('getStartDate fetchData returned', res);
  actions.setStartDate(res.data[0].firstBooking);
});
accountStatus.onSetAccount = thunkOn(
  (actions) => [actions.setAccount, actions.setStale],
  async (actions, { type, payload }, { getState, getStoreState }) => {
    logit('onSetAccount', type, payload);
    if (type === '@action.accountStatus.setStale' && payload === false) return;
    if (type === '@action.accountStatus.setAccount') {
      actions.setEndDate('9999-99-99');
      const name = getStoreState().names.get(payload);
      actions.setAccountName(name.sortName);
    }
    const id = getState().accountId;
    const startDate = getState().startDate;
    if (!id || !startDate) return;
    const res = await fetchData(`sq/activeData/${id}/${startDate}`);
    logit('activeData fetchData returned', res);
    actions.setStale(false);
    const fm = initalizeFundsManagment(res.data);

    actions.setBookings(fm);
  },
);
accountStatus.onSetEndDate = thunkOn(
  (actions) => actions.setEndDate,
  async (actions, { payload: endDate }, { getState }) => {
    if (endDate === '9999-99-99') {
      actions.setHistoricData([]);
      return;
    }
    const { accountId, startDate } = getState();
    const res = await fetchData(`sq/historicData/${accountId}/${startDate}/${endDate}`);
    logit('fetch historic Data returned', res);
    actions.setHistoricData(res.data);
  },
);
/*
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                      Computed                             ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ 
*/
accountStatus.historicLogs = computed(
  [(state) => state.historicData, (state) => state.sortFn],
  (data, sortFn) => {
    const pymts = preparePayments(data.Payments, sortFn, true);
    const rfnds = prepareRefunds(data.Refunds, sortFn, true);
    logit('effect2', pymts, rfnds);
    return [...pymts, ...rfnds];
  },
);
/*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃                    useBookingLogData                     ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ 
*/
accountStatus.bookingLogData = computed((state) => {
  const historicLogs = state.historicLogs;
  const currData = state.bookings;
  const sortFn = state.sortFn;
  logit('useBookingLogData', debug(historicLogs), debug(currData), state.data.name);
  var bLogs = prepareBookings(_.values(currData.bookings), sortFn);
  var pLogs = preparePayments(_.values(currData.payments), sortFn, false);
  let logs = [...pLogs, ...bLogs, ...historicLogs];
  logit('useBookingLogs pre setLogs', { pLogs, bLogs, historicLogs, logs });
  logs = _.uniqBy(logs, (l) => l.id || l.paymentId);
  logs = _.sortBy(logs, (l) => l.sortKey);
  logit('useBookingLogs post effect', { pLogs, bLogs, historicLogs, logs });
  return logs;
});
/* ( ͡° ͜ʖ ͡°)  ヽ(͡◕ ͜ʖ ͡◕)ﾉ  ( ͡ಠ ʖ̯ ͡ಠ)
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃                    useActiveData                         ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ 
*/
const dispatch = (process) => {
  return thunk((actions, payload, { getState, getStoreActions }) => {
    logit('dispatchPayload', payload);
    const [nextState, ...patches] = produceWithPatches(getState().bookings, (draft) =>
      process(draft, payload),
    );
    logit('patches', patches);
    if (patches[0].length === 0) return;
    patches[2] = getState().accountId;
    getStoreActions().patches.addToQueue(patches);
    logit('nextState', nextState, patches);
    actions.setBookings(nextState);
  });
};
accountStatus.bookingChange = dispatch(bookingChange);
accountStatus.annotateBooking = dispatch(annotateBooking);
accountStatus.paymentReceived = dispatch(paymentReceived);

function initalizeFundsManagment(data) {
  logit('activeData fetchData returned', data);

  const [bookings, payments] = buildBookingData(data);
  const Members = data.Members;
  const bookingsStack = Object.values(bookings)
    .filter((b) => b.owing > 0)
    .map((b) => b.bookingId);
  const paymentsStack = Object.values(payments)
    .filter((p) => p.available > 0)
    .map((p) => p.paymentId);
  const debt = bookingsStack.reduce((tot, id) => tot + bookings[id].owing, 0);
  const credit = paymentsStack.reduce((tot, id) => tot + payments[id].available, 0);
  const balance = credit - debt;
  logit('setting account', { bookings, payments, bookingsStack, paymentsStack });
  logit('setting account', { debt, credit, balance });
  return {
    Members,
    bookings,
    payments,
    bookingsStack,
    paymentsStack,
    balance,
    lastAction: '',
  };
}

function buildBookingData(account) {
  let bookings = {};
  const payments = _.keyBy(account.Payments, (p) => p.paymentId);
  (account.Payments || []).forEach((p) => {
    p.Allocations.forEach((alloc) => {
      const booking = alloc.Booking;
      if (!booking.Walk.bookable) return;
      const { bookingId } = booking;
      const myAllocs = p.Allocations.filter((a) => a.bookingId === bookingId);
      logit('myAllocs', bookingId, debug(p.Allocations), debug(myAllocs));
      bookings.Allocations = [
        ...(bookings.Allocations || []),
        ...p.Allocations.filter((a) => a.bookingId === bookingId),
      ];
      bookings[booking.bookingId] = booking;
    });
  });
  account.Bookings.forEach((booking) => {
    logit('booking', debug(booking));
    if (!booking.Walk.bookable && booking.owing === 0) return;
    bookings[booking.bookingId] = booking;
  });
  logit('bookingData1', bookings);
  return [bookings, payments];
}

export default accountStatus;
