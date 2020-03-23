import { Member } from '../Member';
import { member } from './testdata/M1049Member.js';
it('can-create an instance of member', () => {
  const item = Member.create(member);
  expect(item.firstName).toBe('Aidan');
  expect(item.memNo).toBe(1049);
  expect(item.fullName).toBe('Aidan Nichol');
});
