import React from 'react';
import { inject } from 'mobx-react';
import { ReactComponent as Logo } from '../images/St.EdwardsLogoSimple.svg';

import { BusListRpt } from './BusListRpt';
import { PaymentsDueRpt } from './PaymentsDueRpt';
import { CreditsOwedRpt } from './CreditsOwedRpt';
// import { creditsOwedReport } from './creditsReport2';
import { WalkDayBookingSheet } from './WalkDayBookingSheet';
import { format } from 'date-fns';

import Logit from 'logit';
var logit = Logit('Reports/summaryReport');
const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm');

const Document = props => {
  const style = {
    width: '210mm',
    height: '297mm',
    boxSizing: 'border-box',
    paddingRight: 10,
  };
  return <div style={style}>{props.children}</div>;
};
const Page = props => {
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
      <div>{timestamp}</div>
    </div>
  );
};

export const SummaryReport = inject('store')(({ store, printFull }) => {
  let docname = '/busSummary.pdf';
  logit('name', { docname });
  // title = 'St.Edwards Fellwalkers: ' + (printFull ? 'Full List' : ' Walk Day List');
  // walkDayBookingSheet(doc, printFull);
  // var title = 'St.Edwards Fellwalkers: Bus Lists';
  // busListReport(doc);
  // title = 'St.Edwards Fellwalkers: Credits & Payments';
  // const yStart = creditsOwedReport(doc);
  return (
    <Document
      title="St.Edward's Members"
      author='Booking System'
      subject='Membership List'
    >
      <Page title={' Walk Day List'}>
        <WalkDayBookingSheet {...{ store }} />
      </Page>
      <BusListRpt {...{ store, Page }} />
      <Page title='CreditsOwed'>
        <CreditsOwedRpt {...{ store }} />
      </Page>
      <Page title='Payments Due'>
        <PaymentsDueRpt {...{ store }} />
      </Page>
    </Document>
  );
});
