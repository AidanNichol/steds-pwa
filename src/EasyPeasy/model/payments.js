import { action, thunk, thunkOn } from 'easy-peasy';
import { fetchData } from '../use-data-api';
import { dispDate } from '../dateFns';

import _ from 'lodash';
import Logit from 'logit';
var logit = Logit('easyPeasy/payments');

export const payments = {
  debts: [],
  paymentsMade: [],
  credits: [],
  totalDebt: 0,
  totalCredit: 0,
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
});
payments.setPaymentsMade = action((state, payload) => {
  state.paymentsMade = payload;
  const total = payload.reduce((tot, a) => tot + a.balance, 0);
  state.totalPaid = total;
});
payments.setCredits = action((state, payload) => {
  state.made = payload;
  const total = payload.reduce((tot, a) => tot + a.available, 0);
  state.totalCredit = total;
});
/*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃                    useDebts                              ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ 
*/
payments.onSetPage = thunkOn(
  (actions, storeActions) => storeActions.router.setPage,
  (actions, { payload: page }) => {
    if (page === 'payments') {
      actions.setDisplayDebts();
      actions.getDebts();
    }
  },
);
payments.onSetDisplayDebts = thunkOn(
  (actions) => actions.setDisplayDebts,
  (actions) => actions.getDebts(),
);
payments.getDebts = thunk(async (actions, payload, { getStoreState }) => {
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
payments.getPaymentsMade = thunk(async (actions, payload, { getStoreState }) => {
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
});
/*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃                    useCreditsOwing                       ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ 
*/
payments.getCredits = thunk(async (actions, payload) => {
  const res = await fetchData(`Payment/creditsOwed`);
  logit('fetchData returned', res);
  actions.setCredits(res.data);
});
export default payments;
