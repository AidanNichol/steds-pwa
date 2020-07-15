import React, { useEffect, memo } from 'react';
import { Icon } from '../Components/utility/Icon';
import { useStoreState, useStoreActions } from 'easy-peasy';
import Logit from '../logit';
var logit = Logit('Reports/PaymentsDueRpt');

const MembersInvoice = ({ account }) => {
  const style = {
    account: {
      // width: '48%',
      paddingTop: 5,
      breakInside: 'avoid',
    },
    title: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      fontSize: 18,
    },
  };
  return (
    <div style={style.account}>
      <div style={style.title}>
        <span>{account.sortName}</span>
        <span>{`£${account.balance}`}</span>
      </div>
      {account.bookings
        .filter((bkng) => bkng.owing > 0)
        .map((bkng) => (
          <Detail bkng={bkng} key={bkng.bookingId + 'xx'} />
        ))}
    </div>
  );
};

const Detail = ({ bkng }) => {
  const style = {
    icon: { paddingRight: 4, paddingLeft: 4, width: 16, height: 16 },
  };
  return (
    <div key={bkng.bookingId} style={{ paddingLeft: 5 }}>
      {bkng.displayDate}
      <span style={style.icon}>
        <Icon type={bkng.status} />
      </span>
      <span className='text'>
        {bkng.venue}
        {bkng.name}
      </span>
    </div>
  );
};

export const PaymentsDueRpt = memo(() => {
  const accounts = useStoreState((s) => s.payments.debts);
  const getDebts = useStoreActions((a) => a.payments.getDebts);
  const imReady = useStoreActions((a) => a.reports.imReady);

  logit('account', accounts);
  useEffect(() => {
    getDebts();
  }, [getDebts]);
  logit('accounts', accounts);
  if (accounts.length > 0) imReady('debts');
  return (
    <div
      style={{
        columnCount: 3,
        columnRule: 'thin solid black',
        columnGap: '2em',
      }}
    >
      {accounts.map((account) => {
        return <MembersInvoice account={account} key={account.accountId} />;
      })}
    </div>
  );
});
