import React from 'react';
import Logit from 'logit';
import { Icon } from './Icon';
var logit = Logit('Reports/CreditOwedRpt');
const styleSpread = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between'
};
const MembersIOU = ({ account }) => {
  const style = {
    account: {
      paddingTop: 5,
      breakInside: 'avoid'
    },
    title: {
      ...styleSpread,
      fontSize: 18
    }
  };
  return (
    <div style={style.account}>
      <div style={style.title}>
        <span>{account.name}</span>
        <span>{`£${account.balance}`}</span>
      </div>
      {account.unclearedBookings
        .filter(bkng => bkng.outstanding && bkng.amount < 0)
        .map(bkng => (
          <Detail bkng={bkng} key={bkng.dat + 'xx'} />
        ))}
    </div>
  );
};

const Detail = ({ bkng }) => {
  const style = {
    icon: { paddingRight: 4, paddingLeft: 4, width: 16, height: 16 },
    box: { ...styleSpread, paddingLeft: 7, paddingRight: 7 }
  };
  return (
    <div key={bkng.dat} style={style.box}>
      <div>
        {bkng.dispDate}
        <Icon type={bkng.req} style={style.icon} />
        <span>
          {bkng.text}
          {bkng.booking.memId.lName}
        </span>
      </div>
      <div>£{-bkng.amount}</div>
    </div>
  );
};

export const CreditsOwedRpt = ({ store }) => {
  // const AS = store.AS;
  var nameCmp = (a, b) => a.sortname.localeCompare(b.sortname);

  const accs = store.AS.accounts.filter(acc => acc.balance > 0).sort(nameCmp);
  logit('credits', accs);
  // const debts = accs.filter(acc => acc.balance < 0);
  return (
    <div style={{ columnCount: 2, columnRule: 'thin solid black', columnGap: '2em' }}>
      {accs
        .filter(acc => acc.balance > 0)
        .map(account => {
          return <MembersIOU account={account} key={account._id} {...{ store }} />;
        })}
    </div>
  );
};
