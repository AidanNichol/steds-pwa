import { intersection } from 'lodash';
import { getAuth, postAuth } from '../use-data-api';
import { thunk, computed, action, debug } from 'easy-peasy'; // 👈 import the hook

import Logit from 'logit';
const logit = Logit('easyPeasy/SigninState');
const defState = {
  username: '',
  password: '',
  authError: '',
  ok: false,
  roles: [],
};
export const user = {
  ...defState,
};
user.setUser = action((state, payload) => {
  logit('setUser', payload);
  Object.entries(payload).forEach(([key, value]) => (state[key] = value));
  logit('setUser2', debug(state));
});

user.postLogin = thunk(
  (actions, payload, { getStoreActions, getStoreState, getState }) => {
    logit('postLogin', getState());
    if (getState().ok) {
      actions.setPageFromRoles();
      if (getStoreState().loaded) return;
      logit('********* load store data ***************');
      getStoreActions().hydrate();
    }
  },
);

user.login = thunk(async function (actions, payload, { getStoreActions, getStoreState }) {
  try {
    const creds = JSON.stringify(payload);
    var res = await postAuth('loginX', payload);
    const { status, data } = await res;
    logit('login returned', status, data);
    if (status === 'success') {
      localStorage.setItem('stEdsSignin', creds);
      let { username, roles } = data;
      logit('login returning', { ok: true, username, roles });
      actions.setUser({ ok: true, username, roles });
      actions.postLogin();
    } else {
      actions.setUser({ ok: false, authError: `(${data.code}) ${data.message}` });
    }
  } catch (error) {
    logit('signin error: ', error);
    actions.setUser({ ok: false, authError: `(${error.name}) ${error.message}` });
  }
});

user.logout = thunk(async function (actions) {
  logit('logging out');
  await getAuth('logoutX', '');
  localStorage.removeItem('stEdsSignin');
  actions.setUser(defState);
});

user.load = thunk(async function (actions) {
  try {
    const { username, password } = JSON.parse(localStorage.getItem('stEdsSignin')) || {};
    logit('Saved credentials', localStorage.getItem('stEdsSignin'), username, password);
    const response = await getAuth('statusX', '');
    logit('getSession', response);
    if (response.success) {
      const roles = response.data.roles.split(/, ?/);
      actions.setUser({ ...response.data, roles, ok: true });
      actions.postLogin();
    } else {
      if (!username || !password) return;
      return await actions.login({ username, password });
    }
  } catch (error) {
    console.error('Failed to fetch walks', error);
    actions.setUser({ ok: false, authError: `(${error.name}) ${error.message}` });
  }
});
user.setPageFromRoles = thunk((actions, payload, { getStoreActions, getState }) => {
  let page = 'none';
  if (getState().isBookingsAdmin) page = 'bookings';
  else if (getState().isMembersAdmin) page = 'membersList';
  getStoreActions().router.setPage(page);
});
user.isBookingsAdmin = computed((state) => {
  return intersection(state.roles, ['_admin', 'admin', 'bookings']).length > 0;
});
user.isMembersAdmin = computed((state) => {
  return (
    intersection(state.roles, ['_admin', 'admin', 'membership', 'bookings']).length > 0
  );
});
export default user;
