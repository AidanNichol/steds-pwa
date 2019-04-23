import React from 'react';
import { inject, observer } from 'mobx-react';
import { types } from 'mobx-state-tree';
import { autorun, toJS } from 'mobx';
import PaymentsDue from '../views/PaymentsDue2.js';
import PaymentsMade from '../views/PaymentsReceived.js';
// import {mapStoreToProps as buildDoc} from '../views/PaymentsSummary';
import { flatten } from 'lodash';
import { format } from 'date-fns/fp';

// import fs from 'fs';
import Logit from 'logit';
var logit = Logit('components/containers/Payments-mobx');
const dispDate = format('dd MMM HH:mm');
var nameCmp = (a, b) => a.sortname.localeCompare(b.sortname);
//┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
//┃   UIState                                                ┃
//┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
const uiStateModel = types
  .model({
    displayingDue: true
  })
  .actions(self => ({
    showPaymentsDue: () => {
      self.displayingDue = true;
    },
    showPaymentsMade: () => {
      self.displayingDue = false;
    }
  }));
const uiState = uiStateModel.create({});

autorun(() =>
  logit(
    'Changed Displaying. Now showing:',
    uiState.displayingDue ? 'PaymentsDue' : 'PaymentsMade'
  )
);

const mapStoreToProps = function(store) {
  store.AS.fixupAllAccounts();
  const accs = store.AS.allAccountsStatus.sort(nameCmp);

  const totalPaymentsMade = accs.reduce((sum, log) => sum + (log.paymentsMade || 0), 0);
  return {
    accs: accs.filter(acc => acc.activeThisPeriod || acc.balance < 0),
    totalPaymentsMade,
    startDate: store.PS.periodStartDate,
    showPaymentsDue: uiState.showPaymentsDue,
    showPaymentsMade: uiState.showPaymentsMade,
    debts: accs.filter(acc => acc.balance < 0),
    bankMoney: store.PS.bankMoney,
    doc: buildDoc(store),
    lastWalk: lastWalkSummary(store)
  };
};
const Frame = observer(() => {
  const { showPaymentsDue, showPaymentsMade } = uiState;
  return (
    <div style={{ width: '100%', height: '100%' }}>
      {uiState.displayingDue ? (
        <PaymentsDue {...{ showPaymentsMade }} />
      ) : (
        <PaymentsMade {...{ showPaymentsDue }} />
      )}
    </div>
  );
});
export default inject('store')(Frame);
// export default connect(()=>({test2:'?'}), mapDispatchToProps)(mobxPayments);

const lastWalkSummary = function({ WS }) {
  const walk = WS.lastWalk;
  logit('lastWalk', walk);

  if (!walk || walk.closed) return null;
  let totals = { B: 0, BL: 0, BX: 0, C: 0, CX: 0 };
  walk.bookingsValues.map(({ status }) => {
    if (/^[BC]/.test(status)) totals[status] += 1;
  });
  return { totals, date: walk.dispDate, venue: walk.venue, fee: walk.fee };
};

const buildDoc = function({ AS, DS, WS, PS }) {
  var openingCredit = PS.openingCredit,
    openingDebt = -PS.openingDebt,
    startDate = PS.lastPaymentsBanked,
    endDate = AS.paymentsLogsLimit || DS.getLogTime();
  logit('range data', { startDate, endDate, openingCredit, openingDebt });
  const accountsStatus = toJS(AS.allAccountsStatus).sort(nameCmp);
  const filterCurrentLogs = logs =>
    logs.filter(({ dat }) => dat > startDate && dat < endDate);
  logit('accountsStatus', accountsStatus);
  var cLogs = flatten(accountsStatus.map(acc => filterCurrentLogs(acc.logs)));
  var payments = accountsStatus.filter(acc => acc.paymentsMade > 0);
  var tots = cLogs.reduce((tot, lg) => {
    if (!tot[lg.req]) tot[lg.req] = [0, 0];
    tot[lg.req][0]++;
    tot[lg.req][1] += Math.abs(lg.amount);
    return tot;
  }, {});
  let currentPeriodStart = WS.currentPeriodStart;
  var doc = {
    _id: 'BP' + endDate.substr(0, 16),
    type: 'paymentSummary',
    startDispDate: dispDate(startDate && new Date(startDate)),
    endDispDate: dispDate(new Date(endDate)),
    closingCredit: accountsStatus
      .filter(acc => acc.balance > 0)
      .reduce((sum, item) => sum + item.balance, 0),
    closingDebt: accountsStatus
      .filter(acc => acc.balance < 0)
      .reduce((sum, item) => sum + item.balance, 0),
    openingCredit,
    openingDebt,
    endDate,
    startDate,
    payments,
    accounts: accountsStatus.filter(acc => acc.activeThisPeriod || acc.balance < 0),
    currentPeriodStart,
    // unclearedBookings: AS.unclearedBookings(currentPeriodStart),
    // aLogs, bLogs,
    cLogs,
    tots
  };
  logit('logs doc', doc, __dirname);

  //
  return doc;
};
