/* jshint quotmark: false, jquery: true */
import { useStoreState, useStoreActions, debug } from 'easy-peasy';
import React from 'react';
import classnames from 'classnames';
// import _ from 'lodash';
import { Panel } from '../../utility/AJNPanel';
import SelectMember from '../../utility/RSelectMember';
import { today } from '../../../store/dateFns';
import styled from 'styled-components';
import { PaymentsBoxes } from './PaymentsBoxes';
import { ChangeLog } from './PaymentStatusLog';
import { StatusTable } from './StatusTable';

import Logit from '../../../logit';
var logit = Logit('component/views/bookings');

export const Bookings = function Bookings(props) {
  const openWalks = useStoreState((s) => s.walkBookingStatus.status);
  const updateStatus = useStoreActions((a) => a.walkBookingStatus.updateStatus);
  logit('BookingStatus', debug(openWalks));
  const account = useStoreState((state) => state.accountStatus);
  const currBookings = account.bookings;

  const { accountId } = account;
  logit('currBookings', currBookings);
  logit('account', account);

  const closeWalkBookings = (walk) => {
    logit('closeWalk', walk._id, walk);
    walk.closeWalk();
  };
  if (!currBookings) return null;
  // if (!currBookings) return null;
  logit('props', props, currBookings);
  const accMembs = currBookings.Members;
  if (!accMembs) return null;

  var title = <h4>Bookings</h4>;
  var bCl = classnames({
    bookings: true,
    ['mems' + accMembs.length]: true,
  });
  var _today = today();
  const closeit = (walk) => {
    return (
      walk.walkDate < _today && (
        <button onClick={() => closeWalkBookings(walk)} style={{ marginLeft: 3 }}>
          X
        </button>
      )
    );
  };

  var balance = (currBookings || {}).balance || 0;
  var credit = Math.max(balance, 0);
  var owing = Math.max(-balance, 0);
  return (
    <Panel header={title} body={{ className: bCl }} id='steds_bookingsX'>
      <Grid>
        <div className='select'>
          <SelectMember />
          <h4>{account.name}</h4>
        </div>
        <StatusTable
          {...{
            accMembs,
            openWalks,
            closeit,
            currBookings,
            updateStatus,
          }}
        />
        <ChangeLog className='logs' {...{ owing }} />
        <PaymentsBoxes className='payments' {...{ accountId, credit, owing }} />
      </Grid>
    </Panel>
  );
};
const Grid = styled.div`
  flex-direction: column;
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-template-columns: auto auto;
  display: grid;
  grid-template-areas:
    'select logs'
    'status logs'
    'pymts pymts';
  height: 100%;
  .select {
    grid-area: select;
    width: 300px;
  }
  .status {
    grid-area: status;
    align-self: start;
  }
  .logs {
    grid-area: logs;
    padding-bottom: 10px;
    max-width: 530px;
  }
  .payment {
    grid-area: pymts;
  }
`;
export default Bookings;
