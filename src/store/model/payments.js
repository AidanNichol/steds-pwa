import { action, thunk, thunkOn } from 'easy-peasy';
import { fetchData } from '../use-data-api';
import { dispDate } from '../dateFns';

import _ from 'lodash';
import Logit from '../../logit';
var logit = Logit('store/payments');

export const payments = {
  credits: [],
  debts: [],
  paymentsMade: [],
  staleCredits: true,
  staleDebts: true,
  stalePaid: true,
  totalCredit: 0,
  totalDebt: 0,
  totalPaid: 0,
  display: '',
};
/*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃                    Actions                               ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ 
*/
payments.setDisplayDebts = action((state) => {
  state.display = 'Debts';
  logit('Display:', state.display);
});
payments.setDisplayPaymentsMade = action((state) => {
  state.display = 'PaymentsMade';
  logit('Display:', state.display);
});
payments.setDebts = action((state, payload) => {
  state.debts = payload;
  const total = payload.reduce((tot, a) => tot + a.balance, 0);
  state.totalDebt = total;
  state.staleDebts = false;
});
payments.setPaymentsMade = action((state, payload) => {
  state.paymentsMade = payload;
  const total = payload.reduce((tot, a) => tot + a.balance, 0);
  state.totalPaid = total;
  state.stalePaid = false;
});
payments.setCredits = action((state, payload) => {
  state.made = payload;
  const total = payload.reduce((tot, a) => tot + a.available, 0);
  state.totalCredit = total;
  state.staleCredits = false;
});
payments.setStale = action((state) => {
  state.staleCredit = true;
  state.staleDebts = true;
  state.stalePaid = true;
});
payments.setPaidStale = action((state) => {
  logit('setPaidStale');
  state.stalePaid = true;
});
/*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃                    useDebts                              ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ 
    */
payments.onChanges = thunkOn(
  (actions, storeActions) => [
    storeActions.accountStatus.bookingChange,
    storeActions.accountStatus.paymentReceived,
  ],
  (actions) => actions.setStale(),
);
payments.onSetPage = thunkOn(
  (actions, storeActions) => storeActions.router.setPage,
  async (actions, { payload: page }) => {
    if (page === 'payments') {
      await actions.getDebts();
      await actions.setDisplayDebts();
    }
  },
);
payments.onSetDisplayDebts = thunkOn(
  (actions) => actions.setDisplayDebts,
  (actions) => actions.getDebts(),
);
payments.getDebts = thunk(async (actions, payload, { getState, getStoreState }) => {
  if (!getState().staleDebts) return;
  const index = getStoreState().names;

  const res = await fetchData(`Booking/owing`);
  logit('fetchData returned', res);

  let dMap = res.data.map((b) => {
    const { accountId, shortName: name } = index.get(b.memberId);
    const { sortName } = index.get(accountId);
    const { venue } = index.get(b.walkId);
    const displayDate = dispDate(b.BookingLogs[0].id);
    return { ...b, name, venue, displayDate, accountId, sortName };
  });
  dMap = _.groupBy(dMap, (b) => b.sortName);
  const pairs = _.sortBy(_.toPairs(dMap), (item) => item[0]);
  const accounts = pairs.map(([sortName, bookings]) => {
    const balance = bookings.reduce((tot, b) => tot + b.owing, 0);
    const accountId = bookings[0].accountId;
    return { sortName, accountId, balance, bookings };
  });
  logit('account', accounts);
  actions.setDebts(accounts);
});

/*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃                    usePaymentsMade                       ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ 
*/
payments.onSetDisplayPaymentsMade = thunkOn(
  (actions) => actions.setDisplayPaymentsMade,
  (actions) => {
    actions.getPaymentsMade();
  },
);
payments.getPaymentsMade = thunk(
  async (actions, payload, { getState, getStoreState }) => {
    if (!getState().stalePaid) return;
    const names = getStoreState().names;

    const res = await fetchData(`Payment/paymentsMade`);
    logit('fetchData returned', res);
    let dMap = res.data.map((p) => {
      p.displayDate = dispDate(p.paymentId);
      p.Bookings = p.Allocations.map((a) => {
        const booking = a.Booking;
        const { shortName: name } = names.get(booking.memberId);
        const { venue } = names.get(booking.walkId);
        const displayDate = dispDate(booking.BookingLogs[0].id);
        return { ...booking, name, venue, amount: a.amount, displayDate };
      }).filter((p) => p.fee !== 0);
      const { sortName } = names.get(p.accountId);
      return { ...p, sortName };
    });
    dMap = _.groupBy(dMap, (p) => p.sortName);
    const pairs = _.sortBy(_.toPairs(dMap), (item) => item[0]);
    const paymentsMade = pairs.map(([sortName, payments]) => {
      const balance = payments.reduce((tot, p) => tot + p.amount, 0);
      const accountId = payments[0].accountId;
      return { sortName, accountId, balance, payments };
    });
    logit('paymentsMade', paymentsMade);
    actions.setPaymentsMade(paymentsMade);
  },
);
/*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃                    useCreditsOwing                       ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ 
*/
payments.getCredits = thunk(async (actions, payload, { getState }) => {
  if (!getState().staleCredits) return;
  const res = await fetchData(`Payment/creditsOwed`);
  logit('fetchData returned', res);
  actions.setCredits(res.data);
});
export default payments;
