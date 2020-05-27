import React, { useState } from 'react';
import { useStoreActions, useStoreState } from 'easy-peasy';
import styled from 'styled-components';
import TooltipButton from '../../utility/TooltipButton';

import Logit from 'logit';
var logit = Logit('components/views/members/AccountMembers');
const defaultState = { stage: '', addAccount: null };
const AccountMembers = (props) => {
  const setCurrentId = useStoreActions((a) => a.members.setCurrentId);
  const nameIndex = useStoreState((s) => s.names);
  const [state, setState] = useState(defaultState);

  const checkAccount = (evt) => {
    const mAccId = evt.target.value;

    const addAccount = nameIndex.get(mAccId);
    const acc = nameIndex.get(mAccId);
    if (acc) {
      setState({ stage: 'F', addAccount });
    } else {
      setState({ ...defaultState, stage: '?' });
    }
  };
  const { member, newMember, editMode } = props;
  logit('props1 ...', member, newMember, editMode, props);
  if (newMember) return null;
  const thisAccount = member.Account;
  const mergeRequested = () => setState({ ...state, stage: '?' });
  logit('thisAccount', thisAccount);
  const reset = () => setState(defaultState);
  const merge = () => {
    const otherAccount = state.otherAccount;
    logit('merge', state, thisAccount, otherAccount);
    thisAccount.mergeInAccount(otherAccount);
    reset();
  };
  const showIf = (v) => (state.stage === v ? true : false);
  const hideIf = (v) => (state.stage !== v ? true : false);
  return (
    <div className={`account-box ${props.className}`}>
      {thisAccount.Members.filter((mem) => mem.memberId !== member.memberId).map(
        ({ memberId, fullName }) => (
          <div className='member' key={memberId} onClick={() => setCurrentId(memberId)}>
            &nbsp;Also: {memberId}
            {fullName}
          </div>
        ),
      )}
      {editMode && (
        <div>
          <TooltipButton
            label='+'
            onClick={mergeRequested}
            tiptext='merge another account into this one'
            visible={editMode && showIf('')}
          />
          {hideIf('') && (
            <div className='active'>
              <div>
                <input placeholder='Annnn' onChange={checkAccount} />
                {showIf('F') && <span>{state.addAccName}</span>}
              </div>

              <button onClick={reset}>Reset</button>
              {showIf('F') && <button onClick={merge}>Merge</button>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
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
  .member {
    cursor: pointer;
  }
`;
