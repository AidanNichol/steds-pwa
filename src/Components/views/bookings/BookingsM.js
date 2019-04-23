/* jshint quotmark: false, jquery: true */
import React from 'react';
import classnames from 'classnames';
import { observer, inject } from 'mobx-react';

import { Panel } from '../../utility/AJNPanel';
import SelectMember from '../../utility/RSelectMember.js';
import { Icon } from '../../utility/Icon';
import { DS } from '../../../models/MyDateFns';
import { PaymentsBoxes } from './PaymentsBoxes';
import { ChangeLog } from './PaymentStatusLog';
import { AnnotateBooking, openAnnotationDialog } from './annotateBooking';

import Logit from 'logit';
var logit = Logit('component/views/bookings');
const delSettings = {
  D: { text: 'Subs Due', style: { '--color': 'green' } },
  G: { text: 'Guest', style: { '--color': 'blue' } },
  L: { text: 'Subs Late', style: { '--color': 'red' } },
  S: { text: 'Suspended', style: { '--color': 'black' } },
  X: { text: 'Delete Me', style: { '--color': 'red' } }
};

const Bookings = inject('store')(
  observer(
    class Bookings extends React.Component {
      render() {
        // var {
        //   openWalks,
        //   options,
        //   account,
        //   accountSelected,
        //   closeWalkBookings
        // } = this.props;
        const store = this.props.store;
        let openWalks = store.WS.openWalks;

        logit('store', store);
        const options = store.MS.selectNamesList;
        // const todaysDate = store.DS.todaysDate;
        // selectNamesList,
        let account;
        let accMembs = [];
        if (store.MS.currentMember) {
          account = store.MS.currentMember.accountId;
          accMembs = account.members;
        }
        const closeWalkBookings = walkId => store.WS.walks.get(walkId).closeWalk(walkId);
        const memberSelected = acc => {
          logit('memberSelected', acc);
          store.MS.setCurrentMember(acc.memId);
        };
        // if (!account) return null;
        logit('props', this.props);

        var newBooking = (walk, memId, full, i) => {
          // logit('newBookings', {walkId,memId, full, i})
          let reqType = full ? 'W' : 'B';
          return (
            // <div className={'book member'+i} key={memId} onClick={()=>walkUpdateBooking(walkId, accId, memId, reqType)} >
            <div className={'bookingcell book member' + i} key={memId}>
              <span
                className="hotspot fullwidth"
                onClick={() => walk.bookingChange(memId, reqType)}
              >
                <Icon type={reqType} />
              </span>
              <span
                className="hotspot halfwidth"
                onClick={() => walk.bookingChange(memId, 'W')}
              >
                <Icon type="W" />
              </span>
              <span
                className="hotspot halfwidth"
                onClick={() => walk.bookingChange(memId, 'C')}
              >
                <Icon type="C" />
              </span>
            </div>
          );
        };

        var oldBooking = (walk, booking, i) => {
          const { memId, status, annotation } = booking;
          const width = status === 'W' ? ' halfwidth' : ' fullwidth';
          return (
            <div
              className={'bookingcell booked member' + i}
              style={{ position: 'relative' }}
              key={memId}
            >
              <Icon type={status} className="normal " />
              <span className="normal annotation">{annotation}</span>
              <Icon
                className={'hotspot ' + width}
                type={status + 'X'}
                onClick={() => walk.bookingChange(memId._id, status + 'X')}
              />
              {status === 'W' ? (
                <span
                  className={'hotspot bookme fa-stack' + width}
                  onClick={() => walk.bookingChange(memId._id, 'B')}
                >
                  <Icon type="B" />
                </span>
              ) : null}
              <span
                className="hotspot fullwidth annotate"
                onClick={() => openAnnotationDialog(booking, memId, annotation)}
              >
                <Icon type="A" />
              </span>
            </div>
          );
        };

        var title = <h4>Bookings</h4>;
        var bCl = classnames({
          bookings: true,
          ['mems' + accMembs.length]: true
        });
        var mCl = accMembs.map((member, i) => {
          logit('member', member);
          return classnames({
            avail: true,
            ['member' + i]: true,
            suspended: member.suspended,
            [member.subs]: true
          });
        });
        var _today = DS.todaysDate;
        const closeit = walk => {
          return (
            walk.walkDate < _today && (
              <button
                onClick={() => closeWalkBookings(walk.walkId)}
                style={{ marginLeft: 3 }}
              >
                X
              </button>
            )
          );
        };
        var balance = (account || {}).balance || 0;
        var credit = Math.max(balance, 0);
        var owing = Math.max(-balance, 0);
        return (
          <Panel header={title} body={{ className: bCl }} id="steds_bookings">
            <div className="select">
              <SelectMember options={options} onSelected={memberSelected} />
              <h5>{account && account.name}</h5>
            </div>
            <div className="bTable">
              <div className={'heading bLine mems' + accMembs.length}>
                <div className="title date">
                  Date
                  <br />
                  Venue
                </div>
                <div className="title avail">Available</div>
                {accMembs.map((member, i) => (
                  <div
                    className={mCl[i]}
                    key={member._id}
                    {...delSettings[member.showState]}
                  >
                    {member.firstName}
                  </div>
                ))}
              </div>
              {openWalks.map((walk, w) => (
                <div
                  className={'walk bLine mems' + accMembs.length}
                  key={w + 'XYZ' + walk.walkId}
                >
                  <div className="date">
                    {walk.walkDate}
                    {closeit(walk)}
                    <br />
                    {walk.venue}
                  </div>
                  <div className="avail">{walk.bookingTotals.display}</div>
                  {accMembs.map((member, i) => {
                    let booking = walk.getBooking(member._id);
                    logit('booking', walk.venue, booking);
                    return !booking || booking.status.length > 1
                      ? newBooking(walk, member._id, walk.bookingTotals.full, i)
                      : oldBooking(walk, booking, i);
                  })}
                </div>
              ))}
              <AnnotateBooking />
            </div>

            {/* <ChangeLog accId={accId}/> */}
            <ChangeLog
              account={account}
              lastBanking={store.BP.lastPaymentsBanked}
              store={store}
            />
            <PaymentsBoxes {...{ account, credit, owing }} />
          </Panel>
        );
      }
    }
  )
);
export default Bookings;
