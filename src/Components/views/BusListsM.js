/* jshint quotmark: false, jquery: true */
import React from 'react';
import { observer, inject } from 'mobx-react';
import { PrintButton } from '../utility/PrintButton';
import { SummaryReport } from '../../Reports/summaryReport';

import SelectWalk from '../utility/SelectWalk.js';

import { Panel } from '../utility/AJNPanel';

import Logit from 'logit';
var logit = Logit('components/views/busListsM');

export const BusLists = inject('store')(
  observer(function BusLists(props) {
    var { store } = props;
    logit('props', props);
    const walk = store.WS.currentWalk;
    const byNameR = (a, b) => a.memId.fullNameR.localeCompare(b.memId.fullNameR);
    const busBookings = (walk && walk.getBookingsByType('B').sort(byNameR)) || [];
    const carBookings = (walk && walk.getBookingsByType('C')) || [];
    const waitingList = (walk && walk.getBookingsByType('W')) || [];
    const status = (walk && walk.bookingTotals) || {};
    //     bookingsAdmin: store.signin.isBookingsAdmin,
    const setCurrentWalk = walkId => store.WS.setCurrentWalk(walkId);
    const showMemberBookings = member => {
      store.router.setPage({ page: 'bookings' });
      store.MS.setCurrentMember(member._id);
    };

    const Cars = props => {
      return props.cars.length === 0 ? null : (
        <section className="booked-cars">
          <h4>Cars</h4>
          {props.cars.map(bkng => (
            <div
              className="member"
              key={'C' + bkng.memId}
              onClick={() => showMemberBookings(bkng.memId)}
            >
              <div className="bName">{bkng.memId.fullNameR}</div>
              <div className="annotation">{bkng.annotation} </div>
            </div>
          ))}
        </section>
      );
    };
    const Waitlist = props =>
      props.list.length === 0 ? null : (
        <div className="waiting-list">
          <h4>Waiting List</h4>

          {props.list.map(bkng => {
            return (
              <div
                key={'W' + bkng.memId}
                className="member"
                onClick={() => showMemberBookings(bkng.memId)}
              >
                <div className="wName">
                  <span className="pos">{pos++}. </span>
                  {bkng.memId.fullNameR}{' '}
                </div>
                <div className="annotation">{bkng.annotation} </div>
              </div>
            );
          })}
        </div>
      );

    var title = <h4>Bus List</h4>;
    var pos = 1;
    return (
      <Panel header={title} className="bus-list">
        <SelectWalk
          {...{ setCurrentWalk, walks: store.WS.bookableWalks, currentWalk: walk }}
        />
        <div className="buttons">
          <PrintButton
            rcomp={SummaryReport}
            rtitle="St.Eds - Bus Summary"
            tiptext="Print Bus Lists"
            visible
          />
        </div>
        <div className="booked-members">
          {busBookings.map(bkng => (
            <div className="member" key={'B' + bkng.memId}>
              <div className="bName" onClick={() => showMemberBookings(bkng.memId)}>
                {bkng.memId.fullNameR}{' '}
              </div>
              <div className="annotation">{bkng.annotation}</div>
            </div>
          ))}
          <div className="seats-available">
            Seats available <div>{status.free} </div>
          </div>
        </div>
        <div className="others">
          <Waitlist list={waitingList} />
          <Cars cars={carBookings} />
        </div>
      </Panel>
    );
  })
);
