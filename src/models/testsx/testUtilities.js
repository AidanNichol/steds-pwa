import { toJS } from 'mobx';
import chalk from 'chalk';
const name = {
  activeThisPeriod: 'active',
  restartPt: 'RS',
  amount: '£',
  balance: 'Bal'
};
export const showResults = (acc, text, trace = true) => {
  if (!trace) return;
  const description = typeof text === 'string' ? text : text.description;
  console.log(
    chalk.green(
      '=======================',
      chalk.bold(description),
      '========================='
    )
  );
  acc.historicLogs && logTable(acc.historicLogs, 'Historic Logs');
  acc.currentLogs && logTable(acc.currentLogs, 'Current Logs');
  acc.currentBookings && logTable(acc.currentBookings, 'Current Bookings');
  acc.currentPayments && logTable(acc.currentPayments, 'Current Payment');
  acc.resolvedLogs && logTable(acc.resolvedLogs, 'Resolved Logs');
  acc.unresolvedLogs && logTable(acc.unresolvedLogs, 'Unresolved Logs');
  console.log('\n\n\n');
};
export const logTable = (table, title) => {
  if (!table) return;
  console.log(chalk.bold.yellow(title));
  console.table(cleanup(table));
};
const cleanup = arr => {
  return arr.map(it => {
    const ot = {};
    Object.entries(toJS(it)).forEach(([key, val]) => {
      if (
        [
          'machine',
          'who',
          'note',
          'dispDate',
          'paid',
          'toCredit',
          'outstanding',
          'chargable',
          'historic'
        ].includes(key)
      )
        return;
      if (val !== undefined) ot[name[key] || key] = val;
    });
    return ot;
  });
};
