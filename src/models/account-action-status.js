import { getRoot } from 'mobx-state-tree';
import _ from 'lodash';
import { FundsManager } from './fundsManager';
import { DS } from './MyDateFns.js';

const R = require('ramda');
const logit = require('logit')('store/account/accountStatus');
export const actions = self => ({
  testProcessLogs(...args) {
    return processLogs(...args);
  },

  accountStatusNew() {
    const root = getRoot(self);
    let traceMe = false;
    traceMe = process.env.NODE_ENV === 'development' && self._id === 'A2065';
    // traceMe = true;

    var paymentPeriodStart = root.BP.lastPaymentsBanked;
    const historicLogs = [];
    let currentLogs = [];

    const funds = new FundsManager(traceMe);
    let balance = 0;

    let bLogs = [...self.currentBookings].filter(log => log.type !== 'A').sort(cmpDate);
    let aLogs = self.currentPayments.slice().sort(cmpDate);

    aLogs = aLogs.filter(log => log.req[0] !== '_');

    let activeThisPeriod = false;
    let hideable = true;
    for (let i = 0; i < aLogs.length; i++) {
      const aLog = aLogs[i];
      aLog.activeThisPeriod = aLog.dat > paymentPeriodStart;
      hideable = hideable && !aLog.activeThisPeriod;
      traceMe && logit('alog', aLog);
      // setSomeFlags(aLog);

      funds.addPayment(aLog);
      // logit('preProcessLogs', balance, hideable, bLogs.length, aLog.dat);
      const res = processLogs({ bLogs, funds, traceMe, balance, hideable, aLog }, i);
      balance = res.balance;
      hideable = res.hideable;

      if (balance !== 0) funds.transferSurplusToCredit();
      if (res.restartPt && hideable) {
        historicLogs.push(...currentLogs, ...res.resolvedLogs);
        currentLogs = [];
      } else {
        currentLogs.push(...res.resolvedLogs);
      }

      bLogs = res.unresolvedLogs;
    }
    /*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃   Bookings uncleared - check for clearance via credit    ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ */
    funds.resetNewFunds();
    const res = processLogs({ bLogs, funds, traceMe, balance, hideable });
    traceMe && logit('uncleared stuff', res);
    balance = res.balance;
    hideable = res.hideable;

    if (res.restartPt && hideable) {
      historicLogs.push(...currentLogs, ...res.resolvedLogs);
      currentLogs = [];
    } else {
      currentLogs.push(...res.resolvedLogs);
    }

    /*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃       uncleared Bookings - calculate final balance       ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ */
    hideable = false;
    balance = funds.balance;
    res.unresolvedLogs.forEach(log => {
      balance -= log.amount;
      log.update({ hideable, outstanding: true });
    });

    self.activeThisPeriod = activeThisPeriod || funds.activeThisPeriod;
    self.funds = funds;
    self.balance = balance;
    currentLogs.push(...res.unresolvedLogs);
    self.historicLogs = [...self.historicLogs, ...historicLogs];
    self.currentLogs = currentLogs;

    historicLogs.forEach(log => (log.historic = true));
    self.currentBookings = self.currentBookings.filter(log => !log.historic);
    self.currentPayments = self.currentPayments.filter(log => !log.historic);
    // self.extractUnresolvedWalks();
    // logit('returning', self.name, self);
    return true;
  }
});

export function processLogs(args) {
  const { bLogs, funds, traceMe, aLog } = args;
  let { balance } = args;
  const resolvedLogs = [];
  const unresolvedLogs = [];
  let clearedLogs = [];
  let prevBalance = balance;
  let hideable = !!args.hideable;
  let availBlogs = aLog ? bLogs.filter(log => log.dat < aLog.dat) : bLogs;
  availBlogs = _.values(_.groupBy(walkSort(availBlogs), log => log.bookingId));
  let futureLogs = aLog ? bLogs.filter(log => log.dat >= aLog.dat) : [];
  /*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃   check all uncleared bookings logs                      ┃
    ┃   at the time of the payment and clear what we can       ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ */
  // traceMe && logit('availBlogs', availBlogs[0]);
  // if (availBlogs[0] && !availBlogs[0][0].walk) logit('bad Blog', availBlogs[0]);
  // let oldestWalk; = availBlogs[0] && availBlogs[0][0].walk._id;
  let oldestWalk;
  while (availBlogs.length > 0) {
    let wLogs = availBlogs.shift(); // all current log records for a walk
    if (!wLogs[0].walk) logit('bad wLogs', wLogs);
    if (!wLogs[0].walk.closed) hideable = false;
    if (!oldestWalk) oldestWalk = wLogs[0].walk._id;

    let paid = funds.applyToThisWalk(wLogs);
    traceMe && logit('wlogs post funds', hideable, paid, wLogs);
    if (!paid) {
      // not enough funds to clear this walk
      availBlogs.unshift(wLogs); // haven't used so put it back
      break;
    }
    clearedLogs.push(...wLogs);
    if (!funds.okToAddDummyPayments || (aLog && _.isEmpty(availBlogs))) continue;

    //┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    //┃   zero balance point reach using credits                 ┃
    //┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

    [, clearedLogs] = reSortAndAdjustBalance(clearedLogs, prevBalance);
    hideable = clearedLogs.reduce((res, log) => res && log.hideable, hideable);
    const last = _.last(clearedLogs);
    updateLogs(clearedLogs, { hideable, clearedBy: last.dat });
    last.update({ restartPt: true });
    funds.realActivity = false;
    resolvedLogs.push(...clearedLogs);
    clearedLogs = [];
    prevBalance = 0;
  }
  //┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
  //┃   Return all unused booking logs to be available for next payment ┃
  //┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
  if (availBlogs.length > 0) {
    let delayedDat = aLog ? DS.datetimePlus1(aLog.dat) : undefined;
    futureLogs.unshift(
      ..._.flatten(availBlogs)
        .map(log => {
          delayedDat && log.update({ delayedDat });
          return log;
        })
        .sort(cmpDate)
    );
  }
  //┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
  //┃   re-sort the cleared logs into date order and recalulate balance ┃
  //┃   Add the cleared logs to the appropriate pile                    ┃
  //┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
  [, clearedLogs] = reSortAndAdjustBalance(clearedLogs, prevBalance, funds.balance, aLog);
  traceMe && logit('post resort', prevBalance, funds.balance);
  traceMe && logit('post resort', clearedLogs);
  hideable = clearedLogs.reduce((res, log) => res && log.hideable, hideable);
  updateLogs(clearedLogs, { hideable });

  if (aLog || balance === 0) {
    resolvedLogs.push(...clearedLogs);
  } else unresolvedLogs.push(...clearedLogs);
  //┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
  //┃   if there's a payment log then add it to resolved                ┃
  //┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
  const restartPt = balance === 0;
  if (aLog) {
    aLog.update({ balance, toCredit: -balance, hideable, oldestWalk, restartPt });
    resolvedLogs.push(aLog);
  }
  unresolvedLogs.push(...futureLogs);
  if (balance !== 0) funds.transferSurplusToCredit();
  traceMe &&
    !aLog &&
    logit('end ProcessLogs', {
      resolvedLogs,
      unresolvedLogs,
      balance,
      hideable,
      restartPt
    });
  return { resolvedLogs, unresolvedLogs, balance, hideable, restartPt };
}

/*-------------------------------------------------*/
/*                                                 */
/*         Helper Functions                   */
/*                                                 */
/*-------------------------------------------------*/

const updateLogs = (logs, patch) => {
  return logs.map(log => log.update(patch));
};

function reSortAndAdjustBalance(clearedLogs, prevBalance, endBalance = 0, aLog) {
  if (clearedLogs.length === 0) return [prevBalance, clearedLogs];
  const sLogs = clearedLogs.sort(cmpDate);
  let balance = prevBalance;
  let clearedBy;
  if (endBalance === 0) {
    clearedBy = aLog ? aLog.dat : _.last(sLogs).dat;
  }
  sLogs.forEach(log => {
    if (log.type === 'A') return;
    balance -= log.amount || 0;
    const upd = { balance, outstanding: false, clearedBy: log.clearedBy || clearedBy };
    log.update(upd);
  });
  return [balance, sLogs];
}

var coll = new Intl.Collator();
var cmpDate = (a, b) => coll.compare(a.dat, b.dat);

var walkSort = R.sortWith([R.ascend(R.prop('walkId')), R.ascend(R.prop('dat'))]);
// var cmpDate = R.sortWith([R.ascend(R.prop('dat'))]);
