import { Store } from '../Store';
import { testStore } from './testdata/A1049 statusTestData';
import { FundsManager } from '../fundsManager';
import { toJS } from 'mobx';
const name = {
  activeThisPeriod: 'active',
  restartPt: 'RS',
  outstanding: 'outst..g',
  chargeable: 'charge'
};
const cleanup = arr => {
  return arr.map(it => {
    const ot = {};
    Object.entries(toJS(it)).forEach(([key, val]) => {
      if (
        ['machine', 'who', 'note', 'dispDate', 'paid', 'toCredit', 'historic'].includes(
          key
        )
      )
        return;
      if (val !== undefined) ot[name[key] || key] = val;
    });
    return ot;
  });
};
const traceMe = false;

const funds = new FundsManager(false);
let balance = 0;
let canHide = 0;

describe('Can correctly', () => {
  const store = Store.create(testStore, { useFullHistory: true });
  const account = store.AS.accounts[0];

  test('check 1st log payment', () => {
    expect(account._id).toBe('A1049');
    let aLog = account.logs[0];
    expect(aLog.req).toBe('P');
  });
  test('set up bookings for A1049', () => {
    expect(account.bookings.size).toBe(0);
    store.WS.addToBookingIndex();
    expect(account.bookings.size).toBe(1);
    store.AS.categorizeAllBookingLogs();
    expect(account.historicLogs.length).toBe(0);
    expect(account.currentLogs.length).toBe(2);
    let bLogs = [...account.currentLogs];
    expect(bLogs.length).toBe(2);
    expect(account.logs.length).toBe(1);
  });
  describe('test A1049 processLogs', () => {
    let res;
    test('Processing Payment status', () => {
      let aLog = account.logs[0];
      let bLogs = [...account.currentLogs];

      funds.addPayment(aLog);
      // expect(account.unresolvedPayments.length).toBe(1);
      res = account.testProcessLogs({
        bLogs,
        funds,
        traceMe,
        balance,
        canHide,
        aLog
      });
      let { resolvedLogs, unresolvedLogs, restartPt } = res;
      // expect(item.walk.venue).toBe('xxx');
      console.log('resolvedLogs');
      console.table(cleanup(resolvedLogs));
      console.table(cleanup(unresolvedLogs));
      console.log('unresolvedLogs\n\n\n');
      expect(res.resolvedLogs.length).toBe(2);
      expect(res.unresolvedLogs.length).toBe(1);
      expect(restartPt).toBe(true);
      expect(res.balance).toBe(0);
    });
    test('Processing outstanding stuff (no Payment)', () => {
      const bLogs = res.unresolvedLogs;
      expect(res.unresolvedLogs.length).toBe(1);
      expect(res.resolvedLogs.length).toBe(2);
      expect(bLogs.length).toBe(1);

      const res2 = account.testProcessLogs({
        bLogs,
        funds,
        traceMe,
        balance: 0,
        canHide
      });
      console.log('resolvedLogs');
      console.table(cleanup(res2.resolvedLogs));
      console.table(cleanup(res2.unresolvedLogs));
      console.log('funds', funds);
      console.log('\n\n');
      console.log('unresolvedLogs');
      expect(res2.resolvedLogs.length).toBe(0);
      expect(res2.unresolvedLogs.length).toBe(1);
      expect(res2.restartPt).toBe(false);
      expect(res2.balance).toBe(8);
    });
  });
});
