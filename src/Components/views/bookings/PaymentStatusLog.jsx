/* jshint quotmark: false */
import React, { useState, useEffect } from 'react';
import { cold } from 'react-hot-loader';
import { Icon } from '../../utility/Icon';
import classnames from 'classnames';
import { dispDate, today, adjustMonths } from '../../../store/dateFns';
import { useStoreState, useStoreActions } from 'easy-peasy';

// import classNames from 'classnames';
import styled from 'styled-components';
import '../../../styles/logsTable.scss';

import Logit from '../../../logit';
import { sprintf } from 'sprintf-js';
var logit = Logit('components/views/bookings/PaymentStatusLog');

const EditButton = ({ startDate, log, resetLate }) => {
  // if (log.dat < startDate) return null;
  if (log.req === 'BL') {
    return (
      <span onClick={() => resetLate(log)} className='edit_button'>
        <Icon type='BL' />
        &rArr;
        <Icon type='BX' />
      </span>
    );
  }
  if (log.paymentId && log.req !== 'A') {
    return (
      <span
        onClick={() => log.deletePayment()}
        className='edit_button'
        style={{ paddingLeft: '1em' }}
      >
        <Icon name='Cancel' />
      </span>
    );
  }
  return null;
};
const LogRec = styled.div`
  grid-template-columns: 100px 280px 70px 80px;
  display: grid;
  &.rulebefore {
    border-top: thin black double;
  }
  &.ruleAfter {
    border-bottom: thin black solid;
  }
  &.balance {
    font-weight: bold;
  }
  &.historic {
    opacity: 0.5;
  }
  &:hover {
    .edit_button {
      display: block;
    }
  }
  & .edit_button {
    padding-left: 0.5em;
    display: none;
  }
`;
const Payment = styled.div`
  justify-self: flex-end;
  color: green;

  width: auto;
`;
const Booking = styled.div`
  justify-self: flex-start;
  width: auto;
`;
const Amount = styled.span`
  display: inline-block;
  /* padding-left: 1em; */
  padding-right: 1em;
  width: 2em;
  text-align: right;
  padding-right: 6px;
  &.refunded {
    text-decoration: line-through black;
    color: blue;
    opacity: 1;
    padding-right: 0;
  }
`;

const Balance = styled.div`
  justify-self: flex-end;
  font-weight: bold;
  color: green;

  &.debt {
    color: red;
  }
`;
const TheTable = function TheTable(props) {
  const { logs, index, balance, lastBanking, bookingChange, ...rest } = props;
  logit('TheTable', { logs, rest, props, lastBanking });
  const logMoved = (log) =>
    log.moved ? (
      <Icon name='long_arrow_down' width='12' style={{ paddingRight: 2 }} alt='' />
    ) : null;
  const logClasses = (log) => {
    const { ruleAfter, historic, balance } = log;
    return classnames({
      ruleAfter,
      historic,
      balance,
    });
  };
  const amount = (log) => {
    const refund = log.refundId && log.req.length === 1 ? '*' : ' ';
    return sprintf(`%2d%s`, log.amount, refund);
  };
  const resetLate = (log) => {
    const { memberId, walkId } = log;
    bookingChange({ walkId, memberId, req: 'BX' });
  };

  return (
    <div className='scrollBox'>
      {logs
        // .filter((log) => (showAll || !log.hideable) && log.req[0] !== '_')
        .map((log, i) => {
          // logit('logrec', log);
          return (
            <LogRec key={i} className={logClasses(log)}>
              <div className='logDate' title={log.dat || log.paymentId || log.id}>
                <span
                  style={{
                    display: 'inline-block',
                    width: 12,
                  }}
                >
                  {logMoved(log)}
                </span>
                {dispDate(log.dat || log.paymentId || log.id || log.refundId)}
              </div>
              {log.bookingId ? (
                <Booking>
                  <Icon type={log.req} className='icon' />
                  <Amount>{log.fee || ''}</Amount>
                  <span>
                    <span className='text' title={log.walkId}>
                      {index.get(log.walkId).venue}
                      {index.get(log.memberId).shortName}
                    </span>
                  </span>
                </Booking>
              ) : (
                <Payment>
                  <Icon type={log.req} className='icon' />
                  <Amount
                    className={log.refundId && log.req.length === 1 ? 'refunded' : ''}
                  >
                    {amount(log)}
                  </Amount>
                </Payment>
              )}
              <Balance className={log.balance < 0 ? 'debt' : ''}>
                {log.balance !== 0 ? `£${log.balance}` : ''}
                {log.dat > lastBanking ? (
                  <EditButton {...{ resetLate, log, ...rest }} />
                ) : null}
              </Balance>
            </LogRec>
          );
        })}
      {balance !== 0 ? (
        <LogRec>
          <span></span>
          <Btitle>{balance < 0 ? 'Owing' : 'Credit'}</Btitle>
          <Balance className={balance < 0 ? 'debt' : ''}>{` £${balance}`}</Balance>
        </LogRec>
      ) : null}
    </div>
  );
};

export const ChangeLog = cold(ChangeLogR);

function ChangeLogR(props) {
  const { setSortFn, setEndDate } = useStoreActions((a) => a.accountStatus);
  const logs = useStoreState((s) => s.accountStatus.bookingLogData);
  const accountId = useStoreState((s) => s.accountStatus.accountId);
  const firstBookingDate = useStoreState((s) => s.firstBooking);
  const lastBanking = useStoreState((s) => s.banking.latestBanking)?.bankingId.substr(2);
  const bookingChange = useStoreActions((actions) => actions.accountStatus.bookingChange);

  const index = useStoreState((s) => s.names);
  const [endDate, updateEndDate] = useState('Current');

  useEffect(() => {
    updateEndDate('Current');
  }, [accountId]);
  logit('account ChangeLogR start', accountId, endDate);

  const handleChange = (event) => {
    const range = event.target.value;
    logit('selected', event.target.value);
    const diff = { current: 0, SixMonths: -6, OneYear: -12, all: -300 }[range];
    logit('selected', diff);
    const newDate = diff === 0 ? firstBookingDate : adjustMonths(today(), diff);
    logit('selected', event.target.value, range, diff);
    updateEndDate(event.target.value);
    setEndDate(newDate);
  };

  const balance = logs.filter((l) => l?.balance !== 0).reduce((t, l) => t + l.balance, 0);

  return (
    <Table className={'logsTableX ' + (props.className || '')}>
      <div className='logHeader'>
        <span
          className='logDate'
          title='sort by date'
          onClick={() => setSortFn('byDate')}
        >
          Date
        </span>
        <Icon name='Blank' style={{ opacity: 0 }} />
        <span className='logText'>Event</span>
        <span style={{ width: 8, display: 'inline-block' }}>&nbsp;</span>
        {/* <span className='logAmount'>Exp.</span>
        <span className='logAmount'>Inc.</span> */}
        <span
          className='logBal'
          title='sort by payment'
          onClick={() => setSortFn('byPymt')}
        >
          Balance
        </span>

        <select value={endDate} onChange={handleChange}>
          <option value='current'>Current</option>
          <option value='SixMonths'>6 Months</option>
          <option value='OneYear'>1 year</option>
          <option value='all'>All</option>
        </select>
        {/* <span onClick={toggleShowAll} className='showAll screenOnly'>
          {showAll ? '🔽' : '▶️️'}
        </span> */}
        {/* <span onClick={requestPrint} className='showAll print screenOnly'>
          🖨
        </span> */}
      </div>
      <TheTable {...{ balance, logs, index, lastBanking, bookingChange }} />
    </Table>
  );
}
const Btitle = styled.div`
  justify-self: flex-end;
  font-weight: bold;
  font-size: 1.1em;
`;
const Table = styled.div`
  margin-left: 10px;
  border: #bce8f1 solid thin;
  display: grid;
  flex-direction: column;
  grid-template-rows: 30px max-content;
  overflow: auto;

  .logHeader {
    color: #31708f;
    background-color: #d9edf7;
    border-bottom: #bce8f1 solid thin;
    min-height: 30px;
    height: 30px;
    display: flex;

    .showAll {
      margin-left: 19px;
      cursor: pointer;
    }

    span {
      text-align: center;
    }
  }
  .icon {
    display: inline-block;
    min-width: 1.25em;
  }

  .scrollBox {
    flex-grow: 1;
    min-height: 0;
    overflow: auto;
    max-height: calc(99vh - 230px);
  }
`;
