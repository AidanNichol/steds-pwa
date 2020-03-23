import { DateStore } from '../DateStore';
import { Store, emptyStore } from '../Store';

import { db } from '../testDB.js';
const testDate = '2019-02-21 14:30:15.123';

it('can-create an instance of Store', async () => {
  const DS = DateStore.create({ today: new Date(testDate) });
  const store = Store.create(emptyStore, { db, useFullHistory: true, DS });
  // store.DS.setNewDate(new Date(testDate));
  const n = 104;
  await store.WS.load(n);
  expect(store.WS.walks.length).toBeGreaterThan(20);
  // expect(WS.memNo).toBe(1049);
  // expect(WS.findWalk('A1049').members[0].identifier()).toBe('M1049');
});
