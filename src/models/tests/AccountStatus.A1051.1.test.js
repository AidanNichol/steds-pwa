import { Store } from '../Store';
import { Account } from '../Account';
import { resolveIdentifier } from 'mobx-state-tree';
import { testStore } from './testdata/A1049 statusTestData';
import { FundsManager } from '../fundsManager';
import 'colors';
import { showResults /* , logTable */ } from './testUtilities';

const trace = true;

const traceMe = false;

// describe('TestCase', function() {
//   var mySpec = it('should return the spec', function() {
//     console.log(mySpec);
//     expect(mySpec.getFullName()).toEqual('TestCase should return the spec');
//   });
// });

describe('Bookings out of sequence and paid for individually', () => {
  const funds = new FundsManager(false);
  let balance = 0;
  let canHide = true;
  const store = Store.create(testStore, { useFullHistory: true });
  const account = resolveIdentifier(Account, store.AS, 'A1051');
  console.log('Payment Start:'.blue, store.BP.lastPaymentsBanked.cyan.bold);
  test('check 1st log payment', () => {
    expect(account._id).toBe('A1051');
    let aLog = account.logs[0];
    expect(aLog.req).toBe('P');
  });
  test('set up bookings for A1051', () => {
    expect(account.bookings.size).toBe(0);
    store.WS.addToBookingIndex();
    expect(account.bookings.size).toBe(3);
    store.AS.categorizeAllBookingLogs();
    expect(account.historicLogs.length).toBe(0);
    expect(account.unclearedBookings.length).toBe(3);
    let bLogs = [...account.unclearedBookings];
    expect(bLogs.length).toBe(3);
    expect(account.logs.length).toBe(3);
    showResults(account, 'At start', trace, true);
  });
  describe('test A1051 processLogs', () => {
    let lastRes;
    test('Processing Payment 1', () => {
      let aLog = account.logs[0];
      let bLogs = [...account.unclearedBookings];
      expect(aLog.dat).toBe('2019-02-02T14:54:11.655');
      funds.addPayment(aLog);
      // expect(account.unresolvedPayments.length).toBe(1);
      const res = account.testProcessLogs({
        bLogs,
        funds,
        traceMe,
        balance,
        canHide,
        aLog
      });
      lastRes = res;
      canHide = res.hideable;
      // expect(item.walk.venue).toBe('xxx');
      showResults(res, 'After  payment 1', trace);
      expect(res.hideable).toBe(false);
      expect(res.resolvedLogs.length).toBe(2);
      expect(res.unresolvedLogs.length).toBe(2);
      expect(res.unresolvedLogs[0].delayedDat).toBe('2019-02-02T14:54:11.656');
      expect(res.unresolvedLogs[0].dat).toBe('2019-01-17T19:17:39.570');
      expect(res.unresolvedLogs[1].dat).toBe('2019-01-20T18:40:32.107');

      expect(res.restartPt).toBe(true);
      expect(res.balance).toBe(0);
    });
    test('Processing Payment 2', () => {
      let aLog = account.logs[1];
      let bLogs = [...lastRes.unresolvedLogs];

      funds.addPayment(aLog);
      // expect(account.unresolvedPayments.length).toBe(1);
      const res = account.testProcessLogs({
        bLogs,
        funds,
        traceMe,
        balance,
        canHide,
        aLog
      });
      // expect(item.walk.venue).toBe('xxx');
      lastRes = res;
      canHide = res.hideable;

      showResults(res, 'After payment 2', trace);
      expect(res.hideable).toBe(false);
      expect(aLog.hideable).toBe(false);

      expect(res.resolvedLogs.length).toBe(2);
      expect(res.unresolvedLogs.length).toBe(1);
      expect(res.unresolvedLogs[0].delayedDat).toBe('2019-02-16T14:54:11.656');
      expect(res.unresolvedLogs[0].dat).toBe('2019-01-17T19:17:39.570');
      expect(res.restartPt).toBe(true);
      expect(res.balance).toBe(0);
    });
    test('Processing Payment 3', () => {
      let aLog = account.logs[2];
      let bLogs = [...lastRes.unresolvedLogs];

      funds.addPayment(aLog);
      // expect(account.unresolvedPayments.length).toBe(1);
      const res = account.testProcessLogs({
        bLogs,
        funds,
        traceMe,
        balance,
        canHide,
        aLog
      });
      // expect(item.walk.venue).toBe('xxx');
      lastRes = res;
      canHide = res.hideable;

      showResults(res, 'After payment 3', trace);
      expect(res.hideable).toBe(false);

      expect(res.resolvedLogs.length).toBe(2);
      expect(res.unresolvedLogs.length).toBe(0);
      expect(res.restartPt).toBe(true);
      expect(res.balance).toBe(0);
    });
    test('Processing outstanding stuff (no Payment)', () => {
      const bLogs = lastRes.unresolvedLogs;
      expect(lastRes.unresolvedLogs.length).toBe(0);
      // expect(res.resolvedLogs.length).toBe(2);
      // expect(bLogs.length).toBe(1);

      const res = account.testProcessLogs({
        bLogs,
        funds,
        traceMe,
        balance: 0,
        canHide
      });
      showResults(res, 'After use up credits?', trace);

      expect(res.hideable).toBe(false);
      expect(res.resolvedLogs.length).toBe(0);
      expect(res.unresolvedLogs.length).toBe(0);
      expect(res.balance).toBe(0);
    });
  });
});
