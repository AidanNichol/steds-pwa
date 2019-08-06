import {
  types,
  flow,
  applySnapshot,
  getEnv,
  getRoot,
  resolveIdentifier,
  onPatch,
  getSnapshot
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
        const db = getEnv(self).db;
        const endkey = 'W' + DS.lastAvailableDate;
        const useFullHistory = find('useFullHistory');
        let startkey = useFullHistory ? 'W2016-11-01' : 'W' + DS.datePlusNmonths('', -6);
        const opts1 = { include_docs: true, startkey, endkey, limit: n };
        const data = yield find('db').allDocs(opts1);
        /* required in strict mode to be allowed to update state: */
        let walks = data.rows.map(row => row.doc).filter(doc => doc.type === 'walk');
        self.oldestWalk = walks[0]._id;
        if (!useFullHistory) {
          let endkey = 'W' + DS.datePlusNdays(DS.datePlusNmonths('', -6), -1);
          const opts = { include_docs: true, startkey: 'W0000', endkey };
          let data = yield db.query('walks/incomplete', opts);
          let walks2 = data.rows.map(row => row.doc);
          walks = [...walks2, ...walks];
        }
        applySnapshot(self.walks, walks);
        console.log(DS.dispTime, 'Walks Loaded', self.walks.length);
        console.log(DS.dispTime, 'Walk dates', {
          startkey,
          oldestWalk: self.oldestWalk,
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
      // self.walks.forEach(walk => {
      //   walk.update({ completed: self.areAllBookingsCompleted });
      // });
      logit('preBulkUpdateWalks', self.walks);
      const walksToUpate = self.walks
        .filter(walk => walk.dirty)
        .map(walk => getSnapshot(walk));
      self.bulkChanges = walksToUpate.length;
      if (walksToUpate.length === 0) return;

      const db = getEnv(self).db;
      const results = yield db.bulkDocs(walksToUpate);
      logit('bulkUpdate', results);
      results.forEach((res, i) => {
        if (!res.ok || res.error) {
          res.id = walksToUpate[i]._id;
          throw res;
        }
        const walk = resolveIdentifier(Walk, self, res.id);
        logit(`dbupdated (${res.id})`, walk._id, walk._rev, '->', res.rev);
        walk.update({ dirty: false, _rev: res.rev });
      });
    }),
    addToBookingIndex() {
      const useFullHistory = getEnv(self).useFullHistory;

      self.walks.forEach(walk => {
        onPatch(walk, (patch, unpatch) => {
          !useFullHistory && logit('onPatch', walk._id, walk.venue, patch, unpatch);
          walk.dirty = true;
        });
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
