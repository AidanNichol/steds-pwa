import { types } from 'mobx-state-tree';

import { merge } from 'lodash';
import Logit from 'logit';
const logit = Logit('model/Router');
export const Router = types
  .model('Router', {
    page: types.maybe(types.string),
    memberId: types.maybe(types.string),
    accountId: types.maybe(types.string),
    initialized: types.optional(types.boolean, false),
    walkId: types.maybe(types.string)
  })
  .actions(self => ({
    setPage(payload) {
      logit('setPage', payload);
      merge(self, payload);
    }
  }));
