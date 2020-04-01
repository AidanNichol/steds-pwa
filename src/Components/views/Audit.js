/* jshint quotmark: false, jquery: true */
import React, { useState, useEffect } from 'react';
import { observer, inject } from 'mobx-react';
import { Panel } from '../utility/AJNPanel';

import Logit from 'logit';
import { endOfDecadeWithOptions } from 'date-fns/fp';
var logit = Logit('components/views/Audit');

export const Audit = inject('store')(
  observer(function Audit(props) {
    var { store } = props;
    const { getDumpData, dumpData } = store.AS;
    logit('props', props);
    const [curData, setCurData] = useState();
    const [newData, setNewData] = useState();
    useEffect(() => {
      getDumpData().then(resp => setCurData(resp));
    }, [getDumpData, setCurData]);
    useEffect(() => {
      dumpData().then(resp => setNewData(resp));
    }, [dumpData, setNewData]);

    logit('currData', { curData, newData });
    if (!curData || !newData) return null;
    const diffs = [];
    newData.forEach(acc => {
      // if (diffs.length > 0) return;
      const old = curData[acc._id];
      if (acc.balance !== old.balance || acc.logs.length !== old.logs.length)
        diffs.push({ new: acc, old });
    });
    logit('diffs', diffs);
    var title = <h4>Audit</h4>;

    const Value = ({ label, value, value2 }) => (
      <span>
        {label}: {typeof value === 'boolean' ? (value ? 'true' : 'false') : value}
        {value === value2 ? <>&#9989;</> : <>&#10060;</>}
      </span>
    );
    const Padding = ({ logs, logs2 }) => {
      const diff = logs2.length - logs.length;
      if (diff <= 0) return null;
      const pad = [];
      for (let i = 0; i < diff; i++) {
        pad.push(<div key={i}>&nbsp;</div>);
      }
      return <>{pad}</>;
    };
    const Tick = ({ logs = {}, logs2 = {}, i }) => {
      const j = logs2.length - (logs.length - i);
      if (j < 0) return <div>&nbsp;</div>;
      if (logs[i].balance === logs2[j].balance)
        return (
          <span role='img' aria-label='tick'>
            &#9989;
          </span>
        );
      return (
        <span role='img' aria-label='cross'>
          &#10060;
        </span>
      );
    };
    const ShowLogs = props => (
      <div style={{ minWidth: 350 }}>
        <Padding {...props} />
        {props.logs.map((l, i) => (
          <div
            key={l.dat}
            style={{
              display: 'grid',
              gridTemplateColumns: '100px 30px 200px 30px 30px 30px 30px',
            }}
          >
            <div>{l.dispDate}</div>
            <div>{l.req}</div>
            <div>
              {l.text}
              {l.name}
            </div>
            <div>{l.amount}</div>
            <div>{l.balance}</div>
            <div>{l.hideable ? 'H' : '–'}</div>
            <Tick {...props} i={i} />
          </div>
        ))}
      </div>
    );
    const ShowDiff = ({ diff }) => {
      const { new: N, old: O } = diff;
      // N.logs.sort((a, b) => (a.effDate || a.dat).localeCompare(b.effDate || b.dat));
      return (
        <div>
          <h4>
            {N._id} {N.name}{' '}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div>
              <Value label='Balance' value={O.balance} value2={N.balance} />
              <Value
                label='Active'
                value={O.activeThisPeriod}
                value2={N.activeThisPeriod}
              />
              <br />
              <br />
              <ShowLogs logs={O.logs} logs2={N.logs} />
            </div>
            <div>
              <Value label='Balance' value={N.balance} value2={O.balance} />
              <Value
                label='Active'
                value={N.activeThisPeriod}
                value2={O.activeThisPeriod}
              />{' '}
              <br />
              <br />
              <ShowLogs logs={N.logs} logs2={O.logs} />
            </div>
          </div>
        </div>
      );
    };

    return (
      <Panel header={title}>
        {diffs.map(diff => (
          <ShowDiff {...{ diff }} key={diff.old._id} />
        ))}
        <div className='booked-members'>test</div>
      </Panel>
    );
  }),
);
