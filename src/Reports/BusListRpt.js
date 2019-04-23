/* jshint quotmark: false, jquery: true */
import React from 'react';
import Logit from 'logit';
var logit = Logit('Reports/BusListRpt');
let colsPerPage = 4;
const byNameR = (a, b) => a.memId.fullNameR.localeCompare(b.memId.fullNameR);

const ShowBookings = ({ members, title, number }) => {
  let pos = 1;
  const subHead = {
    border: 'thin solid black',
    width: 'auto',
    // borderRadius: s3,
    borderBottomLeftRadius: 3,
    backgroundColor: '#F0F0F0'
  };
  return members.length === 0 ? null : (
    <section>
      {title && <div style={subHead}>{title}</div>}
      {members.map(bkng => (
        <div className="member" key={bkng.memId}>
          <span style={{ fontSize: 17, paddingLeft: 3 }}>
            {number && <span>{pos++}. </span>}
            {bkng.memId.fullNameR}
          </span>
          {bkng.annotation && (
            <span style={{ fontSize: 14 }}>{` (${bkng.annotation})`}</span>
          )}
        </div>
      ))}
    </section>
  );
};

const linesNeeded = list => {
  const len = (list || []).length;
  return len === 0 ? len : len + 1;
};
const parseWalk = walk => {
  const getByType = (walk, type, cmp) => {
    const members = walk.getBookingsByType(type);
    if (members.length === 0) return undefined;
    if (cmp) members.sort(cmp);
    return members;
  };
  const bus = getByType(walk, 'B', byNameR);
  const car = getByType(walk, 'C', byNameR);
  const wait = getByType(walk, 'W');
  const colSize = 56;
  const otherSize = linesNeeded(car) + linesNeeded(wait);
  const busSize = linesNeeded(bus) + 1;
  const noCols = busSize + otherSize > colSize ? 2 : 1;
  logit('parseWalk', { bus, car, wait, noCols, walk });
  return { walk, width: 2, noCols, cols: [{ bus, walk }, { car, wait, walk }] };
};
const parseWalksIntoPages = store => {
  const pages = [];
  let walks = [];
  const parsedWalks = store.WS.bookableWalks.map(walk => parseWalk(walk));
  const colsNeeded = parsedWalks.reduce((tot, walk) => tot + walk.noCols, 0);
  if (Math.ceil(colsNeeded / 5) < Math.ceil(colsNeeded / 4)) colsPerPage = 5;

  logit('colss calc', colsNeeded, colsPerPage);
  let colsAvailable = colsPerPage;
  let singleCols = 0;
  parsedWalks.forEach(parsedWalk => {
    const { noCols, width } = parsedWalk;
    colsAvailable -= width;
    if (colsAvailable < 0 && colsAvailable + singleCols >= 0) {
      const spare = -colsAvailable / singleCols;
      logit('squeezing', colsAvailable, singleCols, spare, walks);
      walks.forEach(walk => {
        logit('me', walk);
        if (walk.noCols === 2) return;
        walk.width -= spare;
        walk.cols = [{ ...walk.cols[0], ...walk.cols[1] }];
      });
      logit('sqeezed', walks);
      colsAvailable += singleCols;
      singleCols = 0;
    }
    if (colsAvailable < 0) {
      pages.push(walks);
      walks = [];
      colsAvailable = colsPerPage;
      singleCols = 0;
    }
    if (noCols === 1) singleCols++;
    walks.push(parsedWalk);
  });
  pages.push(walks);
  return pages;
};

const showCol = (col, n) => {
  const { bus, car, wait, walk } = col;
  logit('showCol', { bus, car, wait, walk });
  const styles = {
    walkTitle: { fontSize: 16, fontWeight: 'bold' },
    block: { width: '100%' }
  };
  return (
    <div style={styles.block} key={walk._id + (bus ? 'B' : 'X') + n}>
      {bus && <ShowBookings members={bus} />}
      {bus && walk && <div>{'Seats available: ' + walk.bookingTotals.free}</div>}
      {wait && <ShowBookings members={wait} number title=" Waiting List " />}
      {car && <ShowBookings members={car} title=" Cars " />}
    </div>
  );
};
const showWalk = ({ cols, width, walk }) => {
  // logit('showCol', { bus, car, wait, status, walk });
  const styles = {
    walkTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      borderBottom: 'thin solid #404040',
      backgroundColor: '#c0c0c0',
      textAlign: 'center'
    },
    block: {
      width: (100 * width) / colsPerPage + '%',
      border: 'thin solid #404040',
      borderRadius: 3
    },
    dat: { fontWeight: 'normal', fontStyle: 'italic', fontSize: 14 },
    cols: { display: 'flex', flexDirection: 'row' }
  };
  return (
    <div style={styles.block} key={walk._id}>
      <div style={styles.walkTitle}>
        <span style={styles.dat}>{walk.dispDate}</span> {walk.lName}
      </div>
      <div style={styles.cols}>{cols.map((col, i) => showCol(col, i))}</div>
    </div>
  );
};
export const BusListRpt = ({ store, Page }) => {
  const pages = parseWalksIntoPages(store);
  const colStyle = { display: 'flex', flexDirection: 'row' };
  logit('pages', pages);
  return (
    <div>
      {pages.map(page => (
        <Page title="Bus Lists" key={page[0].walk._id}>
          <div style={colStyle}>{page.map(walk => showWalk(walk))}</div>
        </Page>
      ))}
    </div>
  );
};
