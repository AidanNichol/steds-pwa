import React, { useEffect } from 'react';
import { useStoreActions } from 'easy-peasy';
import { ReactComponent as Logo } from '../images/St.EdwardsLogoSimple.svg';

import { BusListRpt } from './BusListRpt';
import { PaymentsDueRpt } from './PaymentsDueRpt';
import { CreditsOwedRpt } from './CreditsOwedRpt';
// import { creditsOwedReport } from './creditsReport2';
import { WalkDayBookingSheet } from './WalkDayBookingSheet';
import { format } from 'date-fns';
import '@fortawesome/fontawesome-svg-core/styles.css'; // Import the CSS

import Logit from '../logit';
var logit = Logit('Reports/summaryReport');
const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm');

const Page = (props) => {
  const style = {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    justifyContent: 'flex-start',
    fontSize: 14,
    breakBefore: 'page',
  };
  return (
    <html>
      <head></head>
      <body>
        <div style={{ ...style, ...props.style }}>
          <Banner title={props.title} />
          {props.children}
        </div>
      </body>
    </html>
  );
};
const Document = (props) => {
  const style = {
    width: '210mm',
    height: '297mm',
    boxSizing: 'border-box',
    paddingRight: 10,
  };
  return <div style={style}>{props.children}</div>;
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

export const SummaryReport = ({ printFull }) => {
  const setWaitingFor = useStoreActions((a) => a.reports.setWaitingFor);
  useEffect(() => {
    setWaitingFor(4);
  }, [setWaitingFor]);

  let docname = '/busSummary.pdf';
  logit('name', { docname });

  return (
    <Document
      title="St.Edward's Members"
      author='Booking System'
      subject='Membership List'
    >
      <Page title={' Walk Day List'}>
        <WalkDayBookingSheet />
      </Page>
      <BusListRpt {...{ Page }} />
      <Page title='CreditsOwed'>
        <CreditsOwedRpt />
      </Page>
      <Page title='Payments Due'>
        <PaymentsDueRpt />
      </Page>
    </Document>
  );
};
