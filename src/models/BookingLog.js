import { types, getParent, getRoot, getEnv } from 'mobx-state-tree';

import { tLogDate } from './customTypes';
import { DS } from './MyDateFns.js';
import { sprintf } from 'sprintf-js';
// import {traceIt} from './traceIt'
import _ from 'lodash';
import Logit from 'logit';
const logit = Logit('model:bookingLog');

//┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
//┃   Booking Log                                            ┃
//┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

export const BookingLog = types
  .model('BookingLog', {
    req: types.string,
    machine: types.maybe(types.string),
    dat: tLogDate,
    delayedDat: types.maybe(tLogDate),
    who: types.maybe(types.string),
    note: types.maybe(types.string)
  })
  .preProcessSnapshot(snapshot => {
    let { dat, ...snp } = snapshot;
    if (dat && dat !== '9999-99-99') {
      snp.dat = (dat + '.000').substr(0, 23);
    }
    delete snp.clearedBy;
    return snp;
  })
  .volatile(() => ({
    type: 'W',
    amount: 0,
    hideable: true,
    clearedBy: '',
    restartPt: false,
    balance: 0,
    outstanding: false,
    // member: getParent(self, 2).memId,
    // account: getParent(self, 2).memId.accountId,

    // amount: self.req !== 'A' ? (self.walk.fee || 8) * chargeFactor[self.req] : 0,
    // owing: /^B|C$/.test(self.req) ? Math.abs(self.amount) : 0,
    paid: { P: 0, T: 0, '+': 0 }
  }))
  .preProcessSnapshot(snp => {
    let { clearedBy, restartPt, outstanding, ...rest } = snp;
    return rest;
  })
  .actions(self => ({
    afterCreate() {
      const reset = getEnv(self).reset;
      if (reset) self.delayedDat = undefined;
    },
    update(updates) {
      Object.entries(updates).forEach(([key, value]) => {
        self[key] = value;
        if (key === 'outstanding') self.booking.update({ outstanding: value });
      });
      return self;
    },

    resetLateCancellation() {
      self.req = 'BX';

      self.walk.bookingChange(self.booking.member._id, 'BX', true);
      logit('resetLateCancelation', self.booking, self.account.balance);
      self.booking.member.account.showAllLogs('reset Cancel', 15, true);
    }
  }))
  .views(self => ({
    get dispDate() {
      return DS.dispDate(self.dat);
    },
    get booking() {
      return getParent(self, 2);
    },
    get walk() {
      return getParent(self, 4);
    },
    get member() {
      return self.booking.member;
    },
    get name() {
      return self.member.lName;
    },
    get account() {
      return self.member.account;
    },
    get accountId() {
      return self.account._id;
    },
    get walkId() {
      return self.walk._id;
    },
    get memId() {
      return self.member._id;
    },
    get bookingId() {
      return self.booking.id;
    },
    get thisPeriod() {
      return self.effDate > getRoot(self).BP.lastPaymentsBanked;
    },
    // get amount() {
    //   return self.req !== 'A' ? (self.walk.fee || 8) * chargeFactor[self.req] : 0;
    // },
    get billable() {
      if (!/^B|BL|C$/.test(self.booking.status)) return false;
      const last = self.booking.logs.reduce(
        (res, log) => (/B|C/.test(log.req) ? log : res),
        {}
      );
      return last === self;
    },
    get text() {
      let text = self.walk.lName;
      return self.req === 'A' ? `(${text}) ${self.note || ''}` : text;
    },
    get effDate() {
      return self.delayedDat || self.dat;
    },
    get outOfSequence() {
      return !!self.delayedDat;
    },
    printLog() {
      return sprintf(
        '%.16s %2s %-21s Am:%3d Bal:%3d',
        self.dispDate,
        self.req,
        self.completedBy(self.name || '') + self.text,
        self.amount,
        /^[BC]/.test(self.req) || self.type === 'A' ? self.balance : 0,
        self.restartPt,
        self.hideable,
        self.completedBy
      );
    },
    showLog() {
      const res = _.pick(self, ['dispDate', 'req', 'name', 'text', 'amount', 'balance']);
      res.completed = self.booking.completed;
      res.effDate = self.effDate;
      res.flags =
        (self.hideable ? 'H' : '-') +
        (self.booking.billable ? '£' : '-') +
        (self.name ? ' ' + self.name : '');
      return res;
    }
  }));
