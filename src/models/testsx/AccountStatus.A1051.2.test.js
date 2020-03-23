import { Store } from '../Store';
import { Account } from '../Account';
import { resolveIdentifier } from 'mobx-state-tree';
import { testStore } from './testdata/A1049 statusTestData';
import { showResults } from './testUtilities';
import 'colors';

const traceMe = true;

describe('Bookings out of sequence and paid for individually - accountStatusNew', () => {
  let store = Store.create(testStore, { useFullHistory: true });
  let account = resolveIdentifier(Account, store.AS, 'A1051');
  store.WS.addToBookingIndex();
  store.AS.categorizeAllBookingLogs();
  console.log('Payment Start:'.red, store.BP.lastPaymentsBanked.cyan.bold);
  describe('account bookings set up', () => {
    showResults(account, 'at Start', traceMe, true);
    test('bookings setup correctly', () => {
      expect(account.bookings.size).toBe(3);
      expect(account.unclearedBookings.length).toBe(3);
      expect(account.historicLogs.length).toBe(0);
    });
    test('Accounts setup correctly', () => {
      expect(account.logs.length).toBe(3);
      expect(account.unclearedPayments.length).toBe(3);
    });
    test('payment after last banking not flagged as hideable', () => {
      expect(account.logs[2].hideable).toBe(false);
    });
  });
  describe('accountStatusNew', () => {
    let store = Store.create(testStore, { useFullHistory: true });
    let account = resolveIdentifier(Account, store.AS, 'A1051');
    store.WS.addToBookingIndex();
    store.AS.categorizeAllBookingLogs();
    account.accountStatusNew();
    showResults(account, 'after accountStatusNew', traceMe);
    test('content of historicLogs', () => {});
    test('content of unclearedBookings', () => {});
    test('content of mergededLogs', () => {});
    test('content of currentPayments', () => {});
  });
});
