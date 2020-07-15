import React from 'react';
import { Icon } from '../../utility/Icon';
import { useStoreActions } from 'easy-peasy';
import Logit from '../../../logit';
var logit = Logit('components/views/bookings/newBookingCell');

export const NewBookingCell = React.memo((props) => {
  // const [state, dispatch] = useTestUpdater();
  const { walkId, memberId, full, fee, i } = props;
  const bookingChange = useStoreActions((actions) => actions.accountStatus.bookingChange);
  const updateStatus = useStoreActions(
    (actions) => actions.walkBookingStatus.updateStatus,
  );

  logit('newBookings', { walkId, memberId, full, i });
  let reqType = full ? 'W' : 'B';
  const bookMe = (req) => {
    updateStatus({ walkId, from: null, to: req });
    bookingChange({ type: 'BOOK', walkId, memberId, fee, req });
  };
  return (
    <div className={'bookingcell book member' + i} key={'Q' + walkId + memberId}>
      <div className='cellRow hotspot'>
        <Icon type={reqType} onClick={() => bookMe(reqType)} />
      </div>
      <div className='cellRow hotspot'>
        <Icon type='W' onClick={() => bookMe('W')} />
        <Icon type='C' onClick={() => bookMe('C')} />
      </div>
    </div>
  );
});
