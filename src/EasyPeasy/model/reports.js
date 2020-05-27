import { action, thunkOn } from 'easy-peasy';
import Logit from 'logit';
var logit = Logit('easyPeasy/reports');

export const reports = {
  display: false,
  component: null,
  props: {},
  running: false,
  title: '',
  reportReady: false,
  waitingFor: 0,
  ready: new Set(),

  setReport: action((state, { comp, props, title }) => {
    logit('setReport', { comp, props, title });
    state.props = props;
    state.component = comp;
    state.title = title;
    state.display = true;
    state.reportReady = false;
    state.waitingFor = 1;
    state.ready.clear();
  }),
  setDisplay: action((state, bool) => (state.display = bool)),
  setRunning: action((state, bool) => (state.running = bool)),
  setWaitingFor: action((state, count) => {
    state.waitingFor = count;
    state.ready.clear();
    logit('Set WaitingFor:', state.waitingFor);
  }),
  imReady: action((state, who) => {
    // state.waitingFor -= 1;
    if (!state.ready.has(who)) {
      state.ready.add(who);
      logit(who + ' done', 'now ready:', state.ready.size);
    }
  }),
  onImReady: thunkOn(
    (a) => a.imReady,
    (actions, { payload }, { getState }) => {
      const { waitingFor, ready, reportReady } = getState();
      if (waitingFor > ready.size || reportReady) return;
      logit('all done reportRready', payload, waitingFor, ready.size, reportReady);
      setTimeout(() => {
        actions.setReady(true);
      }, 0);
    },
  ),

  setReady: action((state, bool) => {
    state.reportReady = bool;
    logit('wait over. reportReady', bool, state.title);
  }),
};

export default reports;
