import { MemberStore } from '../MemberStore';
import { db } from '../testDB.js';
it('can-create an instance of memberStore', async () => {
  const item = MemberStore.create({}, { db });
  const n = 163;
  await item.load(n);
  expect(item.members.length).toBeGreaterThan(100);
});
