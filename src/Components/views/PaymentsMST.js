import React from 'react';
import { observer } from 'mobx-react';
import { types } from 'mobx-state-tree';
import { autorun } from 'mobx';
import { PaymentsDue } from '../views/PaymentsDue2.js';
import { PaymentsReceived } from '../views/PaymentsReceived.js';
// import {mapStoreToProps as buildDoc} from '../views/PaymentsSummary';

// import fs from 'fs';
import Logit from 'logit';
var logit = Logit('components/containers/Payments-mobx');
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
    showPaymentsReceived: () => {
      self.displayingDue = false;
    }
  }));
const uiState = uiStateModel.create({});

autorun(() =>
  logit(
    'Changed Displaying. Now showing:',
    uiState.displayingDue ? 'PaymentsDue' : 'PaymentsReceived'
  )
);

export const PaymentsMST = observer(() => {
  logit('uiState', uiState);
  const { showPaymentsDue, showPaymentsReceived } = uiState;
  return (
    <div style={{ width: '100%', height: '100%' }}>
      {uiState.displayingDue ? (
        <PaymentsDue {...{ showPaymentsReceived }} />
      ) : (
        <PaymentsReceived {...{ showPaymentsDue }} />
      )}
    </div>
  );
});
