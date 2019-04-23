import React from 'react';
import TooltipButton from './TooltipButton';
import { observable, autorun, action } from 'mobx';
import { observer, inject } from 'mobx-react';
import Logit from 'logit';
var logit = Logit('component/utility/PrintButton');

const state = observable({
  printRunning: false,
  icon: 'Printer',
  reportName: undefined,
  reportReady: false
});
export const runReport = action(async function(rcomp, rprops, rtitle, store) {
  logit('runReport', rcomp, rprops, rtitle);
  logit('runReport title', rtitle, store);
  store.setReport(rcomp, rprops, rtitle);
  // store.router.setPage({ page: 'report' });
});
autorun(() => {
  logit('printRunning', state.printRunning, state.icon);
});

//----------------------------------------------------------
//      components
//----------------------------------------------------------

export const PrintButton = inject('store')(
  observer(({ tiptext, rcomp, report, rprops, rtitle, store, ...props }) => {
    if (state.printRunning) tiptext = 'Processing Request';
    else if (state.reportName) {
      tiptext = 'Printed saved as ' + state.reportName;
    }
    if (state.reportName) tiptext = 'Printed saved as ' + state.reportName;
    logit('TooltipButton', {
      running: state.printRunning,
      icon: state.icon,
      tiptext,
      props
    });
    return (
      <TooltipButton
        onClick={() => runReport(rcomp, rprops, rtitle, store)}
        {...props}
        tiptext={tiptext}
        icon={state.icon}
        style={{ padding: 2, maxHeight: 40 }}
        iconStyle={{ width: 30, height: 30 }}
      />
    );
  })
);
