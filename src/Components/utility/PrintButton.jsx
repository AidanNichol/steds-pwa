import React from 'react';
import { useStoreActions, useStoreState } from 'easy-peasy';
// import NewWindow from 'react-new-window';

import TooltipButton from './TooltipButton';
import Logit from '../../logit';
var logit = Logit('component/utility/PrintButton');

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
  onClick,
  ...props
}) => {
  const setReport = useStoreActions((a) => a.reports.setReport);
  const printRunning = useStoreState((s) => s.reports.display);
  const reportName = useStoreState((s) => s.reports.title);

  const runReport = (comp, props, title) => {
    logit('runReport', { comp, props, title });
    logit('runReport title', title);
    if (onClick) onClick();
    setReport({ comp, props, title });
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
    <React.Fragment>
      <TooltipButton
        onClick={() => runReport(rcomp, rprops, rtitle)}
        {...props}
        tiptext={tiptext}
        icon={printRunning ? 'spinner' : 'Printer'}
        style={{ padding: 2, width: 75 }}
        iconStyle={{ width: 30, height: 30 }}
      />
      {/* {display && (
        <NewWindow
          ref={printWindow}
          title={title}
          copyStyles={true}
          center={'screen'}
          features={{
            width: Math.min(window.screen.width, 850),
            height: Math.min(window.screen.height, 850),
          }}
        >
          <PrintButton wRef={printWindow} />
          <Report {...rprops} />
        </NewWindow>
      )} */}
    </React.Fragment>
  );
};
