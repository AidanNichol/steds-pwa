import { resolveIdentifier } from 'mobx-state-tree';
import { Store, emptyStore } from '../Store';
import { DateStore } from '../DateStore';
import { Booking } from '../Booking';
import { Account } from '../Account';
import { Walk } from '../Walk';

import { db } from '../testDB.js';
const testDate = '2019-02-21 14:30:15.123';

it('can create an instance of Store', async () => {
  const DS = DateStore.create({ today: new Date(testDate) });
  const store = Store.create(emptyStore, { db, useFullHistory: true, DS });

  expect(store.MS.members.length).toBe(0);
  await store.MS.load(163);
  if (store.MS.members.length === 0) await store.MS.load(163);

  expect(store.MS.members.length).toBeGreaterThan(100);
  await store.AS.load(150);

  expect(store.AS.accounts.length).toBeGreaterThan(100);
  await store.WS.load(1000);

  expect(store.WS.walks.length).toBeGreaterThan(10);
  const walk = resolveIdentifier(Walk, store, 'W2019-02-16');
  expect(walk.venue).toBe('Elsdon');
  const walk2 = resolveIdentifier(Walk, store, 'W2019-02-02');
  expect(walk2.venue).toBe('Warkworth');
  const booking = resolveIdentifier(Booking, store, 'W2019-02-16M1049');
  expect(booking.status).toBe('B');
  expect(booking.memId.accountId._id).toBe('A1049');
  // const acc = resolveIdentifier(Account, store, 'A1049');
  // expect(acc.bookings.size).toBeGreaterThan(10);
});
