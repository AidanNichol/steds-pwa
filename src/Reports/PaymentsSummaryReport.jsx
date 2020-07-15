import React from 'react';
import { ReactComponent as Logo } from '../images/St.EdwardsLogoSimple.svg';
import { useStoreActions } from 'easy-peasy';
import { dispDate, getTimestamp } from '../store/dateFns';

const Logit = require('../logit');
var logit = Logit('Reports/PaymentSummaryReport');

const Document = (props) => {
  const style = {
    width: '210mm',
    height: '297mm',
    boxSizing: 'border-box',
    paddingRight: 10,
  };
  return <div style={style}>{props.children}</div>;
};
const Page = (props) => {
  const style = {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    justifyContent: 'flex-start',
    fontSize: 14,
    breakBefore: 'page',
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
    gridTemplateColumns: '95px 1fr 95px',
  };
  return (
    <div className={className} style={style}>
      <Logo style={{ padding: 3, height: 30, width: 30 }} />

      <div style={{ fontWeight: 'bold', justifySelf: 'center', fontSize: 20 }}>
        St.Edwards Fellwalkers: {title}
      </div>
      <div>{getTimestamp()}</div>
    </div>
  );
};

export const PaymentsSummaryReport = ({ banking, accounts }) => {
  const imReady = useStoreActions((a) => a.reports.imReady);

  // logit('rprops', props);
  // const banking = useLatestBanking();
  logit('Banking', banking);
  if (!banking) return null;

  const startDate = dispDate(banking.startDate);
  const start = startDate.substr(0, 16).replace(/:/g, '.');
  let docname = `paymentSummary-${start}.pdf`;
  logit('name', { docname });
  imReady('sum');
  return (
    <Document title='Money Banked' author='Booking System' subject='Money Banked'>
      <Page title={' Money Banked '}>
        <PaymentsMade {...{ banking, accounts }} />
      </Page>
    </Document>
  );
};
const spread = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
};
const styles = {
  columns: {
    columnCount: 2,
  },
  line: { ...spread, fontWeight: '1.5em' },
  money: {
    display: 'inline-block',
    width: '3em',
  },
  title: {
    textAlign: 'center',
  },
  total: {
    ...spread,
    paddingLeft: '15em',
    paddingRight: '5em',
  },
};
export const PaymentsMade = ({ banking, accounts }) => {
  logit('filtered accounts', accounts, banking);
  let totalPaymentsMade = accounts.reduce((sum, acct) => sum + acct.balance, 0);

  return (
    <div style={{ fontSize: '1.2rem' }}>
      <h3 style={styles.title}>
        {`${dispDate(banking.startDate)} to ${dispDate(banking.endDate)}`}
      </h3>
      <div style={styles.columns}>
        {accounts.map((account) => (
          <div style={styles.line} key={account.accountId}>
            <span style={styles.who}>{account.sortName}</span>
            <span style={styles.money}>£{account.balance}</span>
          </div>
        ))}
      </div>
      <h3 style={styles.total}>
        <span>Cash &amp; Cheques to Bank</span>
        <span style={styles.money}>£{totalPaymentsMade}</span>
      </h3>
    </div>
  );
};
