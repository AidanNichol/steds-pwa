import React from 'react';
import { useStoreState } from 'easy-peasy';
import { PaymentsDue } from './PaymentsDue.jsx';
import { PaymentsMade } from './PaymentsMade.jsx';
// import {mapStoreToProps as buildDoc} from '../views/PaymentsSummary';

// import fs from 'fs';
import Logit from '../../logit';
var logit = Logit('components/containers/Payments-mobx');

export const PaymentsMST = () => {
  const display = useStoreState((s) => s.payments.display);
  logit('now displaying:', display);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {display === 'Debts' ? <PaymentsDue /> : <PaymentsMade />}
    </div>
  );
};
