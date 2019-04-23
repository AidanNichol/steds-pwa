import { types, flow, resolveIdentifier, getEnv } from 'mobx-state-tree';
import { AccountStore } from './AccountStore';
import { Account } from './Account';
import { MemberStore } from './MemberStore';
import { WalkStore } from './WalkStore';
import { Banking } from './Banking';
import { SigninState } from './SigninState';
import { Router } from './Router';
import { DS } from './MyDateFns';

//┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
//┃   Walk Store (includes Bookings Information)             ┃
//┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
export const emptyStore = {
  MS: { members: [] },
  AS: { accounts: [] },
  WS: { walks: [] },
  BP: {},
  router: { page: 'buslists' },
  signin: {}
};
export const Store = types
  .model('Store', {
    MS: types.late(() => MemberStore),
    AS: types.late(() => AccountStore),
    WS: types.late(() => WalkStore),
    BP: types.late(() => Banking),
    router: Router,
    signin: types.late(() => SigninState),
    loading: false,
    loaded: false,
    loadingStatus: types.array(types.string)
  })
  .volatile(() => ({
    showReportPortal: false,
    ReportComponent: null,
    reportProps: {}
  }))
  .actions(self => ({
    load: flow(function* load() {
      self.report(' Loading members');
      yield self.MS.load();
      if (self.MS.members.length === 0) yield self.MS.load();
      self.report('Loading lastBanking');
      yield self.BP.load();
      self.report('Loading accounts');
      yield self.AS.load();
      self.report(' Loading walks');
      yield self.WS.load();
      self.report('Loading finished');
      self.loading = false;
      return self;
    }),
    toggleReportPortal() {
      self.showReportPortal = !self.showReportPortal;
    },
    setReport(comp, props, title) {
      self.ReportComponent = comp;
      self.reportProps = props;
      self.reportTitle = title;
      self.showReportPortal = true;
    },
    loadCascade: function loadCascade() {
      console.log('Start load cascade');
      self.loading = true;
      self.cascade = [
        { fn: self.reportStart, text: ' Checking DB' },
        { fn: self.wakeStep, flow: true },
        { fn: self.reportEnd, text: 'DB responded' },
        { fn: self.reportStart, text: ' Loading Members' },
        { fn: self.MS.load, flow: true },
        {
          fn: self.reportEnd,
          text: 'Members loaded: ',
          data: () => self.MS.members.length
        },
        { fn: self.reportStart, text: ' Loading Banking' },
        { fn: self.BP.load, flow: true },
        {
          fn: self.reportEnd,
          text: 'Last Banked: ',
          data: () => self.BP.lastPaymentsBanked
        },
        { fn: self.reportStart, text: ' Loading Accounts' },
        { fn: self.AS.load, flow: true },
        {
          fn: self.reportEnd,
          text: 'Accounts loaded: ',
          data: () => self.AS.accounts.length
        },
        { fn: self.reportStart, text: ' Load walks' },
        { fn: self.WS.load, flow: true },
        { fn: self.reportEnd, text: 'Walks loaded: ', data: () => self.WS.walks.length },
        { fn: self.reportStart, text: ' calc Account Bookings ' },
        { fn: self.WS.addToBookingIndex },
        { fn: self.reportEnd, text: 'Calculated Account Bookings ' },
        { fn: self.reportStart, text: 'Categorize Booking Logs' },
        { fn: self.AS.categorizeAllBookingLogs },
        { fn: self.reportEnd, text: 'Categorize Booking Logs' },
        { fn: self.reportStart, text: 'Calc All Account Status' },
        { fn: self.AS.getAllAccountStatus },
        { fn: self.reportEnd, text: 'All Account Status Calculated ' },
        { fn: self.reportStart, text: ' Loading finished' },
        { fn: self.reportStart, text: '', wait: 1000 },
        { fn: self.loadDone }
      ];
      self.nextStep();
    },
    nextStep(wait = 0) {
      if (self.cascade.length > 0) setTimeout(self.cascadeRunStep, wait);
    },
    cascadeRunStep() {
      if (self.cascade.length === 0) return;
      const { fn, flow, wait, ...params } = self.cascade.shift();
      if (flow) self.flowStep(fn);
      else {
        fn(params);
        self.nextStep(wait);
      }
    },
    wakeStep: flow(function* flowStep() {
      const db = getEnv(self).db;
      let info;
      do {
        try {
          info = yield db.info();
          console.log('info', info);
        } catch (error) {
          console.log('getInfo', error);
        }
      } while (!info);
    }),
    flowStep: flow(function* flowStep(fn) {
      yield fn();
      self.nextStep();
    }),
    reportStart({ text }) {
      self.start = new Date();
      let msg = text === '' ? '' : DS.dispTime + (text ? '∞' : ' ') + text;
      self.loadingStatus.push(msg);
      console.log(msg);
    },
    reportEnd({ text, data = () => '' }) {
      const diff = DS.duration(self.start, new Date());
      let msg = `${DS.dispTime} ✅ ${text} ${data()}(${diff} sec)`;
      self.loadingStatus.pop();
      self.loadingStatus.push(msg);
      console.log(msg);
    },
    loadDone: function loadDone() {
      self.loading = false;
      self.loaded = true;
      return self;
    },
    loadTestData(members, accounts, walks) {
      self.MS.loadTestData(members);
      self.AS.loadTestData(accounts);
      self.WS.loadTestData(walks);
      self.AS.categorizeAllBookingLogs();
      self.AS.getAllAccountStatus();
    }
  }))
  .views(self => ({
    getAccount(id) {
      return resolveIdentifier(Account, self, id);
    }
  }));
