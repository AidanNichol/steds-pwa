/* jshint quotmark: false */
import React from 'react';
import { observer } from 'mobx-react';
import infinity from '../../images/infinity.gif';

// import Logit from 'logit';
// var logit = Logit('components/views/bookings/PaymentStatusLog');

export const LoadingStatus = observer(LoadingStatusR);

function LoadingStatusR(props) {
  return (
    <div>
      <h3 style={{ width: '100%', textAlign: 'right' }}>Loading Status</h3>
      {props.loadingStatus.map(l => {
        const bits = l.split('∞');
        return (
          <div style={{ paddingBottom: 10 }} key={l}>
            {bits[0]}
            {bits.length === 2 ? (
              <img src={infinity} alt="" style={{ height: '1.5em' }} />
            ) : null}
            {bits[1] && bits[1]}
          </div>
        );
      })}
    </div>
  );
}
