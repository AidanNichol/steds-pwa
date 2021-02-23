import React from 'react';
import { useStoreState, useStoreActions } from 'easy-peasy';
import AccountMembers from './AccountMembers';
// import Select from 'react-select';
import { usePaginatedBookingQuery, useBookingQuery } from '../../../store/use-data-api';
import { queryCache } from 'react-query';
import { Loading } from '../../utility/Icon';
import { ageInMonths, todaysDate } from '../../../store/dateFns';
import { isPaidUp } from '../../../store/model/members';
import { BookingState } from './BookingStatus';

// import useFetch from 'fetch-suspense';

import SuspendButtons from './SuspendButtons';
import classnames from 'classnames';
// import TextareAutosize from '@material-ui/core/TextareaAutosize';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { makeStyles } from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';
import { getSubsStatus } from '../../../store/model/members';
import { useFormFields } from '../../utility/useFormFields';
// import { useTrackDirty } from '../../utility/useFormFields';

import styled from 'styled-components';
import _ from 'lodash';

import TooltipButton from '../../utility/TooltipButton';

import { Panel } from '../../utility/AJNPanel';
import {
  properCaseName,
  properCaseAddress,
  normalizePhone,
  normalizeMobile,
} from '../../utility/normalizers';

import Logit from '../../../logit';
var logit = Logit('components/views/members/EditMemberData');

const useStyles = makeStyles((theme) => ({
  root: {
    '& .MuiTextField-root': {
      margin: theme.spacing(1),
      width: '35ch',
    },
    '& .MuiOutlinedInput-input': {
      padding: '5px 5px 3px 5px',
    },
    '& :not(.MuiInputLabel-shrink).MuiInputLabel-outlined': {
      transform: 'translate(7px, 4px) scale(1)',
    },
    '& .MuiOutlinedInput-multiline': { padding: '4px 0px' },
  },
}));

export const EditMemberData = React.memo(() => {
  const editMode = useStoreState((s) => s.members.editMode);
  const setEditMode = useStoreActions((a) => a.members.setEditMode);

  const updateMember = useStoreActions((a) => a.members.updateMember);
  // const currentMember = useStoreState((s) => s.members.current.data);
  const setCurrentId = useStoreActions((a) => a.members.setCurrentId);

  const memberId = useStoreState((s) => s.members.current.memberId);
  // const { register, getValues, setValue, formState, reset, control } = useForm({});
  const meta = usePaginatedBookingQuery(memberId && ['Member/includeAccount/', memberId]);
  logit('meta', meta);

  const meta2 = useBookingQuery(memberId && ['Member/memStatus/', memberId]);
  const bookingState = meta2?.data;
  logit('meta2', meta2, bookingState);
  const { resolvedData: member, isFetching, status } = meta || {};
  const parseMemberData = (member) => ({
    ...member,
    roles: (member.roles ?? '').split(/, */),
  });
  const {
    isDirty,
    reset,
    formFields,
    createChangeHandler,
    setValue,
    getDirty,
    initializeData,
  } = useFormFields();

  const classes = useStyles();
  const currMemberId = React.useRef('');
  if (!member?.memberId) return null;
  if (status === 'loading' && !member) return <Loading />;
  let deleteable = true;
  const thisYear = todaysDate().substr(0, 4);
  if (bookingState) {
    for (const field of ['Booking', 'Payment']) {
      const last = bookingState['last' + field] ?? '2000-01-01';
      const age = ageInMonths(last);
      bookingState['age' + field] = age;
      bookingState['active' + field] = last.substr(0, 4) === thisYear || age < 5;
    }

    bookingState.active = bookingState.activeBooking || bookingState.activePayment;
    const { debt, credit, active } = bookingState;
    deleteable = (debt ?? 0) === 0 && (credit ?? 0) === 0 && !active;
    logit('bookingState', bookingState, deleteable);
  }

  if (member?.memberId && member?.memberId !== currMemberId.current) {
    logit('about to initialize', memberId, member, currMemberId);
    currMemberId.current = memberId;
    initializeData(parseMemberData(member));
  }

  const saveChanges = () => {
    const changes = getDirty();
    logit('saveChanges', changes, isDirty(), member);
    if (member.newMember) updateMember({ ...member, ...changes });

    if (changes.roles) {
      changes.roles = changes.roles.map((r) => r.value).join(', ');
    }
    updateMember(changes);
    setEditMode(false);
    queryCache.setQueryData(['Member/includeAccount/', memberId], {
      ...member,
      ...changes,
    });
  };

  const closeEdit = () => {
    setEditMode(false);
    if (member.newMember) setCurrentId(undefined);
  };
  const deleteMember = () => {
    setEditMode(false);
    const { memberId, accountId, fullName } = member;
    logit('deleteMember', memberId, accountId.accountId, fullName);
    // MS.deleteCurrentMember();
    setCurrentId(undefined);
  };

  const getShowState = (subsStatus, deleteState, paidUp) => {
    logit('getShowState In:', subsStatus, deleteState, paidUp);
    let state = subsStatus === 'ok' ? '' : subsStatus?.toUpperCase()[0];
    if (!paidUp) state = 'lapsed';
    if (deleteState >= 'S') state = deleteState;
    if (deleteState === 'D') state = 'died';
    // logit('getShowState Out:', state);
    return state;
  };

  let membersAdmin = true;

  const paidUp = isPaidUp(formFields);
  const subsStatus = getSubsStatus(formFields);
  const { fullName, subscription, memberStatus, deceased, suspended } = formFields || {};

  const deletePending = formFields.deleteState;
  const newMember = member.newMember;
  // if (subsStatus.status !== 'OK')
  var title = (
    <div style={{ width: '100%' }}>
      {fullName}

      {isDirty() ? '(changed)' : ''}
      {isFetching && <Loading styleI={{ width: '1em', height: '1em' }} />}
      <span
        style={{
          float: 'right',
          hidden: !editMode || isDirty(),
          cursor: 'pointer',
        }}
        className='closeWindow'
        onClick={closeEdit}
      >
        {!editMode || isDirty() ? '' : 'X'}
      </span>
    </div>
  );
  const showState = getShowState(subsStatus?.status, deletePending, paidUp);

  const delSettings =
    {
      D: { 'data-text': 'Subs Due', style: { '--color': 'green' } },
      G: { 'data-text': 'Guest', style: { '--color': 'blue' } },
      L: { 'data-text': 'Subs Late', style: { '--color': 'red' } },
      lapsed: { 'data-text': 'Lapsed', style: { '--color': 'red' } },
      died: { 'data-text': 'deceased', style: { '--color': 'black' } },
      S: { 'data-text': 'Suspended', style: { '--color': 'orange', '--opacity': 0.3 } },
      X: { 'data-text': 'Delete Me', style: { '--color': 'red', '--opacity': 0.5 } },
    }[showState] || {};
  let clss = classnames(
    'form-horizontal user-details modal-body ',
    {
      suspended: suspended,
      deleted: deletePending,
    },
    subsStatus?.status,
    memberStatus,
  ).toLowerCase();

  logit('showState@render', memberId, showState, delSettings, subsStatus, member);
  const common = (name, normalizer = (x) => x) => ({
    name,
    id: name,
    label: _.startCase(name),
    disabled: !editMode,
    variant: 'outlined',
    value: formFields[name],
    onChange: createChangeHandler(normalizer),
  });
  const roleOptions = ['committee', 'tester', 'uploader', 'no-receipt', 'admin', 'walks'];

  return (
    <Panel
      className={'show-member-details ' + (editMode ? 'editmode' : 'showMode')}
      // header={isFetching ? title + 'fetching...' : title}
      header={title}
    >
      <FormContainer className={clss} {...delSettings}>
        <form className={classes.root}>
          <TextField {...common('lastName', properCaseName)} required />
          <TextField {...common('firstName', properCaseName)} required />

          <TextField multiline {...common('address', properCaseAddress)} />
          <TextField {...common('phone', normalizePhone)} />
          <TextField {...common('email')} />
          <TextField {...common('mobile', normalizeMobile)} />
          <TwoCol hidden={['Guest', 'HLM'].includes(memberStatus)}>
            <TextField
              {...common('subscription')}
              id='subscription'
              className={subsStatus?.status}
              style={{ width: 110 }}
            />
            <TooltipButton
              label={`Paid £${subsStatus?.fee} for ${subsStatus?.year}`}
              onClick={() => {
                setValue('subscription', subsStatus?.year);
              }}
              visible={
                editMode &&
                showState < 'S' &&
                subsStatus?.showSubsButton &&
                subscription !== subsStatus?.year
              }
              style={{ width: 190 }}
            />
          </TwoCol>
          <div style={{ margin: 8 }}>
            <FormControl variant='outlined' style={{ width: 150 }}>
              <InputLabel>Member Status</InputLabel>
              <Select {...common('memberStatus')}>
                <MenuItem value='Member'>Member</MenuItem>
                <MenuItem value='Guest'>Guest</MenuItem>
                <MenuItem value='HLM'>Honary Life Member</MenuItem>
              </Select>
            </FormControl>
          </div>
          <TextField multiline {...common('nextOfKin')} />
          <TextField multiline {...common('medical')} />
          <FormControl variant='outlined' style={{ margin: 8 }}>
            <InputLabel>Roles</InputLabel>
            <Select {...common('roles')} multiple renderValue={(v) => v.join(', ')}>
              {roleOptions.map((role) => (
                <MenuItem key={role} value={role}>
                  <Checkbox checked={formFields.roles?.indexOf(role) > -1} />
                  {role}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {/* <SelectRoles {...common('roles')} /> */}
          <TextField {...common('memberId')} disabled style={{ width: '10ch' }} />

          <TwoCol>
            <TextField
              {...common('accountId')}
              disabled={!newMember}
              style={{ width: '10ch' }}
            />
            <AccountMembers member={member} {...{ newMember, editMode }} />
          </TwoCol>
        </form>
        {/* {showState === 'X' ? (
          <img className='stamp' alt='' src='../assets/Deleted Member.svg' />
        ) : null} */}
        <form className='edit-buttons'>
          {deletePending && <BookingState {...bookingState} />}
          {deletePending}
          <TooltipButton
            className={membersAdmin ? 'edit-member ' : 'edit-member hidden'}
            label='Edit'
            onClick={() => setEditMode(true)}
            visible={!editMode && membersAdmin}
          />
          <TooltipButton
            label='Close'
            onClick={closeEdit}
            visible={editMode && !isDirty()}
          />
          <TooltipButton
            label='Discard'
            onClick={reset}
            visible={editMode && isDirty() && deletePending !== 'X'}
          />
          {/* <input type='submit' /> */}
          <TooltipButton
            label='Save'
            // type='submit'
            onClick={saveChanges}
            tiptext='Save All Changes to this Member'
            // visible
            visible={editMode && deletePending !== 'X' && isDirty()}
          />
          <SuspendButtons
            {...{
              editMode,
              showState,
              setValue,
              bookingState,
              deceased,
              paidUp,
              // onChangeData,
              deleteMember,
              deleteState: deletePending,
            }}
          />
        </form>
        {/* </form> */}
      </FormContainer>
    </Panel>
  );
});
// const BookingState = (props) => {
//   const { credit, debt, ageBooking, activeBooking, agePayment, activePayment } = props;
//   return (
//     <InfoBox disabled>
//       {debt && <div>Debt: £{debt}</div>}
//       {credit && <div>Credit: £{credit}</div>}
//       {activeBooking && <div>Last Booking:{ageBooking}</div>}
//       {activePayment && <div>Last Payment:{agePayment}</div>}
//     </InfoBox>
//   );
// };
// const InfoBox = styled.div`
//   position: relative;
//   background-color: pink;
//   margin-bottom: auto;
//   transition: all 200ms ease-in;
//   font-size: 0.7em;
//   width: 100%100%;
//   &:hover {
//     /* font-size: 0.9em; */
//     z-index: 200;
//     transform: scale(1.8);
//     overflow: visible;
//   }
// `;
const TwoCol = styled.div`
  width: 35ch;
  display: flex;
  flex-direction: row;
  & input {
    max-width: 60px;
  }
`;
const FormContainer = styled.div`
  & #subscription {
    width: 110px;
  }
  & #memberStatus,
  #roles {
    width: 35ch;
  }
  & .due {
    .MuiInputLabel-formControl {
      /* background-color: white; */
    }
    .MuiInputBase-formControl {
      background-color: #ffffab;
      margin-right: 6px;
    }
  }

  & .late {
    .MuiInputLabel-formControl {
      /* background-color: white; */
    }
    .MuiInputBase-formControl {
      background-color: #ffc2c2;
    }
  }

  &[data-text] {
    &::before {
      /*@import './watermark2.css';*/
      cursor: default;
      display: block;
      font-family: sans-serif;
      font-style: italic;
      font-weight: bold;
      width: 7em;
      height: 4em;
      line-height: 100%;
      pointer-events: none;
      position: absolute;
      opacity: var(--opacity, 0.1);
      text-align: center;
      user-select: none;
      z-index: 9999;

      content: attr(data-text);
      transform: rotate(-45deg);
      font-size: 8em;
      color: var(--color, black);
      bottom: 0;
      right: 0.5em;
      top: 1.5em;
      left: 0;
    }
  }
`;
