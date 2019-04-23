/* jshint quotmark: false, jquery: true */
import React from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { observer, inject } from 'mobx-react';

import { Panel } from '../utility/AJNPanel';

import Logit from 'logit';
var logit = Logit('components/views/DisplayReport');

export const DisplayReport = inject('store')(
  observer(function DisplayReport({ store }) {
    logit('props', store);
    const Report = store.ReportComponent;
    const rprops = store.reportProps;

    var title = <h4>Report</h4>;
    return (
      <Panel header={title} className="report">
        {!Report ? null : (
          <div width="1200px" height="800px">
            <Report {...rprops} />
          </div>
        )}
      </Panel>
    );
  })
);
