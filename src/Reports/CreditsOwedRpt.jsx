import React, { useEffect, useState, memo } from 'react';
import Logit from 'logit';
import { useStoreState, useStoreActions } from 'easy-peasy';
import { fetchData } from '../EasyPeasy/use-data-api';
import { preparePayments } from '../EasyPeasy/model/displayLog2';
import { dispDate } from '../EasyPeasy/dateFns';
import _ from 'lodash';

import { Icon } from './Icon';
var logit = Logit('Reports/CreditOwedRpt');
const styleSpread = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
};
const MembersIOU = memo(({ account, index }) => {
  const style = {
    account: {
      paddingTop: 5,
      breakInside: 'avoid',
    },
    title: {
      ...styleSpread,
      fontSize: 18,
    },
  };
  const balance = account.Payments.reduce((sum, p) => sum + p.available, 0);
  return (
    <div style={style.account}>
      <div style={style.title}>
        <span>{account.name}</span>
        <span>{`£${balance}`}</span>
      </div>
      {account.logs.map((log) => (
        <Detail {...{ log, index }} key={log.dat + 'xx'} />
      ))}
    </div>
  );
});

const Detail = ({ log, index }) => {
  const style = {
    icon: { paddingRight: 4, paddingLeft: 4, width: 16, height: 16 },
    box: { ...styleSpread, paddingLeft: 7, paddingRight: 7 },
  };
  logit('detail', log.req, log);
  return (
    <div key={log.dat} style={style.box}>
      <div>
        {dispDate(log.updatedAt || log.paymentId)}
        <Icon type={log.req} style={style.icon} />
        <span>
          {index.get(log.walkId)?.venue}
          {index.get(log.memberId)?.shortName}
        </span>
      </div>
      <div>£{log.balance}</div>
    </div>
  );
};

export const CreditsOwedRpt = memo((props) => {
  const [credits, setCredits] = useState([]);
  const index = useStoreState((s) => s.names);
  const imReady = useStoreActions((a) => a.reports.imReady);
  useEffect(() => {
    const getIt = async () => {
      const creditsOwed = await fetchData(`creditsOwed`);
      logit('creditsOwed fetchData returned', creditsOwed);
      let accs = _.sortBy(creditsOwed.data, 'sortName');
      accs.forEach((acc) => {
        let logs = preparePayments(acc.Payments, 'byDate');
        acc.logs = logs.filter((l) => l.balance !== 0);
      });
      logit('logsList fetchData returned', accs);

      setCredits(accs);
    };
    getIt();
  }, []);

  logit('credits', credits);
  if (credits.length > 0) imReady('credits');
  // const debts = accs.filter(acc => acc.balance < 0);
  return (
    <div
      style={{
        columnCount: 3,
        columnRule: 'thin solid black',
        columnGap: '2em',
      }}
    >
      {credits.map((account) => {
        return <MembersIOU {...{ account, index }} key={account.accountId} />;
      })}
    </div>
  );
});
