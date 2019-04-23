const React = require('react');
const { action } = require('mobx');
const { observer, inject } = require('mobx-react');

const Logit = require('logit');
const logit = Logit('ducks/signin-mobx');
let state;

// //---------------------------------------------------------------------
// //          Identify the machine this is running on
// //---------------------------------------------------------------------

// // let machine;
// getMac((err, macAddr) => {
//   if (err) throw err;
//   state.machine = macAddr;
//   logit('machine', state.machine);
// });
// const getHash = data => {
//   const crypto = require('crypto');
//   const hash1 = crypto.createHash('sha256');

//   hash1.update(data);
//   return hash1.digest('hex');
// };

//---------------------------------------------------------------------
//          Helper Functions
//---------------------------------------------------------------------

//---------------------------------------------------------------------
//          Component
//---------------------------------------------------------------------
const handleInputChange = action(event => {
  const target = event.target;
  state.setValue(target.name, target.value);
});
const detectEnter = action(event => {
  logit('input', event.keyCode, event.which);
  if ((event.keyCode || event.which) === 13) {
    logMeIn();
    return false;
  }
});

const logMeIn = () => {
  logit('logmeIn', state.name, state.password);
  if (state.name === '') {
    state.authError = 'Name Required';
    return;
  }
  if (state.password === '') {
    state.authError = 'Password Required';
    return;
  }
  state.login();
  return;
};

// export default submit
const errorStyle = { fontWeight: 700, color: '#700' };

export const SigninForm = inject('store')(
  observer(({ store }) => {
    state = store.signin;
    logit('signin state', state, store);

    const loggedIn = (
      <div className="right">
        Logged in: {state.name} ({(state.roles || []).join(', ')})
        <button onClick={state.logout}>Sign Out</button>
      </div>
    );

    const notLoggedIn = (
      <div>
        <table>
          <tbody>
            <tr>
              <td>
                <input
                  placeholder="username"
                  name="name"
                  type="text"
                  value={state.name}
                  onKeyDown={detectEnter}
                  onChange={handleInputChange}
                  onFocus={state.resetUser}
                />
              </td>
              <td>
                <input
                  placeholder="password"
                  name="password"
                  type="password"
                  value={state.password}
                  onKeyDown={detectEnter}
                  onChange={handleInputChange}
                />
              </td>
              <td>
                <button onClick={() => logMeIn()}>Sign In</button>
              </td>
            </tr>
          </tbody>
        </table>
        <span style={errorStyle}>{state.authError}&nbsp;</span>
      </div>
    );

    return <div className="signin">{state.ok ? loggedIn : notLoggedIn}</div>;
  })
);
