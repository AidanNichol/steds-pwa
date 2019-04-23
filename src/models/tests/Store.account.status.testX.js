import { resolveIdentifier, getRoot } from 'mobx-state-tree';
import { Store, emptyStore } from '../Store';
import { DateStore } from '../DateStore';
import { Account } from '../Account';
import { Walk } from '../Walk';

import { db } from '../testDB.js';
import { Booking } from '../Booking';
const testDate = '2019-02-21 14:30:15.123';
jest.setTimeout(30000);
it('can create an instance of Store', async () => {
  const DS = DateStore.create({ today: new Date(testDate) });
  const store = Store.create(emptyStore, { db, useFullHistory: true, DS });
  await store.load();
  expect(store.MS.members.length).toBeGreaterThan(100);
  expect(store.AS.accounts.length).toBeGreaterThan(100);
  expect(store.WS.walks.length).toBeGreaterThan(10);
  const walk = resolveIdentifier(Walk, store, 'W2019-02-16');
  expect(walk.venue).toBe('Elsdon');

  const acc = resolveIdentifier(Account, store, 'A1049');
  expect(acc.bookings.size).toBeGreaterThan(10);
  acc.bookings.forEach(bk => {
    const booking = resolveIdentifier(Booking, store, bk);
    expect(booking.walk._id).toBe(bk.substr(0, 11));
  });
  const res = acc.accountStatusNew;
});
