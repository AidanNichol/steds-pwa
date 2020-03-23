import { WalkStore } from '../WalkStore';

import { db } from '../testDB.js';

it('can-create an instance of walkStore', async () => {
  const WS = WalkStore.create({}, { db, useFullHistory: true });
  const n = 104;
  await WS.load(n);
  expect(WS.walks.length).toBeGreaterThan(20);
  // expect(WS.memNo).toBe(1049);
  // expect(WS.findWalk('A1049').members[0].identifier()).toBe('M1049');
});
