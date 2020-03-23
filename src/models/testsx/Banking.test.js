import { Banking } from '../Banking.js';
import { db } from './testDB.test.js';
it('can-create an instance of member', async () => {
  const BP = Banking.create();
  await BP.load(db);
  // const BP = data.rows[0].doc;
  // Object.entries(BP).forEach(([key, val]) => {
  //   if (typeof val === 'object') delete BP[key];
  // });

  // const item = Banking.create(BP);
  expect(BP.type).toBe('paymentSummary');
  // expect(BP.endDate).toBe('2019-02-02T20:48:19.969');
  // expect(BP.lastPaymentsBanked).toBe('2019-02-02T20:48:19.969');
});
