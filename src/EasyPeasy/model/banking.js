// import _ from 'lodash';
import { fetchData } from '../use-data-api';

import Logit from 'logit';
import { action, thunk } from 'easy-peasy';
var logit = Logit('easyPeasy/banking');
/*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃                    useLatestBanking                      ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ 
*/
export const banking = {
  latestBanking: null,
  setLatestBanking: action((state, date) => (state.latestBanking = date)),
  getLatestBanking: thunk(async (actions) => {
    const res = await fetchData(`Banking/latest`);
    logit('fetchData returned', res);
    actions.setLatestBanking(res.data[0]);
  }),
};
banking.bankMoney = thunk(async (actions, doc, { getState }) => {
  delete doc.accounts;
  delete doc.cLogs;
  doc.payments = doc.payments.map((pymnt) => {
    const { accId, accName, paymentsMade } = pymnt;
    return { accId, accName, paymentsMade };
  });
  logit('bankMoney', doc);
  // await db.put(doc);
  this.changeBPdoc(doc);
});
export default banking;
