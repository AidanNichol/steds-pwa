import {
  types,
  resolveIdentifier,
  getRoot,
  getSnapshot,
  getEnv,
  flow,
  destroy,
  decorate,
  detach,
  onPatch,
} from 'mobx-state-tree';
import { atomic /* actionLogger */ } from 'mst-middlewares';

import { Member } from './Member';
import { Booking } from './Booking';
import { AccountLog } from './AccountLog.js';
// import { actions } from './account-action-status.js';
import { DS } from '../models/MyDateFns';
import { sprintf } from 'sprintf-js';
import { traceIt } from './traceIt';

// import * as R from 'ramda';

// import _ from 'lodash';
const logit = require('logit')('store:account/account');

// const AccountId = types.refinement(types.string, id => /^A\d+$/.test(id));

//┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
//┃   Account Model                                          ┃
//┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
// const loadedAt = new Date();

export const Account = types
  .model('Account', {
    _id: types.refinement(types.identifier, id => /^A\d+$/.test(id)),
    _rev: types.string,
    type: types.literal('account'),
    logs: types.array(AccountLog),
    members: types.array(types.reference(types.late(() => Member))),
  })
  .preProcessSnapshot(snapshot => {
    if (!snapshot.logs) {
      console.log('no account logs!!!', snapshot);
      return { ...snapshot, logs: [] };
    }
    return snapshot;
  })
  .volatile(() => ({
    bookings: new Set(),
    historicLogs: [],
    currentLogs: [],
    currentBookings: [],
    currentPayments: [],
    balance: 0,
    lastRestart: '',
    firstRestart: '',
    unresolvedWalks: new Set(),
    dirty: false,
    openingCredit: 0,
  }))
  .views(self => ({
    get activeThisPeriod() {
      return self.currentLogs.find(log => log.activeThisPeriod) ? true : false;
    },
    get mergedLogs() {
      return [...self.historicLogs, ...self.currentLogs];
    },

    get name() {
      return self.getName();
    },
    getName(rev = false) {
      let nameMap = self.members.reduce((value, mem) => {
        let lName = mem.lastName;
        value[lName] = [...(value[lName] || []), mem.firstName];
        return value;
      }, {});
      return Object.entries(nameMap)
        .map(([lName, fName]) =>
          rev ? `${lName}, ${fName.join(' & ')}` : `${fName.join(' & ')} ${lName}`,
        )
        .join(' & ');
    },
    get sortname() {
      return self.getName(true);
    },
    get memberNames() {
      return self.members.map(mem => mem.fullName);
    },
    get bookingLogs() {
      const logs = [];
      const root = getRoot(self);
      self.bookings.forEach(bkngId => {
        logs.push(...resolveIdentifier(Booking, root, bkngId).logs);
      });
      return logs;
    },
    get debt() {
      return self.currentLogs.filter(log => log.outstanding);
    },
    get unclearedBookings() {
      return self.currentLogs.filter(bkng => bkng.outstanding && bkng.amount !== 0);
    },

    dumpData() {
      const { balance, activeThisPeriod, currentLogs, _id, name } = self;
      const data = { _id, name, balance, activeThisPeriod };

      data.logs = currentLogs.map(log => log.showLog());
      return data;
    },
    showLogs(which, limit, trace) {
      if (!trace) return;
      let logs = self[which];
      if (limit) logs = logs.slice(-limit);
      logit(which);
      logit.table(logs.map(log => log.showLog()));
    },
    showLogSizes(trace) {
      if (!trace) return;
      const shwIt = it => sprintf(' %s: %03d,', it, self[it].length);
      return ['historicLogs', 'currentLogs', 'currentBookings', 'currentPayments'].reduce(
        (txt, item) => txt + shwIt(item),
        'Sizes ',
      );
    },
    showAllLogs(text, limit, trace) {
      if (!trace) return;
      console.group(text);
      ['historicLogs', 'currentLogs', 'currentBookings', 'currentPayments'].forEach(
        item => {
          self.showLogs(item, limit, trace);
        },
      );

      console.groupEnd();
    },
  }))
  .actions(require('./account-action-status.js').actions)
  .actions(self => {
    function makePayment(amount, note, req) {
      // doer = yield select((state)=>state.signin.memberId);
      const log = AccountLog.create({ req, dat: DS.getLogTime(), amount, note });

      self.logs.push(log);
      self.dbUpdate();
      self.currentPayments.push(log);
      self.accountStatusNew();
    }
    function deletePayment(log) {
      detach(log);
      self.dbUpdate();
      self.resetRecent(log.dat);
      destroy(log);
    }
    return {
      makePayment: decorate(atomic, makePayment),
      deletePayment: decorate(atomic, deletePayment),
    };
  })

  .actions(self => ({
    update(updates) {
      Object.entries(updates).forEach(([key, value]) => (self[key] = value));
      return self;
    },
    updateWithDoc(accDoc) {
      if (accDoc._rev === self._rev) return;
      const { logs: docLogs, ...rest } = accDoc;
      self.update(rest);
      docLogs.forEach(docLog => {
        let accLog = self.logs.find(log => log.dat === docLog.dat);
        if (!accLog) {
          logit('creating log', docLog);
          accLog = AccountLog.create(docLog);
          self.attachLog(accLog);
          self.currentPayments.push(accLog);
        }
        accLog.update(docLog);
      });
    },
    dbUpdate: flow(function* dbUpdate() {
      const db = getEnv(self).db;
      const data = getSnapshot(self);
      logit('DB Update start', self._id, self.name);
      const res = yield db.put(data);
      if (!res.ok || res.error) throw res;

      self._rev = res.rev;
      self.dirty = false;
    }),
    deleteMemberFromAccount(memId) {
      self.members = self.members.filter(mem => mem._id !== memId);
      logit('deleteMemberFromAccount', `removing ${memId} from ${self._id}`);
      if (self.members.length === 0) {
        self._deleted = true;
        logit('deleteMemberFromAccount', `deleting account: ${self._id}`);
      }
      self.dbUpdate();
    },

    addMemberToAccount(memId) {
      self.members.push(memId);
      self.dbUpdate();
    },
    mergeInAccount: flow(function* mergeInAccount(otherAccount) {
      logit('mergeInAccount', otherAccount, self._id);
      self.logs.push(...otherAccount.logs);
      otherAccount.members.forEach(mem => {
        self.members.push(mem);
        mem.update({ accountId: self._id });
      });
      yield self.dbUpdate();
      otherAccount.update({ members: [], logs: [], _deleted: true });
      yield otherAccount.dbUpdate();
      destroy(otherAccount);
    }),
    categorizeBookingLogs() {
      const useFullHistory = getEnv(self).useFullHistory;
      const trace = traceIt(self._id);
      const root = getRoot(self);
      trace && logit('tracing', self._id, self.name);
      self.dirty = 0;
      onPatch(self, (patch, unpatch) => {
        !useFullHistory &&
          logit('onPatch', self._id, self.name, { ...patch, was: unpatch.value });
        self.dirty = true;
      });
      var paymentPeriodStart = root.BP.lastPaymentsBanked;
      const currentBookings = [];
      const oldestWalk = root.WS.oldestWalk;
      let oldestWalkNeeded = 'W0000-00-00';
      self.openingCredit = 0;
      // let preHistoryStarts = '0000-00-00';
      self.showLogs('logs', 1000, trace);
      let aLogs = self.logs.filter(log => log.req[0] !== '_');
      aLogs.forEach(log => {
        if (log.dat > paymentPeriodStart) log.update({ hideable: false });
      });
      //┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
      //┃   if using full history just push all data into          ┃
      //┃   currentPayments and currentBookings                    ┃
      //┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
      if (useFullHistory) {
        self.currentPayments = aLogs;
        self.bookings.forEach(bkngId => {
          const booking = resolveIdentifier(Booking, root, bkngId);
          currentBookings.push(...booking.logs);
        });
        self.currentBookings = currentBookings.sort(cmpDat);
        self.showAllLogs('After Catagorize', 1000, trace);
        return;
      }
      //┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
      //┃   We don't want to show anything older than 'oldestWalk'.┃
      //┃   Find the oldest such payment. Our opening balance will ┃
      //┃   be any credit carried over from the last payment       ┃
      //┃   before that one.                                              ┃
      //┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
      let lastPayment = { dat: '0000-00-00', creditCarriedOver: 0 };
      if (aLogs.length > 0) {
        const start = aLogs.findIndex(log => log.oldestWalk >= oldestWalk);
        if (start !== -1) {
          if (start - 1 >= 0) lastPayment = aLogs[start - 1];
          aLogs = aLogs.slice(start);
          oldestWalkNeeded = aLogs[0].oldestWalk;
        } else {
          // no payment in this period so start with the last one received
          lastPayment = aLogs[aLogs.length - 1];
          aLogs = [];
        }
        if (lastPayment.creditCarriedOver > 0) {
          logit(
            'Credit carried forward',
            self._id,
            self.name,
            lastPayment.dispDat,
            lastPayment,
          );
          //┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
          //┃ Create a dummy payment record to show the carried balance┃
          //┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
          const openCredit = AccountLog.create({
            ...getSnapshot(lastPayment),
            amount: lastPayment.creditCarriedOver,
            note: 'Credit carried forward',
            hideable: false,
            req: '+',
            creditCarriedOver: 0,
          });
          aLogs.unshift(openCredit);
          self.openingCredit = lastPayment.creditCarriedOver;
        }
      }
      //┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
      //┃ We need all bookings with an effective date after the    ┃
      //┃ previous payment                                         ┃
      //┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
      const preHistoryStarts = lastPayment.dat;

      trace &&
        logit('categorize', {
          useFullHistory,
          oldestWalk,
          oldestWalkNeeded,
          paymentPeriodStart,
          preHistoryStarts,
        });
      self.bookings.forEach(bkngId => {
        const booking = resolveIdentifier(Booking, root, bkngId);
        if (booking.walk._id < oldestWalkNeeded) return;
        currentBookings.push(
          ...booking.logs.filter(log => log.effDate > preHistoryStarts),
        );
      });
      self.showLogs('currentLogs', null, trace);
      self.showLogSizes(trace);

      self.currentPayments = aLogs;
      self.currentBookings = currentBookings;
      self.showLogSizes(trace);
      self.showAllLogs('After Catagorize', 1000, trace);
      return;
    },
    // extractUnresolvedWalks() {
    //   self.unresolvedWalks.clear();
    //   self.unclearedBookings.forEach(log => {
    //     if (log.walk.closed) self.unresolvedWalks.add(log.walk._id);
    //   });
    // }
  }));
// var resolvedSort = R.sortWith([
//   R.ascend(R.prop('effDate')),
//   R.descend(R.prop('type')),
//   R.ascend(R.prop('dat'))
// ]);
var coll = new Intl.Collator();
var cmpDat = (a, b) => coll.compare(a.dat, b.dat);
