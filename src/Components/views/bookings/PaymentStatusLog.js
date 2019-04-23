/* jshint quotmark: false */
import { types } from 'mobx-state-tree';
import React from 'react';
import { observer } from 'mobx-react';
import { cold } from 'react-hot-loader';
import { Icon } from '../../utility/Icon';
import classNames from 'classnames';
import '../../../styles/logsTable.scss';

import Logit from 'logit';
var logit = Logit('components/views/bookings/PaymentStatusLog');
//┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
//┃   UIState                                                ┃
//┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
const uiStateModel = types
  .model({
    showMode: types.optional(types.number, 2),
    showAll: types.optional(types.boolean, false)
  })
  .actions(self => ({
    changeMode(v) {
      logit('changeMode', self.showMode, '=>', v);
      self.showMode = v;
    },
    toggleShowAll() {
      self.showAll = !self.showAll;
      logit('showAll', self.showAll);
    }
  }));
const uiState = uiStateModel.create();
const EditButton = ({ startDate, log }) => {
  if (log.dat < startDate) return null;
  if (log.type === 'W' && log.req === 'BL') {
    return (
      <span
        onClick={() => log.resetLateCancellation(log.walkId, log.memId)}
        className="edit_button"
      >
        <Icon type="BL" /> &rArr; <Icon type="BX" />
      </span>
    );
  }
  if (log.type === 'A' && log.req !== 'A') {
    return (
      <span
        onClick={() => log.deletePayment()}
        className="edit_button"
        style={{ paddingLeft: '1em' }}
      >
        <Icon type="Cancel" />
      </span>
    );
  }
  return null;
};

class TheTable extends React.Component {
  render() {
    const { logs, showAll, lastBanking, ...rest } = this.props;
    logit('TheTable', { logs, rest, props: this.props });
    return (
      <div className="scrollBox">
        {logs
          .filter(log => (showAll || !log.hideable) && log.req[0] !== '_')
          .map((log, i) => {
            let rCl = classNames({
              logData: true,
              logRec: true,
              outstanding: log.outstanding,
              historic: log.hideable,
              inbalance: !log.restartPt && log.balance === 0,
              cleared: log.restartPt
            });
            let aCl = classNames({
              logData: true,
              logAmount: true,
              logPay: log.req === 'P',
              fee: log.req !== 'P' && log.amount < 0,
              credit: log.amount > 0 && log.req !== 'A'
            });
            let bCl = classNames({
              logData: true,
              logBal: true,
              credit: log.balance > 0 && log.req[0] !== 'W',
              owing: log.outstanding
            });
            return (
              <div key={i} className={rCl}>
                <span className="logDate" title={log.dat}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 12
                    }}
                  >
                    {log.outOfSequence ? (
                      <img
                        src="../assets/long-arrow-down.svg"
                        style={{ width: 12, paddingRight: 2 }}
                        alt=""
                      />
                    ) : null}
                  </span>
                  {log.dispDate}
                </span>
                <Icon type={log.req} />
                <span className="logText">
                  {log.type !== 'A' && log.name && (
                    <span className="name">{log.name} </span>
                  )}
                  <span className="text" title={log.type === 'W' ? log.walkId : ''}>
                    {log.text}
                  </span>
                </span>
                <span className={aCl}>{log.amount > 0 ? log.amount : ''}</span>
                <span className={aCl}>{log.amount < 0 ? -log.amount : ''}</span>
                <span className={bCl}>
                  {/^[BC]/.test(log.req) || log.type === 'A' ? log.balance : ''}
                </span>

                {log.dat > lastBanking ? <EditButton log={log} {...rest} /> : null}
              </div>
            );
          })}
      </div>
    );
  }
}

export const ChangeLog = observer(cold(ChangeLogR));

function ChangeLogR(props) {
  if (!props.account) return null;

  const { account, lastBanking, ...rest } = props;
  logit('account', { account, rest });
  const { showMode, changeMode, showAll, toggleShowAll } = uiState;
  if (!account) return null;
  // account.extractUnresolvedWalks();

  logit('account', account, account.name);
  var logs = [...account.mergedLogs];
  logit('store 2', logs);

  logit('props', props);
  let _logtable = null;
  const requestPrint = () => {
    logit('requestPrint', _logtable);
    // ipcRenderer.send('printPDF', { content: _logtable, name: 'paymentsLog' });
  };
  return (
    <div className={'logsTable ' + (props.className || '')}>
      <span className="showMode screenOnly">
        <span onClick={() => changeMode(1)} className={showMode === 1 ? 'active' : ''}>
          Old
        </span>
        <span onClick={() => changeMode(2)} className={showMode === 2 ? 'active' : ''}>
          New
        </span>
        <span onClick={() => changeMode(3)} className={showMode === 3 ? 'active' : ''}>
          Future
        </span>
      </span>

      <div className="logHeader">
        <span className="logDate">Date</span>
        <Icon type="Blank" style={{ opacity: 0 }} />
        <span className="logText">Event</span>
        <span style={{ width: 8, display: 'inline-block' }}>&nbsp;</span>
        <span className="logAmount">Exp.</span>
        <span className="logAmount">Inc.</span>
        <span className="logBal">Balance</span>
        <span onClick={toggleShowAll} className="showAll screenOnly">
          {showAll ? '🔽' : '▶️️'}
        </span>
        <span onClick={requestPrint} className="showAll print screenOnly">
          🖨
        </span>
      </div>
      <TheTable {...{ showAll, logs, lastBanking }} />
    </div>
  );
}
