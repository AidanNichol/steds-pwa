/* jshint quotmark: false, jquery: true */
import React, { useState, useEffect } from 'react';
import { useStoreState, useStoreActions } from 'easy-peasy';
import styled from 'styled-components';
import { PrintButton } from '../utility/PrintButton';
import { SummaryReport } from '../../Reports/summaryReport';
import { fetchData } from '../../EasyPeasy/use-data-api';

import SelectWalk from '../utility/SelectWalk';

import { Panel } from '../utility/AJNPanel';

import Logit from 'logit';
var logit = Logit('components/views/busListsM');

export const BusLists = function BusLists(props) {
  // const storeX = useStore();
  // logit('storeX', storeX);
  // var { store } = props;
  // logit('props', props);
  // const bookableWalks = usBookableWalks();
  const bookingStatus = useStoreState((s) => s.walkBookingStatus.status);
  const index = useStoreState((s) => s.names);
  const setPage = useStoreActions((a) => a.router.setPage);
  const setAccount = useStoreActions((a) => a.accountStatus.setAccount);
  logit('bookingStatus', bookingStatus);
  const [currentWalk, setCurrentWalk] = useState(bookingStatus[0]);
  logit('currentWalk', currentWalk);
  const [bookings, setbookings] = useState([]);
  useEffect(() => {
    const getIt = async () => {
      const res = await fetchData('Booking/buslist/walkId/' + currentWalk.walkId);
      logit('fetchData returned', res);
      setbookings(res.data);
    };
    getIt();
  }, [currentWalk.walkId]);
  if (!bookings) return null;
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
  logit('preStatus', currentWalk, bookingStatus);
  //     bookingsAdmin: store.signin.isBookingsAdmin,
  const showMemberBookings = (memberId) => {
    setPage('bookings');
    setAccount(index.get(memberId).accountId);
  };

  const Cars = (props) => {
    return props.cars.length === 0 ? null : (
      <section className='booked-cars'>
        <h4>Cars</h4>
        {props.cars.map((bkng) => (
          <div
            className='member'
            key={'C' + bkng.memberId}
            onClick={() => showMemberBookings(bkng.memberId)}
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
  const Waitlist = (props) =>
    props.list.length === 0 ? null : (
      <div className='waiting-list'>
        <h4>Waiting List</h4>

        {props.list.map((bkng) => {
          return (
            <div
              key={'W' + bkng.memberId}
              className='member'
              onClick={() => showMemberBookings(bkng.memberId)}
            >
              <div className='wName'>
                <span className='pos'>{pos++}. </span>
                {bkng.Member.sortName}
                <Notes {...{ bkng }} />
              </div>
            </div>
          );
        })}
      </div>
    );
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

  var title = <h4>Bus List</h4>;
  var pos = 1;
  const free = currentWalk.capacity - currentWalk.booked;
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

      <div className='booked-members'>
        {busBookings.map((bkng) => (
          <div className='member' key={'B' + bkng.memberId}>
            <div className='bName' onClick={() => showMemberBookings(bkng.memberId)}>
              {bkng.Member.sortName}
              <Notes {...{ bkng }} />
            </div>
          </div>
        ))}
        <div className='seats-available'>
          Seats available <div>{free} </div>
        </div>
      </div>
      <Others>
        <ShowAnnotations {...{ annotations }} />
        <div className='others'>
          <Waitlist list={waitingList} />
          <Cars cars={carBookings} />
        </div>
      </Others>
    </Panel>
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
