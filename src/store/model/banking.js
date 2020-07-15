// import _ from 'lodash';
import { fetchData } from '../use-data-api';
import { getTimestamp } from '../dateFns';

import Logit from '../../logit';
import { action, thunk } from 'easy-peasy';
var logit = Logit('store/banking');
/*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃                    useLatestBanking                      ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ 
*/
export const banking = {
  latestBanking: null,
  setLatestBanking: action((state, data) => (state.latestBanking = data)),
  getLatestBanking: thunk(async (actions) => {
    const res = await fetchData(`Banking/latest`);
    logit('fetchData returned', res);
    actions.setLatestBanking(res.data[0]);
  }),
};
banking.bankMoney = thunk(
  async (actions, payload, { getState, getStoreState, getStoreActions }) => {
    await getStoreActions().payments.getCredits();
    await getStoreActions().payments.getDebts();
    await getStoreActions().payments.getPaymentsMade();

    const paid = getStoreState().payments.paymentsMade;
    const closing = getStoreState().payments;
    const latest = getState().latestBanking;
    const timeS = getTimestamp();
    const newBanking = {
      bankingId: 'BP' + timeS,
      bankedAmount: closing.totalPaid,
      closingDebt: closing.totalDebt,
      closingCredit: closing.totalCredit,
      openingCredit: latest.closingCredit,
      openingDebt: latest.closingDebt,
      endDate: timeS,
      startDate: latest.endDate,
    };
    logit('paid', paid, closing);
    const patch = { op: 'add', path: ['Banking'], value: newBanking };
    const patches = [patch];
    paid.forEach((a) => {
      a.payments.forEach((p) =>
        patches.push({
          op: 'update',
          path: ['Payment', p.paymentId, 'bankingId'],
          value: timeS,
        }),
      );
    });

    getStoreActions().patches.addToQueue([patches, [{}]]);
    logit('bankMoney', patches);
    actions.setLatestBanking(newBanking);
    getStoreActions().payments.setPaymentsMade([]);
  },
);
export default banking;
