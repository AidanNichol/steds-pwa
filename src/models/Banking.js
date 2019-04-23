import { types, applySnapshot, flow, getEnv, getSnapshot } from 'mobx-state-tree';
import { db } from './testDB.js';
import { format, parseISO } from 'date-fns/fp';
const dispDate = format('dd MMM HH:mm');
var formatISOdate = format("yyyy-MM-dd'T'HH:mm:ss.SSS");
var getLogTime = () => formatISOdate(new Date());

const Payment = types.model('Payment', {
  accId: types.string,
  accName: types.string,
  paymentsMade: types.integer
});
export const Banking = types
  .model('Banking', {
    _id: types.maybe(types.string),
    _rev: types.maybe(types.string),
    type: types.maybe(types.string),
    endDate: types.maybe(types.string),
    startDate: types.maybe(types.string),
    bankedAmount: types.maybe(types.number),
    payments: types.array(Payment)
  })
  .views(self => ({
    get startDispDate() {
      return dispDate(parseISO(self.startDate));
    },
    get endDispDate() {
      return dispDate(self.endDate);
    },
    get lastPaymentsBanked() {
      return self.endDate;
    }
  }))
  .actions(self => ({
    load: flow(function* load() {
      try {
        const data = yield db.allDocs({
          include_docs: true,
          startkey: 'BP9999999',
          endkey: 'BP00000000',
          descending: true,
          limit: 1
        });
        self.updateWithDoc(data.rows[0].doc);
        return;
      } catch (error) {
        console.error('Failed to Banking Summary', error);
        self.state = 'error';
      }
    }),
    setEndDate(dat) {
      // only used for testing
      self.endDate = dat;
    },
    updateWithDoc(doc) {
      const { _id, _rev, type, endDate, startDate, payments } = doc;
      applySnapshot(self, { _id, _rev, type, endDate, startDate, payments });
    },
    // get periodStartDate() {
    //   logit('periodStartDate', this.lastPaymentsBanked, this);
    //   return new XDate(this.lastPaymentsBanked).toString('ddd dd MMM');
    // },

    changeBPdoc(doc) {
      if (doc.doc) doc = doc.doc;
      self.updateWithDoc(doc);
    },

    /*------------------------------------------------------------------------*/
    /* replication has a new or changed account document                      */
    /*------------------------------------------------------------------------*/

    changeDoc({ deleted, doc, id }) {
      if (deleted) return;
      if (id <= self.id) return;
      self.changeBPdoc(doc);
    },
    bankMoney: flow(function* bankMoney(payments, total) {
      try {
        self._id = 'BP' + self.lastPaymentsBanked.substring(0, 20);
        self._rev = undefined;
        self.payments = payments;
        self.startDate = self.lastPaymentsBanked;
        self.endDate = getLogTime();
        self.bankedAmount = total;

        const db = getEnv(self).db;
        const data = getSnapshot(self);
        // logit('DB Update start', self._id, self.fullName);
        const res = yield db.put(data);
        self._rev = res.rev;
      } catch (error) {
        console.error('Failed to put Banking Doc', error);
      }
    })
  }));
