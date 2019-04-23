import {
  types,
  flow,
  applySnapshot,
  getEnv,
  resolveIdentifier,
  destroy
} from 'mobx-state-tree';
import { Member } from './Member';
import { viewsIndex } from './memberStore.views.index';

import { DS } from './MyDateFns';
import Logit from 'logit';
const logit = Logit('store/MemberStore');

/* 
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃   Member Store                                           ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛*/

export const MemberStore = types
  .model('MemberStore', {
    members: types.array(Member),
    currentMember: types.maybe(types.reference(Member)),
    hideOld: true
    // currentMember: types.union(types.reference(Member), types.undefined)
  })

  .actions(self => ({
    load: flow(function* load(n = 1000) {
      try {
        const db = getEnv(self).db;
        const data = yield db.allDocs({
          include_docs: true,
          startkey: 'M',
          endkey: 'M9999999',
          limit: n
        });
        console.log(DS.dispTime + ' db data returned', self.members.length);
        /* required in strict mode to be allowed to update state: */
        const members = data.rows
          .map(row => row.doc)
          .filter(doc => doc.type === 'member');
        applySnapshot(self.members, members);
        console.log(DS.dispTime + ' Members Loaded', self.members.length);
        // return data;
      } catch (error) {
        // ... including try/catch error handling
        console.error('Failed to fetch memberss', error);
        self.state = 'error';
      }
    }),
    loadTestData(members) {
      applySnapshot(self.members, members);
    },
    setCurrentMember(memId) {
      self.currentMember = memId;
      console.log(
        'currentMember',
        memId,
        memId && self.currentMember._id,
        memId && self.currentMember.fullName
      );
    },
    toggleHideOld() {
      self.hideOld = !self.hideOld;
    },

    // addMember(member) {
    //   this.members.set(member._id, new Member(member, db));
    // },

    deleteCurrentMember: flow(function* deleteCurrentMember() {
      const member = self.currentMember;
      if (!member) return;
      self.currentMember = undefined;
      if (!member.newMember) {
        const account = member.accountId;
        if (account) account.deleteMemberFromAccount(member._id);
        logit('delete Member ', member._id, member.fullName, member);
        member._deleted = true;
        yield member.dbUpdate();
      }
      destroy(member);
    }),
    updateWithDoc(doc) {
      let member = resolveIdentifier(Member, self, doc._id);
      if (member) member.updateWithDoc(doc);
      else {
        member = Member.create(doc);
        self.members.push(member);
      }
    },
    createNewMember() {
      const memNo =
        // Array.from(self.members).reduce(
        self.members.reduce((max, mem) => Math.max(max, mem._id.substr(1)), 0) + 1;
      const newMem = Member.create({
        _id: 'M' + memNo,
        accountId: 'A' + memNo,
        firstName: '',
        lastName: ''
      });
      newMem.update({ newMember: true });
      self.currentMember = newMem._id;
      self.members.push(newMem);
      logit('New Member Id:', 'M' + memNo, self);
      return newMem;
    }
  }))
  .views(viewsIndex)
  .views(self => ({
    get selectNamesList() {
      return self
        .membersSorted({ sortProp: 'name' })
        .map(member => {
          return {
            value: member._id,
            memId: member._id,
            label: member.fullNameR
          };
        })
        .sort((a, b) => a.label.localeCompare(b.label));
    }
  }));
