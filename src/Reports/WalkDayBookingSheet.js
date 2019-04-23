import React from 'react';
import { Booking } from '../models/Booking';

import Logit from 'logit';
import { toJS } from 'mobx';
import { resolveIdentifier } from 'mobx-state-tree';
import { AccountBox } from './SVGcomponents/AccountBox';
var logit = Logit('Reports/WalkDayBookingSheet');

function walkDaySet({ WS }) {
  const walk = WS.bookableWalks[0];
  logit('next Walk', toJS(walk));
  const accs = new Set();
  walk.bookings.forEach(booking => {
    if (!/^[BCW]$/.test(booking.status)) return;
    accs.add(booking.memId.accountId);
  });
  logit('walkDaySet', accs);
  return Array.from(accs.values());
}

// function fullSet({ WS }) {
//   const walks = WS.bookableWalks.map(walk => {
//     return Object.values(walk.bookings)
//       .filter(booking => /^[BCW]$/.test(booking.status))
//       .map(booking => booking.memId.accountId);
//   });
//   return union(...walks);
// }

function gatherData({ AS, WS }, accounts) {
  logit('stores', { AS, WS }, accounts);
  const walkCodes = [];
  WS.bookableWalks.forEach((walk, i) => {
    walk.numberWaitingList();
    walkCodes.push([walk.code, i === 0 ? 0.4 : 1]);
  });
  const nextWalkId = WS.bookableWalks[0]._id;
  logit('walkCodes', nextWalkId, walkCodes);
  accounts.forEach(account => {
    logit('account @start', account);
    account.members.forEach(member => (member.icons = []));
    account.codes = [];
    // get details of old walks still unpaid
    account.unclearedBookings
      .filter(bkngLog => bkngLog.walk._id < nextWalkId)
      .filter(bkngLog => /^[BC]$/.test(bkngLog.req))
      .forEach(bkngLog => {
        account.codes.push([bkngLog.walk.code, 0.4]);
        account.members.forEach(member => {
          logit('old walk', bkngLog.booking.memId._id, member._id, bkngLog, member);
          member.icons.push([
            bkngLog.booking.memId._id === member._id ? 'P' : 'Blank',
            1
          ]);
        });
      });
    // now get details of current walks
    account.codes.push(...walkCodes);
    let onWL = false;
    account.members.forEach(member => {
      WS.bookableWalks.forEach((walk, i) => {
        let icon;
        const booking = resolveIdentifier(Booking, walk, walk._id + member._id);
        if (!booking || booking.status[1] === 'X') icon = ['Chk', 1];
        else if (booking.status === 'W') {
          icon = ['Wn', booking.wlPosition];
          onWL = onWL || i === 0;
        } else if (booking.outstanding) icon = ['P', 1];
        else icon = [booking.status, i === 0 ? 0.4 : 1];
        member.icons.push(icon);
      });
    });

    account.seq = (onWL ? 'ZZ' : '  ') + account.sortname;

    logit('account', account, account.name);
  });
  return accounts.slice().sort((a, b) => a.seq.localeCompare(b.seq));
}
const styles = {
  accountBox: {
    marginBottom: 3,
    width: '100%'
  },
  spread: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: '1px 0px 1px 3px'
  },
  bkngBoxes: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    position: 'relative',
    fontSize: 12,
    fontStyle: 'italic'
  },
  bkngBox: {
    width: 30,
    maxWidth: 30,
    textAlign: 'center',
    position: 'relative'
  },
  icon: { width: 14, height: 14 }
};
export function WalkDayBookingSheet({ store }) {
  let accounts = walkDaySet(store);
  logit('accounts', accounts);
  accounts = gatherData(store, accounts);
  logit('accounts2', accounts);
  return (
    <div style={{ columnCount: 2, columnGap: 10 }}>
      {accounts.map(account => {
        return (
          <div style={styles.accountBox} key={account._id}>
            <AccountBox account={account} />
          </div>
        );
      })}
    </div>
  );
}
