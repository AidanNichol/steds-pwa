import { Store } from '../Store';
import { Account } from '../Account';
import { resolveIdentifier } from 'mobx-state-tree';
import { testStore } from './testdata/A1052 statusTestData';
import { FundsManager } from '../fundsManager';
import { showResults } from './testUtilities';

import chalk from 'chalk';
const trace = true;

const traceMe = false;

// describe('TestCase', function() {
//   var mySpec = it('should return the spec', function() {
//     console.log(mySpec);
//     expect(mySpec.getFullName()).toEqual('TestCase should return the spec');
//   });
// });

describe('Booking paid then cancelled. Credit used by new walk', () => {
  const funds = new FundsManager(false);
  let balance = 0;
  let canHide = true;
  const store = Store.create(testStore, { useFullHistory: true });
  const account = resolveIdentifier(Account, store.AS, 'A1052');
  console.log(chalk.blue('Payment Start:'), chalk.cyan.bold(store.BP.lastPaymentsBanked));
  test('check 1st log payment', () => {
    expect(account._id).toBe('A1052');
    let aLog = account.logs[0];
    expect(aLog.req).toBe('P');
  });
  test('set up bookings for A1052', () => {
    store.WS.addToBookingIndex();
    expect(account.bookings.size).toBe(3);
    store.AS.categorizeAllBookingLogs();
    expect(account.historicLogs.length).toBe(0);
    expect(account.unclearedBookings.length).toBe(5);
    let bLogs = [...account.unclearedBookings];
    expect(bLogs.length).toBe(5);
    expect(account.logs.length).toBe(1);
    showResults(account, 'at start', trace, true);
  });
  describe('test A1052 processLogs', () => {
    let lastRes;
    test('Processing Payment 1', () => {
      let aLog = account.logs[0];
      let bLogs = [...account.unclearedBookings];
      expect(aLog.dat).toBe('2018-12-31T14:54:11.655');
      funds.addPayment(aLog);
      // expect(account.unresolvedPayments.length).toBe(1);
      expect(canHide).toBe(true);
      const res = account.testProcessLogs({
        bLogs,
        funds,
        traceMe,
        balance,
        hideable: canHide,
        aLog
      });
      lastRes = res;
      canHide = res.hideable;
      // expect(item.walk.venue).toBe('xxx');
      showResults(res, 'after payment 1', trace);
      expect(res.resolvedLogs.length).toBe(2);
      expect(res.unresolvedLogs.length).toBe(4);
      // expect(res.unresolvedLogs[0].dat).toBe('2019-01-17T19:17:39.570');
      // expect(res.unresolvedLogs[1].dat).toBe('2019-01-20T18:40:32.107');
      expect(canHide).toBe(true);
      expect(res.restartPt).toBe(true);
      expect(res.balance).toBe(0);
    });
    test('Processing outstanding stuff (use credit)', () => {
      const bLogs = lastRes.unresolvedLogs;
      funds.resetNewFunds();
      expect(lastRes.unresolvedLogs.length).toBe(4);
      // expect(res.resolvedLogs.length).toBe(2);
      // expect(bLogs.length).toBe(1);

      const res = account.testProcessLogs({
        bLogs,
        funds,
        traceMe,
        balance: 0,
        hideable: canHide
      });
      lastRes = res;
      canHide = res.hideable;
      showResults(res, 'After use up credits', trace);

      expect(res.resolvedLogs.length).toBe(4);
      expect(res.unresolvedLogs.length).toBe(0);
      expect(res.resolvedLogs[2].hideable).toBe(false);
      expect(res.resolvedLogs[0].hideable).toBe(true);
      expect(funds.balance).toBe(0);
      expect(res.balance).toBe(0);
    });
  });
});
