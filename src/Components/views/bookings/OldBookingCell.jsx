import React from 'react';
import styled from 'styled-components/macro';
import { Icon } from '../../utility/Icon';
import { useStoreActions } from 'easy-peasy';
import { now } from '../../../store/dateFns';
import Logit from '../../../logit';
var logit = Logit('components/views/bookings/OldBookingCell');

export const OldBookingCell = React.memo((props) => {
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
  const len = annotation?.length ?? 0;
  const annStyle = { '--tw': `${len}ch`, '--ad': `${len / 4}s` };
  logit('cancel?', walkId, lastCancel, now(), cancel);
  return (
    <div
      className={'bookingcell booked member' + i}
      style={{ position: 'relative' }}
      key={bookingId}
    >
      <Icon type={status} className='normal ' size='2x' />
      <Marquee style={annStyle} className='annotation'>
        <span>{annotation}</span>
      </Marquee>
      <div className='cellRow hotspot'>
        <Icon type={status + cancel} onClick={() => bookMe(status + cancel)} />
        {status === 'W' && <Icon type='B' onClick={() => bookMe('B')} />}
      </div>

      <div className='cellRow hotspot'>
        <Icon type='A' title={annotation} onClick={() => openAnno(booking)} />
      </div>
    </div>
  );
});
const Marquee = styled.span`
  overflow: hidden;
  padding: 0;
  height: auto;
  display: inline-block;
  font-size: 0.7em;
  position: relative;
  bottom: 6px;
  z-index: 100;
  &:hover {
    display: none;
  }

  span {
    display: inline-block;
    white-space: nowrap;
    color: #00112c;
    width: var(--tw);
    text-shadow: var(--tw) 0 currentColor, calc(var(--tw) * 2) 0 currentColor,
      calc(var(--tw) * 3) 0 currentColor, calc(var(--tw) * 4) 0 currentColor;
    /* font-size: 0.6em; */
    will-change: transform;
    animation: marquee var(--ad) linear infinite;
    animation-play-state: running;
    padding: 0;
  }

  @keyframes marquee {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-100%);
    }
  }

  /*  
 * on MacOs: System Preferences > 
 *           Accessibility > 
 *           Display > Reduce motion
 */

  @media (prefers-reduced-motion: reduce) {
    span {
      animation: none;
      text-shadow: none;
      width: auto;
      display: block;
      line-height: 1.5;
      text-align: center;
      white-space: normal;
    }
  }
`;
