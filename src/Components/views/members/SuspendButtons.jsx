// import _ from 'lodash';
import React, { useState } from 'react';
import styled from 'styled-components/macro';
import { isUndeleteable } from './BookingStatus';

import TooltipButton from '../../utility/TooltipButton';
import Logit from '../../../logit';
var logit = Logit('components/views/members/SuspendButtons');

const SuspendButtons = (props) => {
  const { paidUp, deleteMember, deceased, bookingState } = props;
  const { setValue, editMode, className } = props;
  const [deleteState, setDeleteState] = useState(
    props.deleteState || (paidUp ? 'OK' : 'L'),
  );
  if (!editMode) return null;
  const deleteable = !isUndeleteable(bookingState);
  logit('rendering', deleteable, bookingState);
  const newstate = (s) => {
    return () => {
      if (s === 'D') setValue('deceased', true);
      setValue('deleteState', s === 'OK' ? null : s);
      setDeleteState(s);
    };
  };
  // const curState = showState >= 'S' ? showState : 'OK';
  const prevState = ((deleteState) => {
    if (deleteState === 'X')
      return {
        icon: 'user_undelete',
        onClick: newstate(deceased ? 'D' : paidUp ? 'S' : 'L'),
        tiptext: 'Clear the Delete Request',
      };
    if (deleteState === 'S')
      return {
        icon: 'user_enable',
        onClick: newstate('OK'),
        tiptext: 'Unsuspend this Member',
      };
    return { visible: false };
  })(deleteState);
  const nextState = ((deleteState) => {
    if (deleteState === 'X')
      return {
        icon: 'Delete_Member',
        onClick: deleteMember,
        tiptext: 'Permanently Delete Member',
        visible: deleteable,
      };
    if (deleteState === 'OK')
      return {
        icon: 'user_disable',
        onClick: newstate('S'),
        tiptext: 'Suspend this Member',
      };
    return {
      icon: 'user_delete',
      onClick: newstate('X'),
      tiptext: 'Request Member Deletion',
      visible: deleteable,
    };
  })(deleteState);
  const deceasedState = ((deleteState) => {
    if (deleteState === 'X')
      return {
        icon: 'Delete_Member',
        onClick: deleteMember,
        tiptext: 'Permanently Delete Member',
        visible: deleteable,
      };

    return {
      icon: 'user_deceased',
      onClick: newstate('D'),
      tiptext: 'Member Deceased',
      visible: deleteState !== 'D' && deleteState !== 'OK',
    };
  })(deleteState);

  logit('nextState', deleteState, nextState);
  return (
    <div className={'suspend-buttons ' + className}>
      <TooltipButton visible {...nextState} />
      <TooltipButton visible {...deceasedState} />
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
