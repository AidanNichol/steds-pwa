/* jshint quotmark: false */
import React, { useState } from 'react';
import { useStoreState, useStoreActions } from 'easy-peasy';
import { Panel } from '../utility/AJNPanel';
// import MyModal from '../utility/AJNModal'
import TooltipButton from '../utility/TooltipButton';
import classnames from 'classnames';
import { PaymentsSummaryReport } from '../../Reports/PaymentsSummaryReport';
import { PrintButton } from '../utility/PrintButton';
// import TooltipContent from '../utility/TooltipContent';
// import PaymentsSummary from './PaymentsSummary'
// import showNewWindow from 'utilities/showNewWindow';
import styled from 'styled-components';
import { Icon } from '../utility/Icon';
import { dispDate } from '../../EasyPeasy/dateFns';

import Logit from 'logit';
var logit = Logit('components/views/PaymentsReceived');

const detail = ({ booking, className }) => {
  const cls = classnames({
    detail: true,
    [className]: true,
    newBkng: booking.activeThisPeriod && !(booking.paid && booking.paid.P > 0),
  });
  logit('booking', booking);
  // const paid = [
  //   ['+', '₢'],
  //   ['T', '₸'],
  //   ['P', '£'],
  // ].map(([code, txt]) => {
  //   return booking.paid && booking.paid[code] ? (
  //     <span className={'paid-' + code} key={code}>
  //       &nbsp;{txt + booking.paid[code]}
  //     </span>
  //   ) : null;
  // });
  return (
    <div className={cls} key={booking.dat}>
      {booking.displayDate}
      <Icon type={booking.status} width='16' />
      <span className='text'>
        {booking.venue}
        {booking.name}{' '}
      </span>
      <span className='paid'>{booking.amount}</span>
    </div>
  );
};
export const Detail = styled(detail)`
  position: relative;
  padding-left: 3px;
  padding-bottom: 0px;
  margin-bottom: 0px;
  /*padding-left: 3px;*/

  span {
    display: inline-block;
  }

  .paid-C {
    color: brown;
  }

  .paid {
    margin: 2px;
  }
  .paid-T {
    color: blue;
  }
  .text {
    display: inline-block;
    position: relative;
    top: 5px;
    min-width: 115px;
    max-width: 115px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  &.newBkng {
    background-color: rgb(233, 251, 239);
  }

  .name {
    font-size: 0.9em;
    font-style: italic;
  }
`;
const Payment = (props) => {
  const { payment } = props;
  logit('payment', payment);
  return (
    <div>
      {/* <div>
        {payment.displayDate}
        {payment.amount}
      </div> */}
      <>
        {payment.Bookings.map((booking) => (
          <Detail booking={booking} key={booking.bookingId + 'xx'} />
        ))}
      </>
    </div>
  );
};
const memberRecipt = (props) => {
  var { account, showMemberBookings } = props;
  logit('memberRecipt props', account.sortName, account);

  return (
    <div className={props.className + ' member-rcpt'}>
      <div className='overview'>
        <span className='who' onClick={() => showMemberBookings(account.members[0]._id)}>
          {' '}
          {account.sortName}
        </span>
        {account.balance !== 0 ? (
          <TooltipButton className='owed' label={`£${account.balance}`} visible />
        ) : null}
      </div>
      {account.payments.map((payment) => (
        <Payment payment={payment} key={payment.paymentId + 'xx'} />
      ))}
    </div>
  );
};
export const MemberRecipt = styled(memberRecipt)`
  color: #31708f;
  margin-bottom: 5px;
  margin-right: 5px;
  padding-bottom: 4px;
  border: #bce8f1 thin solid;
  border-radius: 5px;
  flex: 0 0 auto;
  /*max-width: 300px;*/

  span {
    display: inline-block;
  }

  .overview {
    background-color: #d9edf7;
    border-radius: 5px;
    border-bottom: #bce8f1 thin solid;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    padding: 2px 5px;
    display: flex;
    justify-content: space-between;
    width: 243px;

    .who {
      /* width: 190px; */
      font-size: 1.1em;
      font-weight: bold;
      padding-right: 5px;
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex-basis: 1 1 190px;
    }

    .owed {
      /* width: 40px; */
      text-align: center;
      font-size: 0.85em;
      padding: 2px;
      flex-basis: 0 0 40px;
    }
  }
`;

const Payments = (props) => {
  var { className, store } = props;
  const paymentsMade = useStoreState((s) => s.payments.paymentsMade);
  const setDisplayDebts = useStoreActions((a) => a.payments.setDisplayDebts);
  const setPage = useStoreActions((a) => a.router.setPage);
  const banking = useStoreState((s) => s.banking.latestBanking);
  const setReport = useStoreActions((a) => a.reports.setReport);
  const [showAll, setShowAll] = useState(true);
  const toggleShowAll = () => setShowAll(!showAll);

  logit('hooky stuff', paymentsMade, banking);
  // if (accounts.length === 0) return null;
  if (!banking) return null;
  const startDate = dispDate(banking.endDate);

  logit('filtered accounts');
  let totalPaymentsMade = 0;
  paymentsMade.forEach((account) => {
    account.payments.forEach((pymt) => {
      totalPaymentsMade += pymt.amount;
    });
  });

  const bankMoney = banking.bankMoney;
  logit('accs', paymentsMade);
  const showMemberBookings = (memId) => {
    store.router.setPage({ page: 'bookings', memberId: memId });
    store.router.setPage({ page: 'bookings', memberId: memId });
    setPage('booking');
  };

  var title = (
    <h4>
      Payments Made &nbsp; &nbsp; — &nbsp; &nbsp; Total Payments Received
      <span className='startDate' style={{ fontSize: '0.8em', fontStyle: 'italic' }}>
        (since {startDate})
      </span>
      : &nbsp; £{totalPaymentsMade}
    </h4>
  );
  return (
    <Panel className={'paymentsMade ' + className} header={title}>
      <div className='all-payments'>
        <div className='buttons'>
          <TooltipButton
            label='Show Payments Due'
            onClick={() => setDisplayDebts()}
            tiptext='Show Payments Due'
            className='tab-select'
            visible
          />
          <TooltipButton
            label={showAll ? 'Only Payments' : 'All Changes'}
            onClick={() => toggleShowAll()}
            placement='bottom'
            tiptext={showAll ? 'Only show new payments' : 'Show all changes this period'}
            className='show-range'
            visible
          />
          <PrintButton
            placement='bottom'
            rtitle='Payments Received'
            rcomp={PaymentsSummaryReport}
            rprops={{ banking, accounts: paymentsMade }}
            tiptext='Print Summary Report'
            visible
          />
          <TooltipButton
            icon='Bank'
            placement='bottom'
            onClick={() => {
              setReport(PaymentsSummaryReport, null, 'Payments Received');
              bankMoney(paymentsMade, totalPaymentsMade);
            }}
            tiptext='Bank the money and start new period'
            visible
          />
        </div>
        {paymentsMade.map((account) => {
          return (
            <MemberRecipt key={account.accountId} {...{ account, showMemberBookings }} />
          );
        })}
      </div>
    </Panel>
  );
};

export const PaymentsMade = styled(Payments)`
  border: #bce8f1 solid thin;
  border-collapse: collapse;
  width: 100%;
  height: 100%;

  .panel-header {
    margin-bottom: 5px;
  }

  span {
    display: inline-block;
  }

  .range,
  .swap-mode {
    font-size: 0.9em;
    max-width: 73px;
    padding: 2px 4px;
  }

  .swap-mode {
    background-color: rgb(186, 231, 245);
  }

  .all-payments {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: flex-start;
    height: 100%;
    flex: 0 0 300px;
    min-width: 0;
    overflow: scroll;

    .buttons {
      display: flex;
      flex-direction: row;
      padding-bottom: 4px;
      align-items: center;
      justify-content: space-between;
      width: 250px;

      .show-range {
        background-color: rgb(184, 226, 247);
      }

      .button {
        max-width: 75px;
        font-size: 0.85em;
      }
    }
  }
`;
