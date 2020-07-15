import Logit from '../../logit';
import _ from 'lodash';
import { sprintf } from 'sprintf-js';
import { datetimePrevSec, todaysDate } from '../dateFns';

var logit = Logit('hooks/account/displayLog');

const sortKeyPayment = (pymt) => pymt.paymentId + pymt.paymentId;

export const prepareBookings = (bookings) => {
  logit('prepareBookings', bookings);
  let newList = [];
  (bookings || []).forEach((b) => {
    (b.BookingLogs || []).forEach((log) => {
      const xtra = {
        type: 'book',
        src: 'book',
        sortKey: log.id,
        balance: -1 * b.owing,
      };
      traceBooking(log);
      newList.push({ ...b, ...log, ...xtra });
    });
  });
  return newList;
};
export const preparePayments = (
  payments = [],
  sortBy,
  historic = false,
  trace = false,
) => {
  let sortKeyBooking, sharePayments;
  if (sortBy === 'byDate') {
    sharePayments = sharePaymentsByDate;
    sortKeyBooking = (log, pymt, prePymt) =>
      (log.id < pymt.paymentId ? prePymt : log.id) + log.id;
    // return (log, pymt) => pymt.paymentId + log.id;
    // return (log, pymt) => pymt.paymentId + log.bookingId.substr(1) + log.id;
  }
  if (sortBy === 'byPymt') {
    sharePayments = sharePaymentsByPayments;
    sortKeyBooking = (log, pymt) => pymt.paymentId + log.id;
    // return (log, pymt) => pymt.paymentId + log.bookingId.substr(1) + log.id;
  }
  const today = todaysDate();
  logit('preparePayments', payments);
  let lastPymt = '0000-00-00T00:00:00.000';
  let newList = [];
  (payments || []).forEach((payment) => {
    const pymt = { ...payment };
    const prePymt = datetimePrevSec(pymt.paymentId || pymt.refundId);
    let logs = [];
    pymt.historic = historic;

    const [pAllocs, cAllocs] = sharePayments(pymt);
    let bookings = {};
    (pymt.Allocations || []).forEach((a) => {
      if (a.Booking) bookings[a.Booking.bookingId] = a.Booking;
    });
    bookings = Object.values(bookings);

    bookings.forEach((bkng) => {
      const booking = { ...bkng };
      if (booking.walkId < 'W' + today) booking.historic = true;
      else pymt.historic = false;
      let late = false;
      let ruleAfter = false;
      booking.BookingLogs.forEach((log, i) => {
        const xtra = {
          dat: log.id,
          moved: log.id < lastPymt,
          type: 'book',
          src: 'pay',
        };
        if (log.req === 'BL') late = true;
        if (late || /^W/.test(log.req)) xtra.fee = 0;
        const pAlloc = pAllocs.find((a) => a.id === log.id);
        xtra.fee = pAlloc?.amount || 0;
        if (sortBy === 'byPymt') ruleAfter = ruleAfter || pAlloc?.ruleAfter;
        else xtra.ruleAfter = pAlloc?.ruleAfter;
        const cAlloc = cAllocs.find((a) => a.id === log.id);
        logit('can i find cAlloc', log.id, cAlloc, cAllocs, booking.owing);
        xtra.balance = cAlloc?.amount || 0;
        if (booking.owing !== 0) xtra.balance = -1 * booking.owing;
        logit('refresh', booking, log, pAlloc, cAlloc);
        const { fee, ...logx } = log;
        // if (log.fee !== booking.fee) xtra.fee = 0;
        const xLog = { ...booking, ...logx, ...xtra };
        xLog.sortKey = sortKeyBooking(xLog, pymt, prePymt);
        logs.push(xLog);
      });
      if (ruleAfter) _.last(logs).ruleAfter = true;
    });
    pymt.sortKey = sortKeyPayment(pymt);
    // pymt.balance = pymt.available;
    logs.push({ ...pymt, id: pymt.paymentId, type: 'pay' });
    logs = _.sortBy(logs, (l) => l.sortKey);
    // if (pymt.available === 0) _.last(logs).ruleAfter = true;

    if (trace) {
      logs.forEach((log) => {
        if (!log.fee) tracePayment(log);
        else traceBooking(log);
      });
      // logit('trace', ''.padEnd(80, '—'));
    }
    newList = [...newList, ...logs];
    lastPymt = pymt.paymentId || pymt.refundId;
  });
  return newList;
};
export const prepareRefunds = (refunds = [], sortBy, trace = false) => {
  logit('prepareRefunds', refunds);
  let newList = [];
  (refunds || []).forEach((rfnd) => {
    let logs = [];
    const xtra = {
      historic: true,
      sortKey: rfnd.refundId + rfnd.refundId,
      balance: rfnd.available,
      type: 'rfnd',
    };
    logs.push({ ...rfnd, id: rfnd.refundId, xtra });
    logs = _.sortBy(logs, (l) => l.sortKey);
    if (rfnd.available === 0) _.last(logs).ruleAfter = true;

    if (trace) {
      logs.forEach((log) => tracePayment(log));
    }
    newList = [...newList, ...logs];
  });
  return newList;
};

const sharePaymentsByPayments = (pymt) => {
  let paid = 0,
    credit = 0;
  let pAllocs = [];
  let cAllocs = [];
  logit('Payment Allocations', pymt.paymentId);
  let allocs = _.sortBy(pymt.Allocations, (a) => a.bookingId + a.bookingTransactionDate);
  console.table(allocs.map((a) => _.omit(a, ['paymentId', 'refundId', 'Booking'])));
  allocs = _.groupBy(allocs, (a) => a.bookingId);
  allocs = Object.values(allocs).map((bAllocs) => {
    let res = bAllocs.reduce(
      (res, alloc) => {
        const { amount, bookingTransactionDate } = alloc;
        return { amount: res.amount + amount, bookingTransactionDate };
      },
      { amount: 0 },
    );
    return res;
  });
  allocs = _.sortBy(allocs, (a) => a.bookingTransactionDate);
  logit('reduced allocations', allocs);
  allocs.forEach((alloc) => {
    let amount = alloc.amount;
    if (amount >= 0) {
      while (credit > 0 && amount > 0) {
        let cAlloc = cAllocs[0];
        logit('using credit', amount, cAlloc, alloc);
        let used = Math.min(amount, cAlloc.amount);
        amount -= used;
        credit -= used;
        cAlloc.amount -= used;
        logit(' to shift', used, credit, amount, cAlloc);
        if (cAlloc.amount === 0) cAllocs.shift();
      }
      if (amount >= 0) {
        paid += alloc.amount;
        pAllocs.push({ id: alloc.bookingTransactionDate, amount });
      }
    } else {
      amount *= -1;
      credit += amount;
      cAllocs.push({ id: alloc.bookingTransactionDate, amount });
    }
  });

  const lastPalloc = _.last(pAllocs);
  const lastCalloc = _.last(cAllocs);
  const last =
    lastCalloc?.bookingTransactionDate || '' > lastPalloc?.bookingTransactionDate || ''
      ? lastCalloc
      : lastPalloc;
  pymt.ruleAfter = pymt.paymentId > last.bookingTransactionDate;
  last.ruleAfter = !pymt.ruleAfter;
  pymt.balance = Math.max(pymt.amount - paid, 0);

  logit('p&c Allocs', credit, paid, pymt.available, pAllocs, cAllocs);
  return [pAllocs, cAllocs];
};
const sharePaymentsByDate = (pymt) => {
  let paid = 0,
    credit = 0;
  let pAllocs = [];
  let cAllocs = [];
  logit('Payment Allocations', pymt.paymentId);
  const allocs = _.sortBy(pymt.Allocations, (a) => a.id);
  console.table(allocs.map((a) => _.omit(a, ['paymentId', 'refundId', 'Booking'])));
  allocs.forEach((alloc) => {
    let amount = alloc.amount;
    if (amount > 0) {
      while (credit > 0 && amount > 0) {
        let cAlloc = cAllocs[0];
        logit('using credit', amount, cAlloc, alloc);
        let used = Math.min(amount, cAlloc.amount);
        amount -= used;
        credit -= used;
        cAlloc.amount -= used;
        logit(' to shift', used, credit, amount, cAlloc);
        if (cAlloc.amount === 0) cAllocs.shift();
      }
      if (amount > 0) {
        paid += alloc.amount;
        pAllocs.push({ id: alloc.bookingTransactionDate, amount });
      }
      if (pymt.amount - paid + credit === 0 && amount > 0) {
        logit('ruleAfter?', pymt.paymentId > alloc.bookingTransactionDate, pymt, alloc);
        if (pymt.paymentId > alloc.bookingTransactionDate) {
          pymt.ruleAfter = true;
        } else _.last(pAllocs).ruleAfter = true;
      }
    } else {
      amount *= -1;
      credit += amount;
      cAllocs.push({ id: alloc.bookingTransactionDate, amount });
    }
  });
  pymt.balance = Math.max(pymt.amount - paid, 0);

  logit('p&c Allocs', credit, paid, pymt.available, pAllocs, cAllocs);
  return [pAllocs, cAllocs];
};

function traceBooking(booking) {
  if (booking.ruleBefore) logit('trace', ''.padEnd(80, '—'));
  const { fee, name, venue, req } = booking;
  let money = '';
  let showBalance = '';
  if (fee) {
    money = sprintf(' £%3d ', fee);
    showBalance = booking.owing > 0 ? sprintf('  £%3d ', booking.owing) : '';
  }

  const what = sprintf('%-2s %s', req, money);
  logit(
    'trace',
    `${booking.id} ${venue}${name} `.padEnd(40).substr(0, 40),
    what.padEnd(20),
    showBalance,
  );
}
function tracePayment(payment) {
  const { paymentId, refundId, amount, req, available } = payment;
  const what = sprintf('%-2s  £%3d', req, amount);
  const showBalance = available ? sprintf('  £%3d', available) : '';
  logit('trace', `${paymentId || refundId} `.padEnd(40), what.padStart(20), showBalance);
  if (payment.ruleAfter) logit('trace', ''.padEnd(80, '—'));
}
