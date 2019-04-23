import {
  types,
  flow,
  applySnapshot,
  resolveIdentifier,
  getEnv,
  getRoot
} from 'mobx-state-tree';
import { Account } from './Account';
import { db } from './testDB.js';

/* 
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃   Account Store                                          ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛*/

export const AccountStore = types
  .model('AccountStore', {
    accounts: types.array(Account),
    currentAccount: types.maybe(types.reference(Account))
  })
  .volatile(() => ({
    db: null
  }))
  .actions(self => ({
    load: flow(function* load(n = 1000) {
      try {
        self.db = getEnv(getRoot(self));

        const data = yield db.allDocs({
          include_docs: true,
          startkey: 'A',
          endkey: 'A9999999',
          limit: n
        });
        const accounts = data.rows
          .map(row => row.doc)
          .filter(doc => doc.type === 'account');
        // .forEach(doc => self.updateWithDoc(doc));
        applySnapshot(self.accounts, accounts);
        console.log('Accounts Loaded', self.accounts.length);
      } catch (error) {
        console.error('Failed to fetch accounts', error);
        self.state = 'error';
      }
    }),
    loadTestData(accounts) {
      applySnapshot(self.accounts, accounts);
    },

    getAllAccountStatus() {
      self.accounts.forEach(account => {
        account.accountStatusNew();
      });
      const account = resolveIdentifier(Account, self, 'A2065');
      account.showAllLogs('at start', 1000, true);
    },
    categorizeAllBookingLogs() {
      self.accounts.forEach(account => {
        account.categorizeBookingLogs();
      });
    },
    updateWithDoc(doc) {
      let account = resolveIdentifier(Account, self, doc._id);
      if (!account) {
        const { logs, ...base } = doc;
        account = Account.create(base);
        self.accounts.push(account);
      }
      account.updateWithDoc(doc);
    },
    addAccount(account) {
      // logit('addAccount', account)
      const acc = Account.create(account);
      self.accounts.push(acc);
      return acc;
    },

    createNewAccount(accId, members) {
      let acc = resolveIdentifier(Account, self, accId);
      if (acc) acc.members.replace([...acc.members, ...members]);
      else acc = self.addAccount({ _id: accId, members });
      acc.dbUpdate();
    }
  }))
  .views(self => ({
    findAccount(accId) {
      return resolveIdentifier(Account, self.accounts, accId);
    },
    getAccount(id) {
      return resolveIdentifier(Account, self, id);
    },
    get allUnresolvedWalks() {
      const res = new Set();
      self.accounts.forEach(account => {
        if (!account.unresolvedWalks) return;
        account.unresolvedWalks.forEach(val => res.add(val));
      });
      return res;
    },
    get accountsActiveThisPeriod() {
      return self.accounts.filter(acc => acc.activeThisPeriod);
    }
  }));
