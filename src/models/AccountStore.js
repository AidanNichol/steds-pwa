import {
  types,
  flow,
  applySnapshot,
  resolveIdentifier,
  getEnv,
  getRoot,
  getSnapshot,
} from 'mobx-state-tree';
import { Account } from './Account';
import { db } from './testDB.js';
import { traceId } from './traceIt';
// import setPrototypeOf from 'setprototypeof';

const logit = require('logit')('model/AccountStore');
/* 
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃   Account Store                                          ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛*/

export const AccountStore = types
  .model('AccountStore', {
    accounts: types.array(Account),
    currentAccount: types.maybe(types.reference(Account)),
  })
  .volatile(() => ({
    db: null,
  }))
  .actions(self => ({
    load: flow(function* load(n = 1000) {
      try {
        self.db = getEnv(getRoot(self));

        const data = yield db.allDocs({
          include_docs: true,
          startkey: 'A',
          endkey: 'A9999999',
          limit: n,
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
    getDumpData: flow(function*() {
      const db = getEnv(self).db;
      const dumpName = getEnv(self).useFullHistory ? 'dumpDataV1' : 'dumpDataV2';

      const result = yield db.allDocs({ key: dumpName, include_docs: true });
      logit('getDumpData', { dumpName, result });
      const accs = result.rows[0].doc.accs;
      accs.sort((a, b) => a._id.localeCompare(b._id));
      return accs.reduce((indx, acc) => {
        indx[acc._id] = acc;
        return indx;
      }, {});

      // return result.rows[0].doc.accs.sort((a, b) => a.accId.localeCompare(b.accId));
    }),
    dumpData: flow(function*() {
      try {
        const db = getEnv(self).db;
        const useFullHistory = getEnv(self).useFullHistory;
        const dumpName = useFullHistory ? 'dumpDataV2' : 'dumpDataV3';
        const oldData = yield db.allDocs({ key: dumpName, include_docs: true });
        const data = oldData.rows.length > 0 ? oldData.rows[0].doc : { _id: dumpName };
        logit('Dumping data to ' + dumpName, oldData, data);

        data.accs = self.accounts.map(acc => acc.dumpData());
        logit('dumpData data', data, db);
        yield db.put(data);
        return data.accs;
      } catch (error) {
        logit('dumpData Error', error);
      }
    }),
    loadTestData(accounts) {
      applySnapshot(self.accounts, accounts);
    },

    getAllAccountStatus() {
      const lastPayment = getRoot(self).BP.lastPaymentsBanked;
      logit('lastPayment', lastPayment, getRoot(self).BP);
      self.accounts.forEach(account => {
        account.accountStatusNew();
      });
      const account = resolveIdentifier(Account, self, traceId);
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
    },
    bulkUpdateAccounts: flow(function* bulkUpdateAccounts() {
      logit('preBulkUpdateAccounts', self.accounts);

      const accountsToUpate = self.accounts
        .filter(account => account.dirty)
        .map(acc => getSnapshot(acc));
      self.bulkChanges = accountsToUpate.length;
      if (accountsToUpate.length === 0) return;
      const db = getEnv(self).db;
      const results = yield db.bulkDocs(accountsToUpate);
      logit('bulkUpdate', results);
      results.forEach((res, i) => {
        if (!res.ok || res.error) {
          res.id = accountsToUpate[i]._id;
          throw res;
        }
        const account = resolveIdentifier(Account, self, res.id);
        logit(`dbupdated (${res.id})`, account._id, account._rev, '->', res.rev);
        account.update({ _rev: res.rev, dirty: false });
      });
    }),
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
    },
  }));
