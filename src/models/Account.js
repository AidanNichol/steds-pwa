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
  onPatch
} from 'mobx-state-tree';
import { atomic /* actionLogger */ } from 'mst-middlewares';

import { Member } from './Member';
import { Booking } from './Booking';
import { AccountLog } from './AccountLog.js';
// import { actions } from './account-action-status.js';
import { DS } from '../models/MyDateFns';
import { sprintf } from 'sprintf-js';

import * as R from 'ramda';

import _ from 'lodash';
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
    members: types.array(types.reference(types.late(() => Member)))
  })
  .volatile(() => ({
    bookings: new Set(),
    historicLogs: [],
    currentLogs: [],
    currentBookings: [],
    currentPayments: [],
    activeThisPeriod: false,
    balance: 0,
    lastRestart: '',
    firstRestart: '',
    unresolvedWalks: new Set(),
    dirty: false
  }))
  .views(self => ({
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
          rev ? `${lName}, ${fName.join(' & ')}` : `${fName.join(' & ')} ${lName}`
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
        'Sizes '
      );
    },
    showAllLogs(text, limit, trace) {
      if (!trace) return;
      console.group(text);
      ['historicLogs', 'currentLogs', 'currentBookings', 'currentPayments'].forEach(
        item => {
          self.showLogs(item, limit, trace);
        }
      );

      console.groupEnd();
    }
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
      deletePayment: decorate(atomic, deletePayment)
    };
  })

  .actions(self => ({
    update(updates) {
      Object.entries(updates).forEach(([key, value]) => (self[key] = value));
      return self;
    },
    updateWithDoc(accDoc) {
      if (accDoc._rev === self._rev) return;
      const { docLogs, ...rest } = accDoc;
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
      const trace = self._id === 'A2065';
      const root = getRoot(self);
      self.dirtied = 0;
      onPatch(self, () => (self.dirty = true));
      var paymentPeriodStart = root.BP.lastPaymentsBanked;
      const historicLogs = [];
      const currentBookings = [];
      const oldestWalk = root.WS.oldestWalk;
      self.logs.forEach(log => {
        if (log.dat > paymentPeriodStart) log.update({ hideable: false });
      });
      const rsPoints = self.logs
        .filter(log => log.restartPt && log.hideable && !useFullHistory)
        .filter(pt => pt.oldestWalk >= oldestWalk);
      const lastRestart = (_.last(rsPoints) || {}).dat || '0000-00-00';
      const firstRestart = (rsPoints[0] || {}).dat || '0000-00-00';
      self.firstRestart = firstRestart;
      self.lastRestart = lastRestart;
      trace &&
        logit(
          'categorize',
          useFullHistory,
          oldestWalk,
          firstRestart,
          lastRestart,
          paymentPeriodStart
        );
      self.bookings.forEach(bkngId => {
        const logs = resolveIdentifier(Booking, root, bkngId).logs;
        logs.forEach(log => {
          if (log.completedBy < firstRestart) return;
          if (log.dat > paymentPeriodStart || log.completedBy > paymentPeriodStart)
            log.update({ hideable: false });
          if (log.hideable && log.completedBy <= lastRestart) historicLogs.push(log);
          else currentBookings.push(log);
        });
      });
      self.showLogs('historicLogs', null, trace);
      self.showLogs('currentLogs', null, trace);
      self.showLogSizes(trace);
      if (historicLogs.length > 0) {
        historicLogs.push(
          ...self.logs
            .filter(log => log.req[0] !== '_')
            .filter(log => log.dat >= firstRestart)
            .filter(log => log.dat <= lastRestart)
        );
      }
      self.currentPayments = self.logs
        .filter(log => log.req[0] !== '_')
        .filter(log => log.dat > lastRestart);
      historicLogs.sort(resolvedSort);
      self.showLogs('historicLogs', 1000, trace);
      self.historicLogs = historicLogs;
      self.currentBookings = currentBookings.sort(cmpDat);
      self.showLogSizes(trace);
      self.showAllLogs('After Catagorize', 1000, trace);
      return;
    },
    extractUnresolvedWalks() {
      self.unresolvedWalks.clear();
      self.unclearedBookings.forEach(log => {
        if (log.walk.closed) self.unresolvedWalks.add(log.walk._id);
      });
    }
    // setFlagsInLogs(hideable) {
    //   self.logs.forEach(log => log.update({ hideable }));
    // }
  }));
var resolvedSort = R.sortWith([
  R.ascend(R.prop('effDat')),
  R.descend(R.prop('type')),
  R.ascend(R.prop('dat'))
]);
var coll = new Intl.Collator();
var cmpDat = (a, b) => coll.compare(a.dat, b.dat);
