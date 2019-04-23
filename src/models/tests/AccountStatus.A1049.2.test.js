import { Store } from '../Store';
import { Account } from '../Account';
import { resolveIdentifier } from 'mobx-state-tree';
import { testStore } from './testdata/A1049.all.testData';
import { showResults, logTable } from './testUtilities';
import _ from 'lodash';
import 'colors';

const traceMe = true;

describe('Bookings out of sequence and paid for individually - accountStatusNew', () => {
  let store = Store.create(testStore, { useFullHistory: true });
  let account = resolveIdentifier(Account, store.AS, 'A1049');
  store.WS.addToBookingIndex();
  store.AS.categorizeAllBookingLogs();
  console.log('Payment Start:'.red, store.BP.lastPaymentsBanked.cyan.bold);
  describe('account bookings set up', () => {
    showResults(account, 'at Start', traceMe, true);
    test('bookings setup correctly', () => {
      expect(account.bookings.size).toBe(42);
      expect(account.unclearedBookings.length).toBe(56);
      expect(account.historicLogs.length).toBe(0);
    });
    test('Accounts setup correctly', () => {
      expect(account.logs.length).toBe(28);
      expect(account.unclearedPayments.length).toBe(28);
    });
    test('payment after last banking not flagged as hideable', () => {
      expect(_.last(account.logs).hideable).toBe(false);
    });
  });
  describe('accountStatusNew', () => {
    let store = Store.create(testStore, { useFullHistory: true });
    let account = resolveIdentifier(Account, store.AS, 'A1049');
    store.WS.addToBookingIndex();
    store.AS.categorizeAllBookingLogs();
    account.accountStatusNew();
    showResults(account, 'after accountStatusNew', traceMe);
    console.log('\n\n\n');
    test('content of historicLogs', () => {
      expect(account.historicLogs.length).toBe(69);
    });
    test('content of currentLogs', () => {
      expect(account.currentLogs.length).toBe(3);
    });
    test('content of recentLogs', () => {
      expect(account.recentLogs.length).toBe(0);
    });
    test('content of unclearedPayments', () => {
      expect(account.unclearedPayments.length).toBe(0);
    });
    test('balance is zero', () => {
      expect(account.balance).toBe(12);
    });

    const crUsed = account.historicLogs[29];
    test('clearing credit is restartPt', () => {
      expect(crUsed.restartPt).toBe(true);
    });
    test('clearing credit is zero balance', () => {
      expect(crUsed.balance).toBe(0);
    });
    test('clearing credit is booking', () => {
      expect(crUsed.req).toBe('B');
    });
    test('clearing credit is clearedBy', () => {
      expect(crUsed.clearedBy).toBe(crUsed.dat);
    });
    describe.skip('second run of AccountSatusNew', () => {
      account.accountStatusNew();
      showResults(account, '2nd after accountStatusNew', traceMe);
    });
  });
});
