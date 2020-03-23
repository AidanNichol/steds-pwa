import { Account } from '../Account';
import { account } from './testdata/A1049Account.js';
import { Member } from '../Member';
import { member } from './testdata/M1049Member.js';
import { types } from 'mobx-state-tree';
const store = types.model({
  member: Member,
  account: Account
});
// .actions(self => ({
//   init() {
//     self.member = Member.create(member);
//     self.account = Account.create(account);
//   },
// }));
it('can-create an instance of account', () => {
  const my_member = Member.create(member);
  const my_account = Account.create(account);

  const item = store.create({ member: my_member, account: my_account });
  expect(item.account.members.length).toBe(1);
  expect(item.account.members[0].fullName).toBe('Aidan Nichol');
  expect(item.account.name).toBe('Aidan Nichol');
});
