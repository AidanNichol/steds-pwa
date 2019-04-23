import React from 'react';
import { Icon } from './Icon';

const MembersInvoice = ({ account }) => {
  const style = {
    account: {
      // width: '48%',
      paddingTop: 5,
      breakInside: 'avoid'
    },
    title: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      fontSize: 18
    }
  };
  return (
    <div style={style.account}>
      <div style={style.title}>
        <span>{account.name}</span>
        <span>{`£${-account.balance}`}</span>
      </div>
      {account.unclearedBookings
        .filter(bkng => bkng.outstanding && bkng.amount !== 0)
        .map(bkng => (
          <Detail bkng={bkng} key={bkng.dat + 'xx'} />
        ))}
    </div>
  );
};

const Detail = ({ bkng }) => {
  const style = { icon: { paddingRight: 4, paddingLeft: 4, width: 16, height: 16 } };
  return (
    <div key={bkng.dat} style={{ paddingLeft: 5 }}>
      {bkng.dispDate}
      <Icon type={bkng.req} style={style.icon} />
      <span className="text">{bkng.text} </span>
    </div>
  );
};

export const PaymentsDueRpt = ({ store }) => {
  // const AS = store.AS;
  var nameCmp = (a, b) => a.sortname.localeCompare(b.sortname);

  const accs = store.AS.accounts.filter(acc => acc.balance < 0).sort(nameCmp);
  // const debts = accs.filter(acc => acc.balance < 0);
  return (
    <div style={{ columnCount: 2, columnRule: 'thin solid black', columnGap: '2em' }}>
      {accs
        .filter(acc => acc.balance < 0)
        .map(account => {
          return <MembersInvoice account={account} key={account._id} {...{ store }} />;
        })}
    </div>
  );
};
