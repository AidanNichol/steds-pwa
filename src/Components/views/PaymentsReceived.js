/* jshint quotmark: false */
import React from 'react';
import { Panel } from '../utility/AJNPanel';
// import MyModal from '../utility/AJNModal'
import TooltipButton from '../utility/TooltipButton.js';
import classnames from 'classnames';
import { PaymentsSummaryReport } from '../../Reports/PaymentsSummaryReport';
import { PrintButton } from '../utility/PrintButton';
import { runReport } from '../utility/PrintButton';
// import TooltipContent from '../utility/TooltipContent.js';
// import PaymentsSummary from './PaymentsSummary'
// import showNewWindow from 'utilities/showNewWindow.js';
import styled from 'styled-components';
import { Icon } from '../utility/Icon';
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';

import Logit from 'logit';
var logit = Logit('components/views/PaymentsReceived');

const uiState = observable({
  showAll: true,
  toggleNewBookings: () => (uiState.showAll = !uiState.showAll)
});

const detail = observer(({ log, className }) => {
  const cls = classnames({
    detail: true,
    [className]: true,
    newBkng: log.activeThisPeriod && !(log.paid && log.paid.P > 0)
  });
  const paid = [['+', '₢'], ['T', '₸'], ['P', '£']].map(([code, txt]) => {
    return log.paid && log.paid[code] ? (
      <span className={'paid-' + code} key={code}>
        &nbsp;{txt + log.paid[code]}
      </span>
    ) : null;
  });
  return (
    <div className={cls} key={log.dat}>
      {log.dispDate}
      <Icon type={log.req} width="16" />
      <span className="text">{log.text} </span>
      <span className="paid">{paid}</span>
    </div>
  );
});
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

const memberRecipt = observer(props => {
  var { account, showMemberBookings } = props;
  logit('props', account.accName, props);

  return (
    <div className={props.className + ' member-rcpt'}>
      <div className="overview">
        <span className="who" onClick={() => showMemberBookings(account.members[0]._id)}>
          {' '}
          {account.name}
        </span>
        {account.paymentsMade !== 0 ? (
          <TooltipButton className="owed" label={`£${account.paymentsMade}`} visible />
        ) : null}
      </div>
      {account.recentLogs
        .filter(log => log.type === 'W' && log.activeThisPeriod)
        .filter(log => (log.paid && log.paid.P > 0) || uiState.showAll)
        .map(log => (
          <Detail log={log} key={log.dat + 'xx'} />
        ))}
    </div>
  );
});
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

const payments = inject('store')(
  observer(props => {
    var { showPaymentsDue, className, store } = props;
    const startDate = store.BP.startDispDate;

    const actAccs = store.AS.accounts.filter(acc => acc.activeThisPeriod);
    logit('filtered accounts');
    let totalPaymentsMade = 0;
    actAccs.forEach(account => {
      account.paymentsMade = account.logs
        .filter(log => log.activeThisPeriod)
        .reduce((sum, log) => sum + log.amount, 0);
      totalPaymentsMade += account.paymentsMade;
    });
    const accs = actAccs.filter(acc => uiState.showAll || acc.paymentsMade !== 0);
    const payments = actAccs.map(({ _id, paymentsMade, name }) => ({
      accId: _id,
      accName: name,
      paymentsMade
    }));
    const bankMoney = store.BP.bankMoney;
    logit('accs', accs);
    const showMemberBookings = memId =>
      store.router.setPage({ page: 'bookings', memberId: memId });

    var title = (
      <h4>
        Payments Made &nbsp; &nbsp; — &nbsp; &nbsp; Total Payments Received
        <span className="startDate" style={{ fontSize: '0.8em', fontStyle: 'italic' }}>
          (since {startDate})
        </span>
        : &nbsp; £{totalPaymentsMade}
      </h4>
    );
    return (
      <Panel className={'paymentsMade ' + className} header={title}>
        <div className="all-payments">
          <div className="buttons">
            <TooltipButton
              label="Show Payments Due"
              onClick={showPaymentsDue}
              tiptext="Show Payments Due"
              className="tab-select"
              visible
            />
            <TooltipButton
              label={uiState.showAll ? 'Only Payments' : 'All Changes'}
              onClick={uiState.toggleNewBookings}
              placement="bottom"
              tiptext={
                uiState.showAll
                  ? 'Only show new payments'
                  : 'Show all changes this period'
              }
              className="show-range"
              visible
            />
            <PrintButton
              placement="bottom"
              rtitle="Payments Received"
              rcomp={PaymentsSummaryReport}
              tiptext="Print Summary Report"
              visible
            />
            <TooltipButton
              icon="bank"
              placement="bottom"
              onClick={() => {
                runReport(PaymentsSummaryReport, null, 'Payments Received', store);
                bankMoney(payments, totalPaymentsMade);
              }}
              tiptext="Bank the money and start new period"
              visible
            />
          </div>
          {accs
            .filter(
              acc => acc.activeThisPeriod && (uiState.showAll || acc.paymentsMade !== 0)
            )
            .map(account => {
              return (
                <MemberRecipt key={account._id} {...{ account, showMemberBookings }} />
              );
            })}
        </div>
      </Panel>
    );
  })
);

export const PaymentsReceived = styled(payments)`
  border: #bce8f1 solid thin;
  border-collapse: collapse;
  width: 100%;

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
