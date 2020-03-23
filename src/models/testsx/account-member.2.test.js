import { Account } from '../Account';
import { account } from './testdata/A1049Account.js';
import { Member } from '../Member';
import { member } from './testdata/M1049Member.js';
import { types } from 'mobx-state-tree';
const store = types
  .model({
    member: types.maybe(Member),
    account: types.maybe(Account)
  })
  .actions(self => ({
    init() {
      self.member = Member.create(member);
      self.account = Account.create(account);
    },
    setMember(mem) {
      self.member = mem;
    },
    setAccount(acc) {
      self.account = acc;
    }
  }));
it('can-create an instance of account 3', () => {
  const item = store.create({});
  item.setMember(Member.create(member));
  item.setAccount(Account.create(account));
  expect(item.account.members.length).toBe(1);
  expect(item.account.members[0].fullName).toBe('Aidan Nichol');
  expect(item.account.name).toBe('Aidan Nichol');
});
