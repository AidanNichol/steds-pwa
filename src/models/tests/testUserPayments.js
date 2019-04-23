#!/usr/bin/env node
import { resolveIdentifier } from 'mobx-state-tree';
import { Account } from '../Account';
import { Store, emptyStore } from '../Store';

const db = require('../testDB.js');

const debug = require('debug');
// let R = require('ramda');

var fs = require('fs');
// var path = require('path');
const Conf = require('conf');

const settings = new Conf({
  // projectName: 'StEdsBookings',
  // configName: 'StEdsBooking',
  // cwd: '~/Documents/StEdwards',
});
let store;
console.log(settings.get());
console.log(settings.store);

debug.enable('*, -pouchdb*');
var logit = debug('updates');
logit.log = console.log.bind(console);
logit.debug = console.debug.bind(console);
console.log('logit enabled:', logit.enabled);

logit.debug('debug');

const init = async () => {
  logit('monitorLoading', 'start');
  store = Store.create(emptyStore, { db, useFullHistory: true });

  expect(store.MS.members.length).toBe(0);
  await store.load();

  logit('monitorLoading', 'loaded');
  let accId;
  accId = 'A2005'; //margaret Evans
  accId = 'A2024'; // David & Lisa Harris
  accId = 'A2001'; // Julie Edwardson
  accId = 'A122'; // Phil Hickey
  accId = 'A988'; // Gordon Philpott
  accId = 'A718'; // Peter Humpreys
  accId = 'A2041'; // Gwyn Castiaux
  accId = 'A1060'; // Richard Gibson
  accId = 'A1002'; // Christine Ratcliffe
  accId = 'A1003'; // Andrea Bradford
  accId = 'A2052'; // Karen Mallander
  accId = 'A1160'; // Lorraine Allan
  accId = 'A816'; // Jim & Val Davis
  accId = 'A1049'; // Aidan Nichol
  accId = 'A1118'; // Judith Moore
  accId = 'A2069'; // Claire Sandercock
  accId = 'A2027'; // Louise Karmazyn
  accId = 'A1193'; // Lorraine Cooper
  accId = 'A2063'; // Alan Fletcher
  accId = 'A1197'; // Peter Robinson
  const me = resolveIdentifier(Account, store, accId);
  const data = me.accountStatusNew;
  logit('stat', data.accName, data);
  let changed = await me.fixupAccLogs(true);

  dispAccount(data);
  if (changed) {
    logit('changes made', { id: me._id, old: me.logs, logs: data.logs });
    await me.dbUpdate();
  }
  // AS.setFullHistory(false);
  const data2 = me.accountStatusNew;
  logit('stat', data2.accName, data2);
  dispAccount(data2);

  console.log('\n\n\ndone😀');
  // let oldest = {};
};
/*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃                                                          ┃
    ┃                display account status                    ┃
    ┃                                                          ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
  */
const { sprintf } = require('sprintf-js');

function dispAccount(data) {
  const { accId, logs, accName, activeThisPeriod, paymentsMade, balance } = data;
  let txt = '\n\n';
  txt += sprintf(
    'history: %s,  active:%s, payments: %d, balance: %d\n\n%s %s\n\n',
    store.WS.historyStarts,
    activeThisPeriod,
    paymentsMade,
    balance,
    accId,
    accName
  );
  txt += '╔' + '═'.repeat(80) + '╗\n';
  logs.forEach(log => {
    let { dispDate, amount = '', balance = '', text, req, name = '', walkId = ' ' } = log;
    let { darkage, hideable, historic, outstanding, prehistoric, logsFrom } = log;
    const stat =
      (darkage ? 'D' : historic ? '⫷' : hideable ? '⪡' : '<') +
      (outstanding ? '£' : '') +
      (prehistoric ? '!' : '');

    txt += sprintf(
      '║ %-12s %-2s %-11s %-34s %-5s',
      dispDate,
      req,
      walkId,
      text + name,
      stat
    );
    if (req !== 'A') txt += sprintf('£%3d  £%3d', amount, balance);
    else txt += '          ';

    txt += ' ║ ' + (logsFrom ? logsFrom : '') + '\n';
    if (log.restartPt) txt += '╟' + '─'.repeat(80) + '╢\n';
    else if (balance === 0 && amount !== 0) {
      if (log.type === 'A' || /[BC]X?/.test(req)) txt += '╟' + '╴'.repeat(80) + '╢\n';
    }
  });
  txt += '╚' + '═'.repeat(80) + '╝\n';
  // let { mailgunConf } = require(path.resolve(process.cwd(), './config.js'));
  fs.writeFileSync('output.txt', txt);

  logit('formated\n\n', txt);
}
try {
  init();
} catch (error) {
  console.log(error.stack);
}
