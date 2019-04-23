// import _ from 'lodash';
import React from 'react';
import styled from 'styled-components';

import TooltipButton from '../../utility/TooltipButton';
import Logit from 'logit';
var logit = Logit('components/views/members/SuspendButtons');

const SuspendButtons = props => {
  const { onChangeData, editMode, deleteMember, showState, className } = props;
  if (!editMode) return null;
  const newstate = s => {
    return () => onChangeData('deleteState', s);
  };
  const curState = showState >= 'S' ? showState : 'OK';
  const prevState = {
    X: {
      icon: 'user_undelete',
      onClick: newstate('S'),
      tiptext: 'Clear the Delete Request'
    },
    S: { icon: 'user_enable', onClick: newstate(''), tiptext: 'Unsuspend this Member' },
    OK: { visible: false }
  }[curState];
  const nextState = {
    X: {
      icon: 'Delete_Member',
      onClick: deleteMember,
      tiptext: 'Permanently Delete Member'
    },
    S: {
      icon: 'user_delete',
      onClick: newstate('X'),
      tiptext: 'Request Member Deletion'
    },
    OK: { icon: 'user_disable', onClick: newstate('S'), tiptext: 'Suspend this Member' }
  }[curState];
  logit('nextState', nextState);
  return (
    <div className={'suspend-buttons ' + className}>
      <TooltipButton visible {...nextState} />
      <TooltipButton visible {...prevState} />
    </div>
  );
};
export default styled(SuspendButtons)`
  display: flex;
  flex-direction: column;
  align-items: center;
  button,
  a[type='button'] {
    img {
      height: 40px;
    }

    padding: 3px 8px;
  }
  img.icon {
    height: 40px;
  }
`;
