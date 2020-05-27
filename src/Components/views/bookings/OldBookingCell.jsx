import React from 'react';
import { Icon } from '../../utility/Icon';
import { useStoreActions } from 'easy-peasy';
import { now } from '../../../EasyPeasy/dateFns';
import Logit from 'logit';
var logit = Logit('components/utility/RSelectMember');

export function OldBookingCell(props) {
  const { booking, i, fee, lastCancel, openAnno } = props;
  const { walkId, memberId, bookingId, status, annotation } = booking;
  const bookingChange = useStoreActions((actions) => actions.accountStatus.bookingChange);
  const updateStatus = useStoreActions(
    (actions) => actions.walkBookingStatus.updateStatus,
  );
  const bookMe = (req) => {
    logit('change Bookings', req, booking);
    updateStatus({ walkId, from: status, to: req });
    bookingChange({ walkId, memberId, req, fee });
  };
  let cancel = now() > lastCancel && status === 'B' ? 'L' : 'X';
  logit('cancel?', walkId, lastCancel, now(), cancel);
  return (
    <div
      className={'bookingcell booked member' + i}
      style={{ position: 'relative' }}
      key={bookingId}
    >
      <Icon type={status} className='normal ' size='2x' />
      <span className='normal annotation'>{annotation}</span>
      <div className='cellRow hotspot'>
        <Icon type={status + cancel} onClick={() => bookMe(status + cancel)} />
        {status === 'W' && <Icon type='B' onClick={() => bookMe('B')} />}
      </div>

      <div className='cellRow hotspot'>
        <Icon type='A' title={annotation} onClick={() => openAnno(booking)} />
      </div>
    </div>
  );
}
