import React from 'react';
import { inject } from 'mobx-react';
import { ReactComponent as Logo } from '../images/St.EdwardsLogoSimple.svg';
import { format } from 'date-fns';

const Logit = require('logit');
var logit = Logit('Reports/PaymentSummaryReport');

const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm');

const Document = props => {
  const style = {
    width: '210mm',
    height: '297mm',
    boxSizing: 'border-box',
    paddingRight: 10
  };
  return <div style={style}>{props.children}</div>;
};
const Page = props => {
  const style = {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    justifyContent: 'flex-start',
    fontSize: 14,
    breakBefore: 'page'
  };
  return (
    <div style={{ ...style, ...props.style }}>
      <Banner title={props.title} />
      {props.children}
    </div>
  );
};

const Banner = ({ title, className }) => {
  const style = {
    justifyContent: 'space-between',
    fontSize: 10,
    display: 'grid',
    gridTemplateColumns: '95px 1fr 95px'
  };
  return (
    <div className={className} style={style}>
      <Logo style={{ padding: 3, height: 30, width: 30 }} />

      <div style={{ fontWeight: 'bold', justifySelf: 'center', fontSize: 20 }}>
        St.Edwards Fellwalkers: {title}
      </div>
      <div>{timestamp}</div>
    </div>
  );
};

export const PaymentsSummaryReport = inject('store')(({ store }) => {
  const startDate = store.BP.startDispDate;
  const start = startDate.substr(0, 16).replace(/:/g, '.');
  let docname = `paymentSummary-${start}.pdf`;
  logit('name', { docname });

  return (
    <Document title="Money Banked" author="Booking System" subject="Money Banked">
      <Page title={' Money Banked '}>
        <PaymentsMade {...{ store }} />
      </Page>
    </Document>
  );
});
const spread = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between'
};
const styles = {
  columns: {
    columnCount: 2
  },
  line: { ...spread, fontWeight: '1.5em' },
  money: {
    display: 'inline-block',
    width: '3em'
  },
  title: {
    textAlign: 'center'
  },
  total: {
    ...spread,
    paddingLeft: '15em',
    paddingRight: '5em'
  }
};
export const PaymentsMade = ({ store }) => {
  const { BP, AS } = store;
  const fmtDate = dat => format(new Date(dat), 'EEE dd MMM');

  let actAccs = AS.accounts.filter(acc => acc.activeThisPeriod);
  logit('filtered accounts');
  let totalPaymentsMade = 0;
  actAccs.forEach(account => {
    account.paymentsMade = account.logs
      .filter(log => log.activeThisPeriod)
      .reduce((sum, log) => sum + log.amount, 0);
    totalPaymentsMade += account.paymentsMade;
  });
  actAccs = actAccs.filter(acc => acc.paymentsMade !== 0);
  return (
    <div style={{ fontSize: '1.2rem' }}>
      <h3 style={styles.title}>{`${fmtDate(BP.startDate)} to ${fmtDate(BP.endDate)}`}</h3>
      <div style={styles.columns}>
        {actAccs.map(account => (
          <div style={styles.line} key={account._id}>
            <span style={styles.who}>{account.name}</span>
            <span style={styles.money}>£{account.paymentsMade}</span>
          </div>
        ))}
      </div>
      <h3 style={styles.total}>
        <span>Cash & Cheques to Bank</span>
        <span style={styles.money}>£{totalPaymentsMade}</span>
      </h3>
    </div>
  );
};
