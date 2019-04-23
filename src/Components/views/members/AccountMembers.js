import React from 'react';
import styled from 'styled-components';
import { Account } from '../../../models/Account';
import { observer } from 'mobx-react';
import TooltipButton from '../../utility/TooltipButton';

import Logit from 'logit';
import { resolveIdentifier } from 'mobx-state-tree';
var logit = Logit('components/views/members/AccountMembers');
const defaultState = { stage: '', addAccount: null };
const AccountMembers = observer(
  class AccountMembers extends React.Component {
    constructor(props) {
      super(props);
      this.state = defaultState;
      this.checkAccount = this.checkAccount.bind(this);
    }

    checkAccount(evt) {
      const { AS } = this.props;
      const mAccId = evt.target.value;
      const addAccount = resolveIdentifier(Account, AS, mAccId);

      const acc = AS.accounts.get(mAccId);
      if (acc) {
        this.setState({ stage: 'F', addAccount });
      } else {
        this.setState({ ...defaultState, stage: '?' });
      }
    }
    render() {
      const { member, newMember, editMode, MS } = this.props;
      logit('props1 ...', this.props, editMode);
      const { props, state } = this;
      if (newMember) return null;
      const thisAccount = MS.currentMember.accountId;
      const mergeRequested = () => this.setState(() => ({ stage: '?' }));
      logit('thisAccount', thisAccount);
      const reset = () => this.setState(defaultState);
      const merge = () => {
        const otherAccount = this.state.otherAccount;
        logit('merge', state, thisAccount, otherAccount);
        thisAccount.mergeInAccount(otherAccount);
        reset();
      };
      const showIf = v => (state.stage === v ? true : false);
      const hideIf = v => (state.stage !== v ? true : false);
      return (
        <div className={`account-box ${props.className}`}>
          {thisAccount.members
            .filter(mem => mem._id !== member._id)
            .map(mem => (
              <div key={mem._id}>
                &nbsp;Also: {mem._id} {mem.fullName}
              </div>
            ))}
          {editMode && (
            <div>
              <TooltipButton
                label="+"
                onClick={mergeRequested}
                tiptext="merge another account into this one"
                visible={editMode && showIf('')}
              />
              {hideIf('') && (
                <div className="active">
                  <div>
                    <input placeholder="Annnn" onChange={this.checkAccount} />
                    {showIf('F') && <span>{state.addAccName}</span>}
                  </div>

                  <button onClick={reset}> Reset </button>
                  {showIf('F') && <button onClick={merge}> Merge </button>}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
  }
);
export default styled(AccountMembers)`
  button,
  input {
    margin: 2px;
  }
  .active {
    width: 210px;
    border: thin solid black;
    margin: 1px;
  }
`;
