import React from 'react';
import { useStoreActions, useStoreState } from 'easy-peasy';
import TooltipButton from './TooltipButton';
import Logit from 'logit';
var logit = Logit('component/utility/PrintButton');

// const state = observable({
//   printRunning: false,
//   icon: "Printer",
//   reportName: undefined,
//   reportReady: false,
// });

//----------------------------------------------------------
//      components
//----------------------------------------------------------

export const PrintButton = ({
  tiptext,
  rcomp,
  report,
  rprops,
  rtitle,
  store,
  ...props
}) => {
  const setReport = useStoreActions((a) => a.reports.setReport);
  const printRunning = useStoreState((s) => s.reports.running);
  const reportName = useStoreState((s) => s.reports.title);
  const runReport = (comp, props, title) => {
    logit('runReport', { comp, props, title });
    logit('runReport title', title);
    setReport({ comp, props, title });
    // store.router.setPage({ page: 'report' });
  };
  if (printRunning) tiptext = 'Processing Request';
  else if (reportName) {
    tiptext = 'Printed saved as ' + reportName;
  }
  if (reportName) tiptext = 'Printed saved as ' + reportName;
  logit('TooltipButton', {
    running: printRunning,
    tiptext,
    props,
  });
  return (
    <TooltipButton
      onClick={() => runReport(rcomp, rprops, rtitle)}
      {...props}
      tiptext={tiptext}
      icon={'Printer'}
      style={{ padding: 2, maxHeight: 40 }}
      iconStyle={{ width: 30, height: 30 }}
    />
  );
};
