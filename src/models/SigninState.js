import { types, applySnapshot, flow, getEnv, getRoot } from 'mobx-state-tree';
import { intersection } from 'lodash';
import Logit from 'logit';
const logit = Logit('model/SigninState');
export const SigninState = types
  .model('SigninState', {
    name: '',
    password: '',
    authError: '',
    ok: false,
    roles: types.array(types.string),
    machine: types.maybe(types.string)
  })
  .actions(self => ({
    setLoggedInUser(data) {
      applySnapshot(self, data);
    },
    login: flow(function* login() {
      try {
        const db = getEnv(self).db;

        const creds = JSON.stringify({ name: self.name, password: self.password });
        var resp = yield db.logIn(self.name, self.password, {
          ajax: {
            body: { name: self.name, password: self.password }
          }
        });
        logit('login', resp);
        self.setLoggedInUser(resp);
        localStorage.setItem('stEdsSignin', creds);
        self.setPageFromRoles();
        getRoot(self).loadCascade();
        return false;
      } catch (error) {
        logit('signin error: ', error);
        self.authError = `(${error.name}) ${error.message}`;
      }
    }),

    logout: flow(function* logout() {
      const db = getEnv(self).db;

      yield db.logOut();
      self.resetUser();
    }),
    setValue(name, val) {
      self[name] = val;
    },
    resetUser() {
      self.setLoggedInUser({
        ok: false,
        name: '',
        password: '',
        roles: [],
        authError: ''
      });
      self.password = '';
      localStorage.removeItem('stEdsSignin');
    },
    load: flow(function* load() {
      const db = getEnv(self).db;
      try {
        logit('db', { db });
        const { name, password } = JSON.parse(localStorage.getItem('stEdsSignin')) || {};
        logit('Saved credentials', localStorage.getItem('stEdsSignin'), name, password);
        const response = yield db.getSession();
        logit('getSession', response);
        if (response.userCtx.name) {
          self.setLoggedInUser({ ...response.userCtx, ok: true });
          self.setPageFromRoles();
          getRoot(self).loadCascade();
        } else {
          if (!name || !password) return;
          self.name = name;
          self.password = password;
          yield self.login();
        }
      } catch (error) {
        console.error('Failed to fetch walks', error);
        self.authError = `(${error.name}) ${error.message}`;
      }
    }),
    setPageFromRoles() {
      const setRouterPage = getRoot(self).router.setPage;
      if (self.isBookingsAdmin) setRouterPage({ page: 'bookings' });
      else if (self.isMembersAdmin) setRouterPage({ page: 'membersList' });
      else setRouterPage({ page: 'none' });
    }
  }))
  .views(self => ({
    get isBookingsAdmin() {
      return intersection(self.roles, ['_admin', 'admin', 'bookings']).length > 0;
    },
    get isMembersAdmin() {
      return (
        intersection(self.roles, ['_admin', 'admin', 'membership', 'bookings']).length > 0
      );
    }
  }));
