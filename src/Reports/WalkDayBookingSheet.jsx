import React, { useEffect, useState, memo } from 'react';
import _ from 'lodash';
import { useStoreState, useStoreActions } from 'easy-peasy';
import { fetchData } from '../store/use-data-api';

import Logit from '../logit';
import { AccountBox } from './SVGcomponents/AccountBox';
var logit = Logit('Reports/WalkDayBookingSheet');

// function walkDaySet({ WS }) {
//   const walk = WS.bookableWalks[0];
//   logit('next Walk', toJS(walk));
//   const accs = new Set();
//   walk.bookings.forEach((booking) => {
//     if (!/^[BCW]$/.test(booking.status)) return;
//     accs.add(booking.memId.accountId);
//   });
//   logit('walkDaySet', accs);
//   return Array.from(accs.values());
// }

// function fullSet({ WS }) {
//   const walks = WS.bookableWalks.map(walk => {
//     return Object.values(walk.bookings)
//       .filter(booking => /^[BCW]$/.test(booking.status))
//       .map(booking => booking.memId.accountId);
//   });
//   return union(...walks);
// }

function gatherData(accounts, WLindex, openWalks, index) {
  logit('stores', accounts);
  let walkCodes = openWalks.map((w, i) => {
    const code = index.get(w.walkId).shortCode;
    return [w.walkId, code, i === 0 ? 0.4 : 1];
  });
  // const WLindex = {};
  // buslists.forEach((walk, i) => {
  //   walk.Bookings.filter((b) => b.status === 'W').forEach((b) => {
  //     WLindex[walk.walkId + b.memberId] = b.wlNo;
  //   });
  // });
  // logit('WLindex', buslists, WLindex);
  const nextWalkId = openWalks[0].walkId;
  logit('walkCodes', nextWalkId, walkCodes);
  accounts.forEach((account) => {
    logit('account @start', account);
    account.codes = [];
    account.debt = 0;
    account.Members.forEach((member) => {
      member.icons = {};
      member.Bookings.forEach((bkng) => {
        let icon;
        account.debt += bkng.owing;
        if (bkng.walkId < nextWalkId && bkng.owing > 0) {
          const code = index.get(bkng.walkId).shortCode;
          account.codes.push([bkng.walkId, code, 0.4]);
        }
        if (!bkng || bkng.status[1] === 'X') icon = ['Chk', 1];
        else if (bkng.status === 'W') {
          icon = ['Wn', WLindex[bkng.bookingId]];
        } else if (bkng.owing > 0) icon = ['P', 1];
        else icon = bkng.status;
        member.icons[bkng.walkId] = icon;
      });
    });
    account.codes = _.sortBy(
      _.uniqBy([...account.codes, ...walkCodes], (c) => c[0]),
      (c) => c[0],
    );
    account.balance = account.credit - account.debt;
  });
  return _.sortBy(accounts, (a) => a.sortName);
}

const styles = {
  accountBox: {
    marginBottom: 3,
    width: '100%',
  },
  spread: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: '1px 0px 1px 3px',
  },
  bkngBoxes: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    position: 'relative',
    fontSize: 12,
    fontStyle: 'italic',
  },
  bkngBox: {
    width: 30,
    maxWidth: 30,
    textAlign: 'center',
    position: 'relative',
  },
  icon: { width: 14, height: 14 },
};
export const WalkDayBookingSheet = memo(() => {
  const openWalks = useStoreState((s) => s.walkBookingStatus.status);
  const imReady = useStoreActions((a) => a.reports.imReady);

  const index = useStoreState((s) => s.names);
  const [accounts, setAccounts] = useState([]);
  useEffect(() => {
    let mounted = true;
    const getIt = async () => {
      const res = await fetchData(`sq/walkdayData`);
      const WL = await fetchData(`WLindex`);
      logit('walkData fetchData returned', res.data);
      logit('WLindex fetchData returned', WL.data);
      const accounts = gatherData(res.data, WL.data[0], openWalks, index);
      mounted && setAccounts(accounts);
    };
    getIt();
    return () => (mounted = false);
  }, [index, openWalks]);
  if (accounts.length > 0) imReady('walkDay');
  return (
    <div style={{ columnCount: 2, columnGap: 10 }}>
      {accounts.map((account) => {
        return (
          <div style={styles.accountBox} key={account._id}>
            <AccountBox account={account} />
          </div>
        );
      })}
    </div>
  );
});
