import {
  types,
  getParent,
  resolveIdentifier,
  decorate,
  flow,
  getSnapshot,
  getEnv,
  // addMiddleware
} from 'mobx-state-tree';
import { atomic /* actionLogger */ } from 'mst-middlewares';
import { format, parseISO } from 'date-fns';
import { Booking } from './Booking';
import { DS } from './MyDateFns';
import Logit from 'logit';
const logit = Logit('model:walk');

//┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
//┃   Walk Store (includes Bookings Information)             ┃
//┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

export const Walk = types
  .model('Walk', {
    _id: types.refinement(types.identifier, id => /^W\d\d\d\d-\d\d-\d\d$/.test(id)),
    _rev: types.string,
    type: types.string,
    capacity: types.number,
    closed: types.maybe(types.boolean),
    completed: types.maybe(types.boolean),
    fee: types.number,
    firstBooking: types.string,
    lastCancel: types.string,
    venue: types.string,
    shortCode: types.maybe(types.string),
    lastUpdate: types.maybe(types.string),
    bookings: types.map(types.late(() => Booking)),
  })
  .volatile(() => ({ dirty: false }))
  .postProcessSnapshot(snp => {
    const { bookings: oBookings, ...rest } = snp;
    const bookings = {};
    rest.completed = true;
    Object.values(oBookings).forEach(booking => {
      const { id, member: memId, ...bkng } = booking;
      rest.completed = rest.completed && !!booking.completed;
      bookings[memId] = bkng;
    });

    return { ...rest, bookings };
  })
  .preProcessSnapshot(snp => {
    const { bookings, booked, annotations, log, ...rest } = snp;
    const newBookings = {};

    Object.entries(bookings).forEach(([memId, booking]) => {
      const id = snp._id + memId;
      newBookings[id] = { ...booking, member: memId, id };
    });
    return { ...rest, bookings: newBookings };
  })
  .views(self => ({
    get walkLogsByMembers() {
      let map = {};
      for (let [memId, booking] of self.bookings.entries()) {
        map[memId] = booking.logs;
      }
      return map;
    },
    get WS() {
      return getParent(self, 2);
    },
    get historic() {
      return self.walkDate <= self.WS.historyStarts;
    },
    get lName() {
      return self.venue.split('-', 2)[0].replace(/\(.*\)/, '');
    },
    get walkDate() {
      return self._id.substr(1);
    },
    get dispDate() {
      const tdat = parseISO(self.walkDate);
      return format(tdat, 'dd MMM');
    },
    get isLateCancel() {
      return DS.todaysDate > self.lastCancel;
    },
    get shortname() {
      return self.venue.split(/[ -]/, 2)[0];
    },
    get code() {
      if (self.shortCode) return self.shortCode;
      return self.venue.substr(0, 4);
    },
    get hideable() {
      return self.closed;
      // return self._id <= self.WS.lastClosed;
    },
    get bookingTotals() {
      let totals = { B: 0, W: 0 };
      self.bookings.forEach(({ status }) => {
        /^[BW]$/.test(status) && totals[status]++;
      });
      let free = self.capacity - totals.B;
      let display = '' + free + (totals.W > 0 ? ` (-${totals.W})` : '');
      return {
        booked: totals.B,
        waitlist: totals.W,
        free,
        available: free - totals.W,
        full: free <= totals.W,
        display,
      };
    },
    get areAllBookingsCompleted() {
      return Array.from(self.bookings.values()).every(bk => !!bk.completed);
    },
    getBookingsByType(type) {
      return Array.from(self.bookings.values()).filter(bk => bk.status === type);
    },
    getBooking(memId) {
      return self.bookings.get(self._id + memId);
    },
  }))
  .actions(self => {
    function* bookingChange(memId, req, force = false) {
      const id = self._id + memId;
      logit('bookingChange', memId, req, id, force);
      let bkng = self.bookings.get(id);
      if (!bkng) {
        bkng = Booking.create({ member: memId, id });
        logit('creating new booking', bkng);
        self.bookings.set(id, bkng);
      }
      if (!force && self.isLateCancel && req === 'BX' && bkng.status === 'B') {
        req = 'BL';
      }
      bkng.changeStatus(req, !force);
      /^[BC]/.test(req) && bkng.update({ completed: undefined });
      yield self.updateDB();
      const account = bkng.member.account;

      account.accountStatusNew();
    }
    // addMiddleware(self, actionLogger);
    return {
      bookingChangeAtomic: decorate(atomic, flow(bookingChange)),
      bookingChange(...args) {
        self.bookingChangeAtomic(...args).catch(error => logit('caught error', error));
      },
      closeWalk() {
        self.closed = true;
        self.updateDB();
      },
      update(updates) {
        Object.entries(updates).forEach(([key, value]) => (self[key] = value));
        return self;
      },
      updateDB: flow(function*() {
        const db = getEnv(self).db;
        // const { bookings: oBookings, ...rest } = getSnapshot(self);
        // const bookings = {};
        // rest.completed = true;
        // Object.values(oBookings).forEach(booking => {
        //   const { id, member: memId, ...bkng } = booking;
        //   rest.completed = rest.completed && !!booking.completed;
        //   bookings[memId] = bkng;
        // });

        // const res = yield db.put({ ...rest, bookings });

        const res = yield db.put(getSnapshot(self));
        if (!res.ok || res.error) throw res;
        logit('dbupdated', self._id, self._rev, '->', res.rev);
        // self.dirty = false;
        // self._rev = res.rev;
      }),
    };
  })
  .actions(self => ({
    // afterAttach() {
    //   logit('afterAttach', self._id, '==========================');
    // },

    updateWithDoc(doc) {
      if (doc._rev === self._rev) return;
      Object.entries(doc.bookings).forEach(([memId, booking]) => {
        const id = doc._id + memId;
        let bkng = resolveIdentifier(Booking, self, id);
        if (!bkng) {
          bkng = Booking.create({ ...booking, id });
          self.bookings.set(id, bkng);
          // bkng.memId.accountId.bookings.add(id);
        }
        bkng.updateFromDoc(booking);
      });
      logit('applying', doc);
    },
    numberWaitingList() {
      const WL = Array.from(self.bookings.values())
        .filter(bkng => bkng.status === 'W')
        .sort((a, b) => a.lastUpdate.localeCompare(b.lastUpdate));
      WL.forEach((bkng, i) => (bkng.wlPosition = i + 1));
      return WL;
    },
  }));
