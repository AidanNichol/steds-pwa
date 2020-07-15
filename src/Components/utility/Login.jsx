import React, { useEffect, useState, memo } from 'react';
import { useStoreState, useStoreActions } from 'easy-peasy';
const Logit = require('../../logit');
const logit = Logit('store/login');

//---------------------------------------------------------------------
//          Component
//---------------------------------------------------------------------

// export default submit
const errorStyle = { fontWeight: 700, color: '#700' };

export const Login = () => {
  let { login, logout, load } = useStoreActions((a) => a.user);
  const user = useStoreState((s) => s.user);
  let [state, setState] = useState({ username: '', password: '' });
  useEffect(() => {
    logit('loading user');
    load();
  }, [load]);
  useEffect(() => {
    logit('state Changed', state);
  }, [state]);
  // const handleInputChange = (event) => {
  //   const target = event.target;
  const nameChanged = (value) => {
    setState({ ...state, error: '', username: value });
  };
  const passChanged = (value) => {
    setState({ ...state, error: '', password: value });
  };
  // };
  const detectEnter = (event) => {
    if ((event.keyCode || event.which) === 13) {
      logMeIn();
      return false;
    }
  };

  const logMeIn = () => {
    logit('logmeIn', state.username, state.password);
    if (state.username === '') {
      setState({ ...state, error: 'Name Required' });
      return;
    }
    if (state.password === '') {
      setState({ ...state, error: 'Password Required' });
      return;
    }
    login(state);
    return;
  };

  const loggedIn = (
    <div style={{ textAlign: 'right' }}>
      Logged in: {user.username} ({(user.roles || []).join(', ')})
      <button onClick={logout}>Sign Out</button>
    </div>
  );

  const notLoggedIn = (
    <div>
      <table>
        <tbody>
          <tr>
            <td>
              <input
                placeholder='username'
                name='username'
                type='text'
                value={state.name}
                onKeyDown={detectEnter}
                onChange={({ target }) => nameChanged(target.value)}
                onFocus={state.resetUser}
              />
            </td>
            <td>
              <input
                placeholder='password'
                name='password'
                type='password'
                value={state.password}
                onKeyDown={detectEnter}
                onChange={({ target }) => passChanged(target.value)}
              />
            </td>
            <td>
              <button onClick={() => logMeIn()}>Sign In</button>
            </td>
          </tr>
        </tbody>
      </table>
      <span style={errorStyle}>{state.error || user.authError}&nbsp;</span>
    </div>
  );

  return <div className='signin'>{user.ok ? loggedIn : notLoggedIn}</div>;
};

export const LoginForm = memo(Login);
