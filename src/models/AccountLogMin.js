import { types } from 'mobx-state-tree';
import { tLogDate } from './customTypes';
const { format, differenceInMonths, parseISO } = require('date-fns');

const chargeFactor = { S: 0, _: 1, '+': -1, P: -1, T: -1, '+X': 1, PX: 1, TX: 1 };

//┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
//┃   Account Log                                            ┃
//┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
const loadedAt = new Date();

export const AccountLog = types
  .model({
    req: types.enumeration(['_', '__', '+', 'P', 'T', '+X', 'PX', 'TX', 'S']),
    dat: tLogDate,
    who: types.maybe(types.string),
    type: types.literal('A'),
    amount: types.number,
    logsFrom: types.maybe(tLogDate),
    restartPt: types.maybe(types.boolean)
  })
  .volatile(() => ({
    balance: 0,
    toCredit: 0,
    historic: false,
    hideable: false
  }))
  .preProcessSnapshot(snapshot => {
    let { logsFrom, ...snp } = snapshot;
    if (logsFrom && logsFrom !== '9999-99-99') {
      logsFrom = (logsFrom + '.000').substr(0, 23);
    } else logsFrom = undefined;
    return { ...snp, logsFrom };
  })
  .views(self => ({
    get netAmount() {
      return self.amount * chargeFactor[self.req];
    },
    get dispDate() {
      const tdat = parseISO(self.dat);
      return format(
        tdat,
        differenceInMonths(tdat, loadedAt) > 6 ? 'dd MMM, yyyy' : 'dd MMM HH:mm'
      );
    },
    get text() {
      return self.note;
    }
  }))
  .actions(self => ({
    updateLog(updates) {
      Object.entries(updates).forEach(([key, value]) => (self[key] = value));
    }
  }));
