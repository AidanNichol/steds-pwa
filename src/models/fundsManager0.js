const { sprintf } = require('sprintf-js');
const nbsp = '\u00A0';

export class FundsManager {
  constructor(trace) {
    this.available = { '+': 0, T: 0, P: 0 };
    this.balance = 0;
    this.cashReceivedThisPeriod = 0;
    this.traceMe = Boolean(trace);
    // this.traceMe = true;
    this.activeThisPeriod = false;
    this.newFunds = 0;
    this.prevBalance = 0;
    this.payType = '?';
    this.realActivity = false;
  }
  get okToAddDummyPayments() {
    return this.newFunds === this.balance && this.realActivity;
  }
  resetNewFunds() {
    this.newFunds = 0;
  }
  applyToThisWalk(logs) {
    this.realActivity = false;
    const bLogs = logs
      .filter(log => log.amount !== 0 && !log.ignore)
      .filter(log => /^[BC]/.test(log.req));
    this.traceMe &&
      console.log(
        'applyToThisWalk',
        logs.length,
        bLogs.length,
        logs[0].req,
        logs[0].amount,
      );
    if (bLogs.length === 0) return true;
    let outstanding = true;
    this.realActivity = true;
    let uncleared = null;
    bLogs.forEach(log => {
      log.update({ restartPt: undefined });
      if (log.amount === 0 || !/^[BC]/.test(log.req)) {
        this.showLog(log, '0 👍🏽');
        return;
      }
      if (/^[BC]X$/.test(log.req)) {
        if (uncleared && uncleared.req === log.req[0]) uncleared = null;
        else this.addCredit(log);
        outstanding = false;
      } else if (this.balance - log.amount >= 0) {
        this.useFunds(log);
        outstanding = false;
      } else {
        this.showLog(log, '💰👎🏼');
        outstanding = true;
        uncleared = log;
        // console.log( log.dat, log0.text, log0.amount, this.balance, 'not enough funds', );
      }
      // if (this.newFunds === this.balance && !log.outstanding) {
      //   this.traceMe &&
      //     console.log(
      //       'setting restartPt',
      //       log.req,
      //       this.newFunds,
      //       this.balance,
      //       this,
      //       log
      //     );
      //   log.restartPt = true;
      // }
    });
    logs[0].booking.update({ outstanding });
    return !outstanding;
  }

  addCredit(log) {
    if (!log.ignore) {
      this.available['+'] += Math.abs(log.amount);
      this.balance = Object.values(this.available).reduce((sum, it) => sum + it, 0);
      // this.applyFunds(log.activeThisPeriod || false);
    }

    this.showLog(log);
  }

  addPayment(log) {
    this.realActivity = false;
    let amount = Math.abs(log.amount) * (log.req[1] === 'X' ? -1 : 1);
    log.update({ amount });
    if (log.activeThisPeriod && log.req[0] === 'P') {
      this.cashReceivedThisPeriod += amount;
    }
    if (!this.activeThisPeriod && log.activeThisPeriod) {
      this.transferSurplusToCredit();
      this.activeThisPeriod = log.activeThisPeriod;
    }
    if (amount !== 0) this.available[log.req[0]] += amount;
    this.prevBalance = this.balance;
    this.prevFunds = this.available['P'] + this.available['T'];
    this.payType = log.req[0];
    this.balance += amount;
    this.newFunds = amount;
    this.showLog(log, ' ', this.available);

    // this.applyFunds(log.activeThisPeriod);
  }
  transferSurplusToCredit() {
    if (this.activeThisPeriod || this.available.P + this.available.T === 0) return;
    this.available['+'] += this.available.P + this.available.T;
    this.available.P = 0;
    this.available.T = 0;
    // this.showLog();
  }

  useFunds(log) {
    let owing = log.amount;
    Object.entries(this.available).forEach(([key, val]) => {
      if (!owing) return;
      const spend = Math.min(owing, val);
      this.available[key] -= spend;
      owing -= spend;
      this.balance -= spend;
      log.update({
        paid: { ...log.paid, [key]: log.paid[key] + spend },
        balance: this.balance,
      });
      // if (key === 'P')
      //   log.update({ activeThisPeriod: log.activeThisPeriod || this.activeThisPeriod });
    });
    log.update({ outstanding: false });
    this.showLog(log, '👍🏽');
    return;
  }

  /*-------------------------------------------------*/
  /*         Routines to help with debugging         */
  /*-------------------------------------------------*/
  showLog(log, what = nbsp) {
    if (!this.traceMe) return;
    if (!log) {
      console.log(sprintf('%-86s %s', ' ', this.showPaid(this.available)));
      return;
    }
    const showBool = (bool, label = bool) => (log[bool] ? label + ' ' : '');
    let walk = '';
    if (log.type === 'W') {
      walk = log.walk.code;
    }
    if (log.name) walk += ' ' + log.name.substr(1, 4);
    var txt2 =
      showBool('hideable', 'hide') +
      showBool('activeThisPeriod', 'actv') +
      showBool('historic', 'hist') +
      showBool('ignore', 'ignr') +
      showBool('outstanding', 'outStdng') +
      showBool('restartPt', 'restartPt');
    // var txt3 = log.type === 'W' ? this.showPaid(log.paid || 0) : '';
    var txt3 = this.showPaid(log.paid || {});
    var txt = sprintf(
      '%s %.16s %-21s %2s Am:%3d Bal:%3d, Pd: %-6s, Av: %-7s%s %s',
      log.type === 'A' ? '\n' : '',
      log.dat,
      log.type === 'W' ? `${log.walkId} ${walk}` : 'Payment',
      log.req,
      log.amount || 0,
      this.balance,
      txt3,
      this.showPaid(this.available),
      txt2,
      what,
    );
    console.log(txt);
    return (
      sprintf('%-5s %s', '-' + what, log.dat) +
      (log.type === 'W'
        ? log.walkId
        : sprintf(`$' 11 $' 2 $' 4`, 'Payment', log.req, walk)) // eslint-disable-line no-irregular-whitespace
    );
  }

  showPaid(paid) {
    const xx = { P: '£', T: '₸', '+': '₢' };
    return Object.entries(paid)
      .filter(([, val]) => val !== 0)
      .map(([key, val]) => `${xx[key]}${val}`)
      .join(' ');
  }
}
// export default new FundsManager();
