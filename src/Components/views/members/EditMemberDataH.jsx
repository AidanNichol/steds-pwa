import React, { useState, useEffect } from 'react';
import { useStoreState, useStoreActions } from 'easy-peasy';
import AccountMembers from './AccountMembers';
import Select from 'react-select';

import SuspendButtons from './SuspendButtons';
import classnames from 'classnames';
import { useForm, Controller } from 'react-hook-form';
import styled from 'styled-components';
import TextInput from 'react-textarea-autosize';
import _ from 'lodash';

import TooltipButton from '../../utility/TooltipButton';

import { Panel } from '../../utility/AJNPanel';
import {
  properCaseName,
  properCaseAddress,
  normalizePhone,
} from '../../utility/normalizersH';

import Logit from 'logit';
var logit = Logit('components/views/members/EditMemberData');
const toJS = (data) => JSON.parse(JSON.stringify(data));

const memOpts = { Member: 'Member', Guest: 'Guest', HLM: 'Honary Life Member' };

export const EditMemberData = (props) => {
  logit('props', props);
  const updateMember = useStoreActions((a) => a.members.updateMember);
  const currentMember = useStoreState((s) => s.members.current.data);
  const mem = currentMember || {};
  const [state, setState] = useState({
    dirty: false,
    newMember: currentMember?.newMember,
    editMode: currentMember?.newMember,
    member: mem,
    subsStatus: currentMember?.subsStatus,
  });
  const { register, getValues, setValue, formState, reset, control } = useForm({});
  useEffect(() => {
    logit('form dirty', formState.dirty);
  }, [formState.dirty]);

  logit('snapshot', mem);

  logit('props&state', props, state);

  const saveChanges = () => {
    const values = getValues();
    if (currentMember.newMember) updateMember(values);
    const dirty = formState.dirtyFields;

    const changes = _.pick(values, Array.from(dirty.values()));
    if (changes.roles) {
      changes.roles = changes.roles.map((r) => r.value).join(', ');
    }
    updateMember(changes);
    setEditMode(false);
    // props.saveEdit(state.member);
  };
  const closeEdit = () => {
    setEditMode(false);
    props.closeEdit();
  };
  const deleteMember = () => {
    setEditMode(false);
    props.deleteMember();
  };
  const setEditMode = (v) => {
    setState({ ...state, editMode: v });
  };
  // const setDeletePending = (bool) => {
  //   if (state.deletePending !== bool) setState({ ...state, deletePending: bool });
  // };
  const getShowState = (subsStatus, deleteState) => {
    logit('getShowState In:', subsStatus, deleteState);
    let state = subsStatus === 'ok' ? '' : subsStatus?.toUpperCase()[0];
    if (deleteState >= 'S') state = deleteState;
    logit('getShowState Out:', state);
    return state;
  };

  let { membersAdmin } = props;
  membersAdmin = true;
  let editMember = state.member;
  const editMode = state.editMode;
  if (!state.member.memberId) {
    logit('no member to edit', state);
    return null;
  }
  const { firstName, lastName, subscription, memberStatus, suspended, subsStatus } =
    toJS(editMember) || {};

  // const onChangeData = (name, v) => {
  //   logit('onChangeData', name, v, state.member);
  //   if (state.member[name] === v) return; // unchanged
  //   const mem = { ...state.member, [name]: v };
  //   setState({ ...state, member: mem, dirty: true });
  //   if (['subscription', 'memberStatus', 'deleteState'].includes(name)) {
  //     const subsStatus = mem.subsStatus;
  //     const showState = getShowState(subsStatus.status, mem.deleteState);
  //     setState(() => ({ ...state, subsStatus, showState }));
  //     logit('onChangeData', name, v, mem, subsStatus, showState, state);
  //   }
  // };

  var showMode = !editMode;

  const { deletePending, newMember } = state;
  // if (subsStatus.status !== 'OK')
  var title = (
    <div style={{ width: '100%' }}>
      {firstName}
      {lastName}
      {formState.dirty ? '(changed)' : ''}
      <span
        style={{
          float: 'right',
          hidden: !(editMode && formState.dirty),
          cursor: 'pointer',
        }}
        className='closeWindow'
        onClick={closeEdit}
      >
        {showMode || formState.dirty ? '' : 'X'}
      </span>
    </div>
  );
  const showState = getShowState(subsStatus?.status, mem.deleteState);

  const delSettings =
    {
      D: { 'data-text': 'Subs Due', style: { '--color': 'green' } },
      G: { 'data-text': 'Guest', style: { '--color': 'blue' } },
      L: { 'data-text': 'Subs Late', style: { '--color': 'red' } },
      S: { 'data-text': 'Suspended', style: { '--color': 'black' } },
      X: { 'data-text': 'Delete Me', style: { '--color': 'red' } },
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
  logit('showState', state, showState, delSettings);
  if (!editMember) return null;

  const input = (name, options) => {
    const { onChange, required = false, ...rest } = options || {};
    return (
      <FormLineX className={name}>
        <label>{name}</label>
        <input
          {...rest}
          name={name}
          onChange={onChange}
          ref={register({ required })}
          defaultValue={currentMember[name]}
          disabled={!editMode}
        />
      </FormLineX>
    );
  };

  const select = (name, options, multiple = false) => {
    // const { name, options, required, ...rest } = props;
    let value = editMember[name] || '';
    if (multiple) value = value.split(',');
    return (
      <FormLineX className={name}>
        <label>{name}</label>
        <select
          // {...rest}
          name={name}
          ref={register}
          defaultValue={value}
          disabled={!editMode}
        >
          {Object.entries(options || {}).map(([key, label]) => (
            <option value={key} key={key}>
              {label}
            </option>
          ))}
        </select>
      </FormLineX>
    );
  };
  const textarea = (name, options) => {
    // const {  onChange,required, ...rest } = options;
    // const onChange = (e, ...rest) => {
    //   logit('Textarea returned', e, rest);
    //   if (!e?.target?.value) return;
    //   return { value: e?.target?.value };
    // };
    return (
      <FormLineX className={name}>
        <label>{name}</label>
        <TextInput
          {...options}
          name={name}
          inputRef={register}
          defaultValue={editMember[name]}
          disabled={!editMode}
        />
      </FormLineX>
    );
  };
  const pickRoles = () => {
    const roleOptions = [
      { label: 'Committee', value: 'committee' },
      { label: 'Tester', value: 'tester' },
      { label: 'Uploader', value: 'uploader' },
      { label: 'No receipt', value: 'no-receipt' },
      { label: 'Admin', value: 'admin', isDisabled: true },
      { label: 'Walks', value: 'walks', isDisabled: true },
    ];
    const pickOpt = (roles) => {
      let vals = _.split(roles || '', /, */);
      return _.filter(roleOptions, (opt) => _.includes(vals, opt.value));
    };

    const roles = pickOpt(editMember.role);
    logit('SelectRoles', roles);

    const customStyles = {
      control: (prov) => ({ ...prov, minWidth: 257 }),
      option: (base, { isDisabled }) =>
        isDisabled ? { ...base, display: 'none' } : base,

      multiValueRemove: (base, { data, isDisabled }) => {
        return isDisabled || data.isDisabled ? { ...base, display: 'none' } : base;
      },
    };

    return (
      <FormLineX>
        <label>Roles</label>
        <Controller
          as={Select}
          control={control}
          isMulti
          name='roles'
          styles={customStyles}
          onChange={(selected) => {
            logit('role selected', selected);
            // React Select return object instead of value for selection
            return selected[0];
          }}
          // onChange={(roles) => {
          //   logit('SelectRoles changed', roles);
          //   props.onChange({ target: { value: roles.map((r) => r.value).join(',') } });
          // }}
          options={roleOptions}
          isClearable={false}
          isDisabled={!editMode}
          placeholder={!editMode ? 'No Roles' : 'Select...'}
          removeSelected
          backspaceRemovesValue={false}
          defaultValue={roles}
        />
      </FormLineX>
    );
  };

  // logit('formState', formState, formState.dirty, formState.dirtyFields);

  return (
    <Panel
      className={'show-member-details ' + (editMode ? 'editmode' : 'showMode')}
      header={title}
    >
      <FormContainer className={clss} {...delSettings}>
        <form className='form' disabled={!editMode}>
          {input('lastName', { required: true, onChange: properCaseName })}
          {input('firstName', { required: true, onChange: properCaseName })}

          {textarea('address', { onChange: properCaseAddress })}
          {input('phone', { onChange: normalizePhone })}
          {input('email')}
          {input('mobile')}
          <TwoCol hidden={['Guest', 'HLM'].includes(memberStatus)}>
            {input('subscription', { className: subsStatus?.status })}
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

          {select('memberStatus', memOpts)}
          {textarea('nextOfKin')}
          {textarea('medical')}

          {pickRoles()}
          {input('memberId', { disabled: true })}

          <TwoCol>
            {input('accountId', { disabled: !newMember })}
            <AccountMembers member={editMember} {...{ newMember, editMode }} />
          </TwoCol>
        </form>
        {showState === 'X' ? (
          <img className='stamp' alt='' src='../assets/Deleted Member.svg' />
        ) : null}
        <form className='edit-buttons'>
          <TooltipButton
            className={membersAdmin ? 'edit-member ' : 'edit-member hidden'}
            label='Edit'
            onClick={() => setEditMode(true)}
            visible={showMode && membersAdmin}
          />
          <TooltipButton
            label='Close'
            onClick={closeEdit}
            visible={editMode && !formState.dirty}
          />
          <TooltipButton
            label='Discard'
            onClick={reset}
            visible={editMode && formState.dirty && !deletePending}
          />
          {/* <input type='submit' /> */}
          <TooltipButton
            label='Save'
            onClick={saveChanges}
            tiptext='Save All Changes to this Member'
            // visible
            visible={editMode && !deletePending && formState.dirty}
          />
          <SuspendButtons
            {...{
              editMode,
              showState,
              setValue,
              // onChangeData,
              deleteMember,
              deleteState: editMember.deleteState,
            }}
          />
        </form>
        {/* </form> */}
      </FormContainer>
    </Panel>
  );
};
const TwoCol = styled.div`
  display: flex;
  flex-direction: row;
  & input {
    max-width: 60px;
  }
`;
const FormContainer = styled.div`
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
      opacity: 0.1;
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
const FormLineX = styled.div`
  width: 90%;
  display: flex;
  flex-direction: row;
  align-items: center;

  label {
    padding-right: 10px;
    /* padding-top: 8px; */
    text-align: right;
    vertical-align: top;
    min-width: 110px;
  }

  input {
    width: 300px;
    height: 22px;
  }

  &.subscription,
  &.accountId {
    width: 180px;
  }

  input.due {
    background-color: #ff6;
    margin-right: 6px;
  }

  input.late {
    background-color: #f66;
  }

  div.item-input {
    border: inset 2px rgb(238, 238, 238);
    /* margin-bottom: 5px; */
    margin-top: 8px;
  }
`;
