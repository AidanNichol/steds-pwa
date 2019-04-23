import { types } from 'mobx-state-tree';
import { Member } from './Member';
import { AccountLog } from './AccountLogMin.js';

// const AccountId = types.refinement(types.string, id => /^A\d+$/.test(id));

//┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
//┃   Account Model                                          ┃
//┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
// const loadedAt = new Date();

export const Account = types.model({
  _id: types.refinement(types.identifier, id => /^A\d+$/.test(id)),
  _rev: types.string,
  type: types.literal('account'),
  logs: types.array(AccountLog)
});
