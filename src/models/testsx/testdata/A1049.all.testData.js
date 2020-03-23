import { A1049Walks } from './A1049.all.bookings';
import { A1049Payments } from './A1049.all.payments';
const A1049 = {
  _id: 'A1049',
  _rev: '62-f81e300ed18f45b084c83257d6ded731',
  type: 'account',
  members: ['M1049'],
  logs: A1049Payments
};

export const M1049 = {
  _id: 'M1049',
  _rev: '23-68dc735b91cfe92e31e3abea7fb1e204',
  type: 'member',
  memberId: 'M1049',
  accountId: 'A1049',
  firstName: 'Aidan',
  lastName: 'Nichol',
  memberStatus: 'Member',
  memNo: 1049
};
const BP = {
  _id: 'BP2019-01-16T21:44',
  _rev: '2-b4c347fc0cc74546bdab272dc2b593aa',
  type: 'paymentSummary',
  startDispDate: '05 Jan 20:42',
  endDispDate: '16 Jan 21:44',
  closingCredit: 68,
  closingDebt: -532,
  openingCredit: 68,
  openingDebt: 444,
  endDate: '2019-02-25T21:44:35.937',
  startDate: '2019-01-05T20:42:45.607'
};
export const testStore = {
  MS: { members: [M1049] },
  AS: { accounts: [A1049] },
  WS: { walks: A1049Walks },
  BP,
  router: {},
  signin: { name: 'sandy', loggedIn: true, roles: ['bookings'] }
};
