import {
  types,
  applySnapshot,
  getSnapshot,
  flow,
  getEnv,
  getRoot
} from 'mobx-state-tree';
import { Account } from './Account';
import DS from './MyDateFns';

import Logit from 'logit';
const logit = Logit('Model/Member');

const old = DS.datePlusNyears(null, -2).substr(0, 4);

/* ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
   ┃   Member Doc                                             ┃
   ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛*/

export const Member = types
  .model('Member', {
    _id: types.refinement(types.identifier, id => /^M\d+$/.test(id)),
    _rev: types.maybe(types.string),
    type: 'member',
    accountId: types.reference(types.late(() => Account)),
    firstName: types.string,
    lastName: types.string,
    address: types.maybe(types.string),
    phone: types.maybe(types.string),
    email: types.maybe(types.string),
    mobile: types.maybe(types.string),
    joined: types.maybe(types.string),
    nextOfKin: types.maybe(types.string),
    medical: types.maybe(types.string),
    memberStatus: 'Guest',
    roles: types.maybe(types.string),
    suspended: types.maybe(types.boolean),
    subscription: types.maybe(types.union(types.string, types.number)),
    deleteState: types.optional(types.string, '')
  })
  .volatile(() => ({
    newMember: false
  }))
  .views(self => ({
    get memNo() {
      return parseInt(self._id.substr(1));
    },
    get memberId() {
      return self._id;
    },
    get isOld() {
      return self.memberStatus !== 'Guest' && self.subscription <= old;
    },
    get account() {
      return self.accountId;
    },
    get fullName() {
      return self.firstName + ' ' + self.lastName;
    },
    get fullNameR() {
      return self.lastName + ', ' + self.firstName;
    },
    get sName() {
      return self.accountId.members.length > 1 ? self.firstName : '';
    },
    get lName() {
      return self.accountId.members.length > 1 ? `[${self.firstName}]` : '';
    },
    get subsStatus() {
      return getSubsStatus(self.memberStatus, self.subscription);
    },
    get showState() {
      return getShowState(this.subsStatus.status, this.deleteState);
    }
  }))
  .actions(self => ({
    updateWithDoc(doc) {
      if (doc._rev === self._rev) return;
      applySnapshot(self, doc);
    },
    update(updates) {
      Object.entries(updates).forEach(([key, value]) => (self[key] = value));
      return self;
    },

    saveEdit: flow(function* saveEdit(memData) {
      try {
        memData && applySnapshot(self, memData);
        if (self.newMember) {
          yield getRoot(self).AS.createNewAccount(memData.accountId, [self._id]);
        }
        yield self.dbUpdate();
        self.newMember = false;
      } catch (error) {
        console.error('Failed to put member', error);
      }
    }),
    dbUpdate: flow(function* dbUpdate() {
      try {
        const db = getEnv(self).db;
        const data = getSnapshot(self);
        logit('DB Update start', self._id, self.fullName);
        const res = yield db.put(data);
        self._rev = res.rev;
      } catch (error) {
        console.error('Failed to put member', error);
      }
    })
  }));
const getShowState = (subsStatus, deleteState) => {
  let state = subsStatus === 'ok' ? '' : subsStatus.toUpperCase()[0];
  if (deleteState >= 'S') state = deleteState;
  return state;
};

export const getSubsStatus = (memberStatus, subscription) => {
  let _today = new Date();
  // DS.todaysDate;
  let status = 'ok';
  if (memberStatus === 'HLM') return { due: false, status, showSubsButton: false };
  if (memberStatus === 'Guest')
    return { due: false, status: 'guest', showSubsButton: false };

  const currentUserSubs = parseInt(subscription || 0);

  let fee = 15;
  // const _today = new Date();
  let thisYear = _today.getFullYear();
  // year - all new subs will be ok until the end of thie 'year'
  let year = _today >= new Date(`${thisYear}-10-01`) ? thisYear + 1 : thisYear;
  // dueSubsYear - we are collecting subs for this year
  let dueSubsYear = _today >= new Date(`${thisYear}-12-31`) ? thisYear + 1 : thisYear;
  // okSubsYear - if current value is this then you get the reduced rate.
  let okSubsYear = _today < new Date(`${thisYear}-02-01`) ? thisYear - 1 : thisYear;
  let showSubsButton = _today >= new Date(`${thisYear}-12-01`) && currentUserSubs < year;
  if (currentUserSubs >= okSubsYear) fee = 13;
  // console.log({currentUserSubs, year, thisYear, dueSubsYear,  okSubsYear, showSubsButton})
  if (currentUserSubs >= year || currentUserSubs >= dueSubsYear) {
    if (showSubsButton) return { due: false, status, year, fee, showSubsButton };
    else return { due: false, status, showSubsButton };
  }
  status = 'due';
  if (currentUserSubs >= okSubsYear) fee = 13;
  else status = 'late';
  showSubsButton = true;
  return { due: true, year, fee, status, showSubsButton };
};
