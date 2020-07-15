import React, { useState } from 'react';
import classnames from 'classnames';
import styled from 'styled-components';
import { useStoreState, debug } from 'easy-peasy';

import { NewBookingCell } from './NewBookingCell';
import { OldBookingCell } from './OldBookingCell';
import { AnnotateBooking } from './annotateBooking';
import Logit from '../../../logit';
var logit = Logit('component/views/statusTable');
const delSettings = {
  D: { 'data-text': 'Subs Due', style: { '--color': 'green' } },
  G: { 'data-text': 'Guest', style: { '--color': 'blue' } },
  L: { 'data-text': 'Subs Late', style: { '--color': 'red' } },
  S: { 'data-text': 'Suspended', style: { '--color': 'black' } },
  X: { 'data-text': 'Delete Me', style: { '--color': 'red' } },
};
const showAvailable = (walk) => {
  let free = walk.capacity - walk.booked;
  const W = walk.waiting;
  if (W > 0) return `${free} (-${W})`;
  return `${free}`;
};

export const StatusTable = (props) => {
  const { openWalks, closeit } = props;
  const [annoDialog, setAnnoDialog] = useState({ isOpen: false, booking: null });
  const index = useStoreState((state) => state.names);
  const account = useStoreState((state) => state.accountStatus.bookings);
  const members = (account.Members || []).map((m) => {
    let mm = index.get(m.memberId);
    logit('members map', debug(m), debug(mm));
    mm.showState = getShowState(mm.subsStatus?.status, mm.deleteState);
    return mm;
  });

  logit('account', account);
  logit('openWalks', openWalks);
  var mCl = members.map((member, i) => {
    logit('member', debug(member), index);
    return classnames({
      avail: true,
      ['member' + i]: true,
      suspended: member.suspended,
      [member.subs]: true,
    });
  });
  const openAnno = (booking) => setAnnoDialog({ booking, isOpen: true });
  const closeAnno = () => setAnnoDialog({ booking: null, isOpen: false });
  return (
    <div className='bTable status'>
      <StatusRow className={'heading bLine memsx' + members.length}>
        <DV>
          Date <br /> Venue
        </DV>
        <Available>Available</Available>
        {members.map((member, i) => (
          <MemberName
            className={mCl[i]}
            key={member.memberId}
            {...delSettings[member.showState]}
          >
            {index.get(member.memberId).firstName}
          </MemberName>
        ))}
      </StatusRow>
      {openWalks.map((walk, w) => {
        const { walkId, venue, full } = walk;
        const { fee, lastCancel } = index.get(walkId);
        const accountId = account.accountId;
        return (
          <StatusRow
            className={'walk bLine memsx' + members.length}
            key={w + 'XYZ' + walkId}
          >
            <DV>
              {walkId.substr(1)}
              {closeit(walk)}
              <br />
              {venue}
            </DV>
            <Available>{showAvailable(walk)}</Available>
            {members.map((member, i) => {
              const { memberId } = member;
              let booking = account.bookings[walkId + memberId];
              const key = 'QQQ' + walkId + memberId;
              return !booking || booking.status.length > 1 ? (
                <NewBookingCell
                  {...{
                    walkId,
                    memberId,
                    full,
                    fee,
                    i,
                    accountId,
                    key,
                  }}
                />
              ) : (
                <OldBookingCell
                  {...{
                    booking,
                    i,
                    fee,
                    lastCancel,
                    openAnno,
                    closeAnno,
                    accountId,
                    key,
                  }}
                />
              );
            })}
          </StatusRow>
        );
      })}
      <AnnotateBooking {...{ ...annoDialog, closeAnno }} />
    </div>
  );
};
const getShowState = (subsStatus, deleteState) => {
  logit('getShowState In:', subsStatus, deleteState);
  let state = subsStatus === 'ok' ? '' : subsStatus?.toUpperCase()[0];
  if (deleteState >= 'S') state = deleteState;
  logit('getShowState Out:', state);
  return state;
};

// const DateVenue = styled(({ date, venue }) => (
//   <DV>
//     {date}
//     <br />
//     {venue}
//   </DV>
// ));
const Cell = styled.div`
  border: solid black thin;
  padding-top: 10px;
  padding-bottom: 10px;
  min-height: 62px;
  max-height: 62px;
  height: 62px;
`;
const DV = styled(Cell)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
const Available = styled(Cell)`
  padding-top: 20px;
  padding-bottom: 20px;
`;
const StatusRow = styled.div`
  grid-template-columns: 120px 80px 100px 100px;
  display: grid;
  text-align: center;
  align-items: center;
  grid-gap: 0;
  max-height: 62px;
  min-height: 62px;
  height: 62px;

  /* .date {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  } */

  div {
    border: solid black thin;
    padding-top: 10px;
    padding-bottom: 10px;
    min-height: 62px;
    max-height: 62px;
    height: 62px;

    /* &.avail {
      padding-top: 20px;
      padding-bottom: 20px;
    } */

    &.bookingcell {
      font-size: 1.5em;
      padding-bottom: 0;
      padding-top: 0;
      overflow: hidden;
      display: inline-block;

      position: relative;

      transition: all 200ms ease-in;
      &:hover {
        z-index: 2;
        transform: scale(1.4);
      }

      .normal {
        padding-top: 7px;
        width: 32px;
      }

      /* .annotation {
        padding-top: 0;
        font-size: 0.6em;
        display: block;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        width: 100%;
      } */

      .hotspot {
        display: none;
      }

      &:hover {
        font-size: 1.3em;

        .hotspot {
          display: inline-block;
        }

        .normal,
        .annotation {
          display: none;
        }
        .cellRow {
          display: flex;
          flex-direction: row;
          justify-content: space-around;
          border-style: none;
          height: 30px;
          min-height: 0;
          max-height: 31px;
        }
        /* .fullwidth {
          width: 100%;
          display: inline-block;
        }

        .halfwidth {
          width: 50%;
          display: inline-block;
        } */

        background-color: #f5edc3;

        span:hover {
          background-color: #eada88;
        }
      }
    }
  }

  .bookings {
    h5 {
      font-size: 2em;
    }
  }

  .tooltip-inner {
    max-width: none;
  }
`;
const MemberName = styled.div`
  &::after {
    /*@import './watermark2.css';*/
    cursor: default;
    display: block;
    font-family: sans-serif;
    font-style: italic;
    font-weight: bold;
    width: 6em;
    height: 1em;
    line-height: 100%;
    pointer-events: none;
    position: relative;
    right: 0;
    text-align: center;
    user-select: none;
    z-index: 9999;
    transform: rotate(-70deg);
    opacity: 0.2;

    content: attr(data-text);
    bottom: 0;
    color: var(--color);
    font-size: 250%;
    left: -50%;
    top: 260%;
  }
`;
