import { Store } from '../Store';
import { Account } from '../Account';
import { resolveIdentifier } from 'mobx-state-tree';
import { testStore } from './testdata/A1049.all.testData';
import { FundsManager } from '../fundsManager';
import 'colors';
import { showResults /* , logTable */ } from './testUtilities';
import { A1049Walks } from './testdata/A1049.all.bookings';

const trace = true;

const traceMe = false;

// describe('TestCase', function() {
//   var mySpec = it('should return the spec', function() {
//     console.log(mySpec);
//     expect(mySpec.getFullName()).toEqual('TestCase should return the spec');
//   });
// });
describe('setup tear down test', () => {
  beforeAll(() => console.log('1 - beforeAll'));
  afterAll(() => console.log('1 - afterAll'));
  beforeEach(() => console.log('1 - beforeEach'));
  afterEach(() => console.log('1 - afterEach'));
  test('', () => console.log('1a - test'));
  test('', () => console.log('1b - test'));
  describe('Scoped / Nested block', () => {
    beforeAll(() => console.log('2 - beforeAll'));
    afterAll(() => console.log('2 - afterAll'));
    beforeEach(() => console.log('2 - beforeEach'));
    afterEach(() => console.log('2 - afterEach'));
    test('', () => console.log('2a - test'));
    test('', () => console.log('2b - test'));
  });
});

console.log(testStore.WS.walks.length);
let funds, balance, canHide, store, account, lastRes;
describe('Bookings all AJN - test individually', () => {
  beforeAll(() => {
    funds = new FundsManager(false);
    balance = 0;
    canHide = true;
    store = Store.create(testStore, { useFullHistory: true });
    account = resolveIdentifier(Account, store.AS, 'A1049');
    store.WS.addToBookingIndex();
    store.AS.categorizeAllBookingLogs();
  });
  describe('check initail setup', () => {
    test('all the walks are loaded', () => {
      expect(store.WS.walks.length).toBe(42);
    });
    test('all the walks are loaded', () => {
      expect(store.WS.walks.length).toBe(A1049Walks.length);
    });
    test('check 1st log payment', () => {
      console.log(
        'reStart:'.blue,
        account.firstRestart.cyan.bold,
        account.lastRestart.cyan.bold,
        account.bookings.size
      );
      console.log('Payment Start:'.blue, store.BP.lastPaymentsBanked.cyan.bold);
      showResults(account, 'At Start', trace, true);

      expect(account._id).toBe('A1049');
      let aLog = account.logs[0];
      expect(aLog.req).toBe('P');
    });
    test('first restart not set', () => {
      expect(account.firstRestart).toBe('0000-00-00');
    });
    test('last restart not set', () => {
      expect(account.lastRestart).toBe('0000-00-00');
    });
    test('bookings to be there', () => {
      let bLogs = [...account.currentLogs];
      expect(bLogs.length).toBe(53);
    });
    test('bookings to be right', () => {
      expect(account.bookings.size).toBe(42);
    });
    test('historicLogs to be right', () => {
      expect(account.historicLogs.length).toBe(0);
    });
    test('currentLogs to be right', () => {
      expect(account.currentLogs.length).toBe(53);
    });
    test('Payment logs to be right', () => {
      expect(account.logs.length).toBe(28);
    });
  });
  describe('Processing payment 1', () => {
    let aLog, bLogs, res;
    beforeAll(() => {
      aLog = account.logs[0];
      bLogs = [...account.currentLogs];
      expect(aLog.dat).toBe('2016-10-31T14:54:11.655');
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
      lastRes = res;
      canHide = res.hideable;
    });
    test('Processing Payment 1', () => {
      // expect(item.walk.venue).toBe('xxx');
      showResults(res, 'After  payment 1', trace);
    });
    test('Still hideable', () => {
      expect(res.hideable).toBe(false);
    });
    test('right no of recs in resolved', () => {
      expect(res.resolvedLogs.length).toBe(2);
    });
    test('right no. of records in unresolved', () => {
      expect(res.unresolvedLogs.length).toBe(52);
    });
    test('should be a restart point', () => {
      expect(res.restartPt).toBe(true);
      expect(res.balance).toBe(0);
    });
  });
  describe('Processing Payment 2', () => {
    let res;
    beforeAll(() => {
      let aLog = account.logs[1];
      let bLogs = [...lastRes.unresolvedLogs];

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
      // expect(item.walk.venue).toBe('xxx');
      lastRes = res;
      canHide = res.hideable;
    });
    test('Processing Payment 2', () => {
      // expect(item.walk.venue).toBe('xxx');
      showResults(res, 'After  payment 2', trace);
    });
    test('Still hideable', () => {
      expect(res.hideable).toBe(false);
    });
    test('right no of recs in resolved', () => {
      expect(res.resolvedLogs.length).toBe(2);
    });
    test('right no. of records in unresolved', () => {
      expect(res.unresolvedLogs.length).toBe(52);
    });
    test('should be a restart point', () => {
      expect(res.restartPt).toBe(true);
      expect(res.balance).toBe(0);
    });
    showResults(res, 'After payment 2', trace);
  });
  describe.skip('Processing Payment 3', () => {
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
  describe.skip('Processing outstanding stuff (no Payment)', () => {
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
