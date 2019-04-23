import { types, getParent, getRoot } from 'mobx-state-tree';
import { Member } from './Member';
import { BookingLog } from './BookingLog';
import { tBookingStatus } from './customTypes';
import { DS } from '../models/MyDateFns';
import _ from 'lodash';
import Logit from 'logit';
const logit = Logit('model:booking');
const chargeFactor = {
  N: 0,
  B: 1,
  W: 0,
  WX: 0,
  WL: 0,
  BX: -1,
  BL: 0,
  C: 0.5,
  CX: -0.5,
  CL: -0.5,
  A: 0
};
//┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
//┃   Booking                                                ┃
//┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

export const Booking = types
  .model('Booking', {
    id: types.identifier,
    member: types.reference(types.late(() => Member)),
    status: types.maybe(tBookingStatus),
    annotation: types.maybe(types.string),
    logs: types.array(BookingLog),
    outstanding: types.optional(types.boolean, true),
    lastUpdate: types.maybe(types.string)
  })
  .volatile(() => ({
    free: false,
    fee: 8,
    hideable: false
  }))
  .preProcessSnapshot(snp => {
    if (!snp || (snp.lastUpdate && snp.lastUpdate !== '""')) return snp;
    let lastUpdate = (_.findLast(snp.logs, log => log.req === snp.status) || {}).dat;
    return { ...snp, lastUpdate };
  })
  .actions(self => ({
    // afterAttach() {
    //   const account = self.member.accountId;
    //   // console.log('attached booking:', self.id, account, account.bookings);
    //   account.bookings.add(self.id);
    //   self.fee = self.walk.fee;
    //   self.hideable = self.walk.hideable;
    //   self.rationalizeLogs(self.walk.fee, self.walk.hideable);
    // },
    changeStatus(req, makeLog = true) {
      logit('changeStatus', self.id, '->', req, makeLog)
      self.status = req;
      let log;
      if (makeLog) {
        log = BookingLog.create({ req, dat: DS.getLogTime() });
      }
      self.attachLog(log);
    },
    attachLog(log) {
      if (log){
        self.logs.push(log);
        self.lastUpdate = log.dat;
        self.member.accountId.currentBookings.push(log);
      }
      self.rationalizeLogs(self.walk.fee, self.walk.hideable);
    },
    update(updates) {
      Object.entries(updates).forEach(([key, value]) => (self[key] = value));
      return self;
    },
    setOutstanding(b) {
      self.outstanding = b;
      return self;
    },
    rationalizeLogs(fee = 8, canHide) {
      const trace = self.id === 'W2019-04-13M1092'
      let free = false;
      let paymentPeriodStart = getRoot(self).BP.lastPaymentsBanked;

      self.logs.forEach(log => {
        const activeThisPeriod = log.dat > paymentPeriodStart;
        const hideable = canHide && !activeThisPeriod;
        log.update({ hideable, activeThisPeriod });
        if (log.req === 'BL') free = true;
        if (log.req === 'BX') free = false;
        const amount = free ? 0: fee * chargeFactor[log.req];
        trace && logit('rationalize', free, log.req, fee, amount);
        log.update({ amount });
      });
    },
    updateFromDoc(docBkng) {
      if (docBkng.lastUpdate <= self.lastUpdate) return;
      const account = self.member.accountId;
      const { logs, ...rest } = docBkng;
      logs.forEach(log => {
        let nLog = self.logs.find(bLog => bLog.dat === log.dat);
        if (!nLog) {
          logit('creating log', log);
          nLog = BookingLog.create(log);
          self.attachLog(nLog);
        }
        // nLog.update(log);
      });
      self.update(rest);
      account.accountStatusNew();
    }
    // afterCreate() {
    //   const root = getRoot(self);
    //   if (!root.MS || root.MS.members.length === 0) return;
    //   const account = self.member.accountId;
    //   account.bookings.add(self.id);
    // }
  }))
  .views(self => ({
    get walk() {
      return getParent(self, 2);
    },
    get memId() {
      return self.member;
    }
  }));
