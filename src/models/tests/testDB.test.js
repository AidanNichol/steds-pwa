import { db } from '../testDB.js';
it('can access the couchdb ', async () => {
  const item = await db.info();
  expect(item.db_name).toBe('devbookings');
  // expect(item.memNo).toBe(1049);
  // expect(item.members.get('M1049').fullName).toBe('Aidan Nichol');
});
