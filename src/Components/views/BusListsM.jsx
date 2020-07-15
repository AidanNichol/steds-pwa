/* jshint quotmark: false, jquery: true */
import React, { useState, Fragment, Suspense } from 'react';
import { useStoreState, useStoreActions } from 'easy-peasy';
import styled from 'styled-components';
import { Loading } from '../utility/Icon';
import { PrintButton } from '../utility/PrintButton';
import { SummaryReport } from '../../Reports/summaryReport';
import { useFetchData } from '../../store/use-data-api';
// import { fetchData } from '../../store/use-data-api';

import SelectWalk from '../utility/SelectWalk';

import { Panel } from '../utility/AJNPanel';

import Logit from '../../logit';
var logit = Logit('components/views/busListsM');

export const BusLists = function BusLists(props) {
  const bookingStatus = useStoreState((s) => s.walkBookingStatus.status);
  logit('bookingStatus', bookingStatus);
  const [currentWalk, setCurrentWalk] = useState(bookingStatus[0]);
  logit('currentWalk', currentWalk);

  var title = <h4>Bus List</h4>;
  return (
    <Panel header={title} className='bus-list'>
      <SelectWalk {...{ walks: bookingStatus, setCurrentWalk, currentWalk }} />
      <div className='buttons'>
        <PrintButton
          rcomp={SummaryReport}
          rtitle='St.Eds - Bus Summary'
          tiptext='Print Bus Lists'
          visible
        />
      </div>
      {/* <Suspense fallback='...loading...'> */}
      <Suspense fallback={<Loading style={{ gridArea: 'booked' }} />}>
        <BusList {...{ currentWalk }} />
      </Suspense>
    </Panel>
  );
};
const BusList = ({ currentWalk }) => {
  const index = useStoreState((s) => s.names);
  const setPage = useStoreActions((a) => a.router.setPage);
  const setAccount = useStoreActions((a) => a.accountStatus.setAccount);

  const bookings = useFetchData('Booking/buslist/walkId/' + currentWalk.walkId).data;
  logit('useFetchData', bookings);
  const byNameR = (a, b) => a.Member.sortName.localeCompare(b.Member.sortName);
  const parseData = (data) => {
    const res = [[], [], []];
    data.forEach((item) => {
      const i = ['B', 'C', 'W'].indexOf(item.status);
      if (i < 0) return;
      res[i].push(item);
    });
    return res;
  };
  let [busBookings, carBookings, waitingList] = parseData(bookings);
  const annotations = [];
  const extractAnnotations = (list) => {
    list
      .filter((m) => m.annotation)
      .forEach((m) => {
        annotations.push(m.annotation);
        m.annNo = annotations.length;
      });
  };
  extractAnnotations(busBookings);
  extractAnnotations(carBookings);
  extractAnnotations(waitingList);
  logit('extract Annotations', annotations, busBookings, waitingList);
  busBookings.sort(byNameR);
  logit('preStatus', currentWalk);
  //     bookingsAdmin: store.signin.isBookingsAdmin,
  const showBookings = (memberId) => {
    setPage('bookings');
    setAccount(index.get(memberId).accountId);
  };
  const free = currentWalk.capacity - currentWalk.booked;

  return (
    <Fragment>
      <Bus {...{ busBookings, showBookings, free }} />

      <Others>
        <ShowAnnotations {...{ annotations }} />
        <div className='others'>
          <Waitlist list={waitingList} {...{ showBookings }} />
          <Cars cars={carBookings} {...{ showBookings }} />
        </div>
      </Others>
    </Fragment>
  );
};
const Bus = ({ busBookings, showBookings, free }) => {
  return (
    <div className='booked-members'>
      {busBookings.map((bkng) => (
        <div className='member' key={'B' + bkng.memberId}>
          <div className='bName' onClick={() => showBookings(bkng.memberId)}>
            {bkng.Member.sortName}
            <Notes {...{ bkng }} />
          </div>
        </div>
      ))}
      <div className='seats-available'>
        Seats available <div>{free}</div>
      </div>
    </div>
  );
};
const Cars = (props) => {
  return props.cars.length === 0 ? null : (
    <section className='booked-cars'>
      <h4>Cars</h4>
      {props.cars.map((bkng) => (
        <div
          className='member'
          key={'C' + bkng.memberId}
          onClick={() => props.showBookings(bkng.memberId)}
        >
          <div className='bName'>
            {bkng.Member.sortName}
            <Notes {...{ bkng }} />
          </div>
        </div>
      ))}
    </section>
  );
};
const Waitlist = (props) => {
  if (props.list.length === 0) return null;
  var pos = 1;
  return (
    <div className='waiting-list'>
      <h4>Waiting List</h4>

      {props.list.map((bkng) => {
        return (
          <div
            key={'W' + bkng.memberId}
            className='member'
            onClick={() => props.showBookings(bkng.memberId)}
          >
            <div className='wName'>
              <span className='pos'>{pos++}.</span>
              {bkng.Member.sortName}
              <Notes {...{ bkng }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
const ShowAnnotations = ({ annotations }) => {
  return (
    <AnnoBlock>
      {annotations.map((a, i) => {
        return (
          <AnnoLine key={i}>
            <Annotation style={{ left: -10 }}>{i + 1}</Annotation>
            <div>{a}</div>
          </AnnoLine>
        );
      })}
    </AnnoBlock>
  );
};
const AnnoBlock = styled.div``;
const AnnoLine = styled.div`
  display: flex;
  flex-direction: row;
`;
const Others = styled.div`
  grid-area: others;
  display: flex;
  flex-direction: column;
`;
const Notes = ({ bkng, className }) => {
  if (!bkng.annNo && bkng.Member.memberStatus !== 'Guest') return null;
  return (
    <React.Fragment>
      {bkng.annNo && <Annotation {...{ className }}>{bkng.annNo}</Annotation>}
      {bkng.Member.memberStatus === 'Guest' && <Guest {...{ className }}>G</Guest>}
    </React.Fragment>
  );
};
const Annotation = styled.span`
  display: inline-block;
  color: red;
  font-weight: bold;
  font-size: 0.7em;
  /* top: -5px; */
  width: 1.5em;
  height: 1.5em;
  text-align: center;
  border: solid thin red;
  border-radius: 50%;
  position: relative;
`;
const Guest = styled(Annotation)`
  color: blue;
  border-color: blue;
`;
