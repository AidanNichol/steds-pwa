import {
  types,
  flow,
  applySnapshot,
  getEnv,
  getRoot,
  resolveIdentifier
} from 'mobx-state-tree';
import { DS } from './MyDateFns.js';
import { Walk } from './Walk';
const logit = require('logit')('model/WalkStore');

/* 
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃   Walk Store                                             ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛*/

export const WalkStore = types
  .model('WalkStore', {
    walks: types.array(Walk),
    currentWalk: types.maybe(types.reference(Walk))
  })
  .volatile(() => ({
    db: null,
    DS: null,
    useFullHistory: null,
    oldestWalk: null
  }))
  .views(self => ({
    get walksValues() {
      return self.walks.slice();
    },
    get walksKeys() {
      return self.walks.map(w => w._id).sort(valCmp);
    },
    get bookableWalks() {
      const today = DS.todaysDate;
      const walks = self.openWalks.filter(walk => walk.walkDate >= today);
      logit('bookableWalks', walks);
      return walks;
    },

    get openWalks() {
      const today = DS.todaysDate;
      const walkIds = self.walksValues
        .filter(walk => walk._id.substr(1, 4) > '2016' && !walk.closed)
        .filter(walk => today >= walk.firstBooking.substr(0, 10)) // ignore time
        .sort(idCmp);
      logit('openWalksId', walkIds);
      return walkIds;
    },

    get currentPeriodStart() {
      return self.openWalks[0].firstBooking;
    },

    get recentWalksId() {
      const no = 3;
      const nextWalk = self.bookableWalks[0]._id;
      const i = Math.max(self.walksKeys.indexOf(nextWalk) - no, 0);

      const recent = [...self.walksKeys.slice(i, i + no), ...self.bookableWalks._id];
      logit('walkDay recent', recent, i, nextWalk, self.walksKeys);
      return recent;
    },

    get lastWalk() {
      const nextWalk = self.bookableWalks[0]._id;
      const i = Math.max(self.walksKeys.indexOf(nextWalk) - 1, 0);

      const lastWalkId = self.walksKeys[i];
      const walk = self.walks.get(lastWalkId);
      logit('last walk', nextWalk, i, lastWalkId, walk);
      return walk;
    },
    get historyStarts() {
      const nextWalk = self.bookableWalks[0]._id;
      const i = Math.max(self.walksKeys.indexOf(nextWalk) - 1, 0);

      const walk = self.walks.find(w => w._id === self.walksKeys[i]);
      logit('historyStarts', walk && walk.firstBooking, nextWalk, i, walk);
      return walk && walk.firstBooking;
    },
    // get prehistoryStarts() {
    //   const nextWalk = self.bookableWalks[0]._id;
    //   return DS.datePlusNmonths(nextWalk.substr(1), -8);
    // },
    // get darkAgesStarts() {
    //   const yearago = 'W' + DS.datePlusNyears('', -1);
    //   const oldestWalk = self.walksKeys.filter(walk => walk >= yearago)[0];
    //   return DS.datePlusNdays(oldestWalk.substr(1), 3);
    // },
    get availableWalksStart() {
      if (getEnv(self).useFullHistory) return 'W2016-11-01';
      else return self.darkAgesStarts;
    },
    get nextPeriodStart() {
      const nextWalk = self.bookableWalks[0]._id;
      const i = Math.max(self.walksKeys.indexOf(nextWalk) - 2, 0);

      const oldWalkId = self.walksKeys[i];
      const oldWalk = self.walks.find(w => w._id === oldWalkId);
      logit('nextPeriodStart', nextWalk, i, oldWalkId, oldWalk);
      return oldWalk.firstBooking;
    },

    get lastClosed() {
      return self.walks
        .slice()
        .filter(walk => walk.closed)
        .map(walk => walk._id)
        .sort(valCmp)
        .pop();
    }
  }))
  .actions(self => ({
    setCurrentWalk(id) {
      self.currentWalk = id;
    },
    load: flow(function* load(n = 1000) {
      try {
        const find = what => getEnv(self)[what] || getRoot(self)[what];
        const endkey = 'W' + DS.lastAvailableDate;
        const startkey = find('useFullHistory')
          ? 'W2016-11-01'
          : 'W' + DS.datePlusNmonths('', -6);
        self.oldestWalk = startkey;
        const opts1 = { include_docs: true, startkey, endkey, limit: n };
        const data = yield find('db').allDocs(opts1);
        /* required in strict mode to be allowed to update state: */
        const walks = data.rows.map(row => row.doc).filter(doc => doc.type === 'walk');
        applySnapshot(self.walks, walks);
        console.log(DS.dispTime, 'Walks Loaded', self.walks.length);
        console.log(DS.dispTime, 'Walk dates', {
          historyStarts: self.historyStarts,
          prehistoryStarts: self.prehistoryStarts,
          darkAgesStarts: self.darkAgesStarts,
          availableWalksStart: self.availableWalksStart,
          nextPeriodStart: self.nextPeriodStart,
          lastClosed: self.lastClosed
        });
        return;
      } catch (error) {
        // ... including try/catch error handling
        console.error('Failed to fetch walks', error);
        self.state = 'error';
      }
    }),
    loadTestData(walks) {
      applySnapshot(self.walks, walks);
    },

    bulkUpdateWalks: flow(function* bulkUpdateWalks() {
      const unresolved = getRoot(self).AS.allUnresolvedWalks;
      logit('unresol', unresolved);
      self.walks.forEach(walk => {
        walk.completed = !unresolved.has(walk._id);
      });
      const db = getEnv(self).db;
      const res = yield db.bulkDocs(self.walks);
      logit('bulkUpdate', res);
    }),
    addToBookingIndex() {
      self.walks.forEach(walk => {
        for (let booking of walk.bookings.values()) {
          const account = booking.member.account;
          booking.rationalizeLogs(walk.fee, walk.hideable);
          account.bookings.add(booking.id);
        }
      });
    },
    updateWithDoc(doc) {
      let walk = resolveIdentifier(Walk, self, doc._id);
      if (walk) walk.updateWithDoc(doc);
      else {
        walk = Walk.create(doc);
        self.walks.push(walk);
      }
    }
  }));

var coll = new Intl.Collator();
var idCmp = (a, b) => coll.compare(a._id, b._id);
var valCmp = (a, b) => coll.compare(a, b);
