/* jshint quotmark: false, jquery: true */
import React, { useEffect, useState, memo } from 'react';
import { useStoreState, useStoreActions } from 'easy-peasy';
import _ from 'lodash';
import { fetchData } from '../EasyPeasy/use-data-api';
import Logit from 'logit';
var logit = Logit('Reports/BusListRpt');
let colsPerPage = 4;

const ShowBookings = ({ members, title, number }) => {
  let pos = 1;
  const subHead = {
    border: 'thin solid black',
    width: 'auto',
    // borderRadius: s3,
    borderBottomLeftRadius: 3,
    backgroundColor: '#F0F0F0',
  };
  return members.length === 0 ? null : (
    <section>
      {title && <div style={subHead}>{title}</div>}
      {members.map((bkng) => (
        <div className='member' key={bkng.memberId}>
          <span style={{ fontSize: 17, paddingLeft: 3 }}>
            {number && <span>{pos++}.</span>}
            {bkng.sortName}
          </span>
          {bkng.annotation && (
            <div style={{ fontSize: 14, color: 'red' }}>{` (${bkng.annotation})`}</div>
          )}
        </div>
      ))}
    </section>
  );
};

const linesNeeded = (list) => {
  const len = (list || []).length;
  return len === 0 ? len : len + 1;
};
const getBookingsByType = (walk, type) => {
  return walk.Bookings.filter((bk) => bk.status === type);
};
const parseWalk = (walk) => {
  const getByType = (walk, type, cmp) => {
    let bookings = getBookingsByType(walk, type);
    if (bookings.length === 0) return undefined;
    if (cmp) bookings = _.sortBy(bookings, cmp);
    return bookings;
  };
  const bus = getByType(walk, 'B', 'sortName');
  const car = getByType(walk, 'C', 'sortName');
  const wait = getByType(walk, 'W', 'updatedAt');
  const colSize = 56;
  const otherSize = linesNeeded(car) + linesNeeded(wait);
  const busSize = linesNeeded(bus) + 1;
  const noCols = busSize + otherSize > colSize ? 2 : 1;
  logit('parseWalk', { bus, car, wait, noCols, walk });
  return {
    walk,
    width: 2,
    noCols,
    cols: [
      { bus, walk },
      { car, wait, walk },
    ],
  };
};
const parseWalksIntoPages = (bookableWalks) => {
  const pages = [[]];

  const parsedWalks = bookableWalks.map((walk) => parseWalk(walk));
  let colsUsed = 0;
  let pageNo = 0;
  parsedWalks.forEach((parsedWalk) => {
    let { noCols, cols, walk } = parsedWalk;
    if (colsUsed + noCols > 5) {
      colsPerPage = Math.max(colsPerPage, colsUsed);
      pageNo++;
      pages[pageNo] = [];
      colsUsed = 0;
    }
    colsUsed += noCols;
    cols = cols.slice(0, noCols);
    pages[pageNo].push({ noCols, cols, walk });
  });
  colsPerPage = Math.max(colsPerPage, colsUsed);
  // const colsNeeded = parsedWalks.reduce((tot, walk) => tot + walk.noCols, 0);
  // if (Math.ceil(colsNeeded / 5) < Math.ceil(colsNeeded / 4)) colsPerPage = 5;

  // logit('colss calc', colsNeeded, colsPerPage);
  // let colsAvailable = colsPerPage;
  // let singleCols = 0;
  // parsedWalks.forEach((parsedWalk) => {
  //   const { noCols, width } = parsedWalk;
  //   colsAvailable -= width;
  //   if (colsAvailable < 0 && colsAvailable + singleCols >= 0) {
  //     const spare = -colsAvailable / singleCols;
  //     logit('squeezing', colsAvailable, singleCols, spare, walks);
  //     walks.forEach((walk) => {
  //       logit('me', walk);
  //       if (walk.noCols === 2) return;
  //       walk.width -= spare;
  //       walk.cols = [{ ...walk.cols[0], ...walk.cols[1] }];
  //     });
  //     logit('sqeezed', walks);
  //     colsAvailable += singleCols;
  //     singleCols = 0;
  //   }
  //   if (colsAvailable < 0) {
  //     pages.push(walks);
  //     walks = [];
  //     colsAvailable = colsPerPage;
  //     singleCols = 0;
  //   }
  //   if (noCols === 1) singleCols++;
  //   walks.push(parsedWalk);
  // });
  // pages.push(walks);
  return pages;
};

const showCol = (col, n, index) => {
  const { bus, car, wait, walk } = col;
  logit('showCol', { bus, car, wait, walk });
  const free = walk.capacity - (bus?.length || 0);
  const styles = {
    walkTitle: { fontSize: 16, fontWeight: 'bold' },
    block: { width: '100%' },
  };
  return (
    <div style={styles.block} key={walk.walkId + (bus ? 'B' : 'X') + n}>
      {bus && <ShowBookings members={bus} />}
      {bus && walk && <div>{'Seats available: ' + free}</div>}
      {wait && <ShowBookings members={wait} number title=' Waiting List ' />}
      {car && <ShowBookings members={car} title=' Cars ' />}
    </div>
  );
};
const showWalk = ({ cols, noCols, width, walk }, index) => {
  // logit('showCol', { bus, car, wait, status, walk });
  logit('show wwalk', { cols, width, walk, index });
  const styles = {
    walkTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      borderBottom: 'thin solid #404040',
      backgroundColor: '#c0c0c0',
      textAlign: 'center',
    },
    block: {
      // width: (100 * width) / colsPerPage + '%',
      gridColumn: `span ${noCols}`,
      border: 'thin solid #404040',
      borderRadius: 3,
    },
    dat: { fontWeight: 'normal', fontStyle: 'italic', fontSize: 14 },
    cols: { display: 'flex', flexDirection: 'row' },
  };
  return (
    <div style={styles.block} {...{ noCols }} key={walk.walkId}>
      <div style={styles.walkTitle}>
        <span style={styles.dat}>{walk.displayDate}</span>
        {walk.longName}
      </div>
      <div style={styles.cols}>{cols.map((col, i) => showCol(col, i, index))}</div>
    </div>
  );
};

export const BusListRpt = memo(({ Page }) => {
  const [pages, setPages] = useState([]);
  const index = useStoreState((s) => s.names);
  const imReady = useStoreActions((a) => a.reports.imReady);

  useEffect(() => {
    fetchData(`allBuslists`).then((BL) => {
      logit('allBuslists fetchData returned', BL);
      BL.data.forEach((walk) => {
        walk.Bookings.forEach((bkng) => {
          bkng.sortName = bkng.Member.sortName;
          bkng.fullName = bkng.Member.fullName;
          bkng.guest = bkng.Member.memberStatus === 'guest';
          delete bkng.Member;
        });
      });
      logit('allBuslists BL', BL.data);
      const pages = parseWalksIntoPages(BL.data);
      logit('allBuslists pages', pages);
      setPages(pages);
    });
  }, []);
  // const colStyle = { display: 'flex', flexDirection: 'row' };
  const colStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${colsPerPage}, 1fr)`,
  };
  logit('pages', pages);
  if (pages.length > 0) imReady('busList');
  return (
    <div>
      {pages.map((page) => (
        <Page title='Bus Lists' key={page[0].walk.walkId}>
          <div style={colStyle}>{page.map((walk) => showWalk(walk, index))}</div>
        </Page>
      ))}
    </div>
  );
});
