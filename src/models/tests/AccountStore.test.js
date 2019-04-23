import { AccountStore } from '../AccountStore';

it('can-create an instance of accountStore', async () => {
  const AS = AccountStore.create();
  const n = 150;
  await AS.load(n);
  expect(AS.accounts.length).toBe(n);
});
