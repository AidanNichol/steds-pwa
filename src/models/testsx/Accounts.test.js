import { Account } from '../Account';
import { account as doc } from './testdata/A1049Account1.js';

it('can-create an instance of account', () => {
  const { logs, ...base } = doc;
  const item = Account.create(base);
  item.updateWithDoc(doc);
  // const item = Account.create(account);
  // expect(item.walk.venue).toBe('xxx');
  expect(item.logs.length).toBe(1);
  expect(item.logs[0].req).toBe('P');
});
