import { types, getParent, getRoot } from 'mobx-state-tree';
import { tLogDate, tWalkId } from './customTypes';
import { DS } from './MyDateFns.js';

import { sprintf } from 'sprintf-js';
import _ from 'lodash';
// const { format, differenceInMonths, parseISO } = require('date-fns');

const chargeFactor = { S: 0, _: 1, '+': -1, P: -1, T: -1, '+X': 1, PX: 1, TX: 1 };

//┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
//┃   Account Log                                            ┃
//┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
// const loadedAt = new Date();

export const AccountLog = types
  .model('AccountLog', {
    req: types.enumeration(['_', '__', '+', 'P', 'T', '+X', 'PX', 'TX', 'S']),
    dat: types.identifier,
    who: types.optional(types.string, ''),
    machine: types.optional(types.string, ''),
    note: types.optional(types.string, ''),
    type: 'A',
    amount: types.optional(types.number, 0),
    creditCarriedOver: types.optional(types.number, 0),
    oldestWalk: types.maybe(tWalkId),
  })
  .volatile(() => ({
    balance: 0,
    toCredit: 0,
    historic: false,
    hideable: true,
    clearedBy: types.maybe(tLogDate),
  }))
  .preProcessSnapshot(snapshot => {
    let { logsFrom, restartPoint, clearedBy, dispDate, text, ...snp } = snapshot; //eslint-disable:no-unused-vars
    if (text) snp.note = text;
    return { ...snp };
  })
  .views(self => ({
    get activeThisPeriod() {
      const root = getRoot(self);
      if (!root.BP) return false;
      var paymentPeriodStart = root.BP.lastPaymentsBanked;
      return self.dat > paymentPeriodStart;
    },
    get account() {
      return getParent(self, 2);
    },
    get netAmount() {
      return self.amount * chargeFactor[self.req];
    },
    get dispDate() {
      return DS.dispDate(self.dat);
    },

    // get dispDate() {
    //   const tdat = parseISO(self.dat);
    //   return format(
    //     tdat,
    //     differenceInMonths(tdat, loadedAt) > 6 ? 'dd MMM, yyyy' : 'dd MMM HH:mm'
    //   );
    // },
    get effDate() {
      return self.delayedDat || self.dat;
    },
    get text() {
      return self.note;
    },
    showLog() {
      return _.pick(self, [
        'dispDate',
        'dat',
        'req',
        'name',
        'amount',
        'balance',
        'hideable',
        'creditCarriedOver',
        'oldestWalk',
      ]);
    },
    printLog() {
      return sprintf(
        '%.16s %2s %-21s Am:%3d Bal:%3d',
        self.dispDate,
        self.req,
        (self.name || '') + self.text,
        self.amount,
        self.balance,
        self.restartPt,
        self.hideable,
      );
    },
  }))
  .actions(self => ({
    update(updates) {
      Object.entries(updates).forEach(([key, value]) => {
        if (self[key] !== value) self[key] = value;
      });
      return self;
    },
    deletePayment() {
      self.account.deletePayment(self);
    },
  }));
