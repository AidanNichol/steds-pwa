import React from 'react';
import { useStoreState, useStoreActions } from 'easy-peasy';
import AccountMembers from './AccountMembers';
import Select from 'react-select';
import { usePaginatedBookingQuery } from '../../../store/use-data-api';
import { queryCache } from 'react-query';
import { Loading } from '../../utility/Icon';
// import useFetch from 'fetch-suspense';

import SuspendButtons from './SuspendButtons';
import classnames from 'classnames';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import TextInput from 'react-textarea-autosize';
import _ from 'lodash';

import TooltipButton from '../../utility/TooltipButton';

import { Panel } from '../../utility/AJNPanel';
import {
  properCaseName,
  properCaseAddress,
  normalizePhone,
  normalizeMobile,
} from '../../utility/normalizersH';

import Logit from '../../../logit';
var logit = Logit('components/views/members/EditMemberData');

const memOpts = { Member: 'Member', Guest: 'Guest', HLM: 'Honary Life Member' };

export const EditMemberData = React.memo(() => {
  const editMode = useStoreState((s) => s.members.editMode);
  const setEditMode = useStoreActions((a) => a.members.setEditMode);

  const updateMember = useStoreActions((a) => a.members.updateMember);
  // const currentMember = useStoreState((s) => s.members.current.data);
  const setCurrentId = useStoreActions((a) => a.members.setCurrentId);

  const memberId = useStoreState((s) => s.members.current.memberId);
  const { register, getValues, setValue, formState, reset } = useForm({});
  const meta = usePaginatedBookingQuery(memberId && ['Member/includeAccount/', memberId]);
  logit('meta', meta);
  const { resolvedData: member, isFetching, status } = meta || {};

  if (!memberId) return null;
  if (status === 'loading' && !member) return <Loading />;

  const saveChanges = () => {
    const values = getValues();
    logit('saveChanges', values, formState, member);
    if (member.newMember) updateMember(values);
    const dirty = formState.dirtyFields;

    const changes = _.pick(values, Array.from(dirty.values()));
    if (changes.roles) {
      changes.roles = changes.roles.map((r) => r.value).join(', ');
    }
    updateMember(changes);
    setEditMode(false);
    queryCache.setQueryData(['Member/includeAccount/', memberId], {
      ...member,
      ...values,
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

  const getShowState = (subsStatus, deleteState) => {
    logit('getShowState In:', subsStatus, deleteState);
    let state = subsStatus === 'ok' ? '' : subsStatus?.toUpperCase()[0];
    if (deleteState >= 'S') state = deleteState;
    logit('getShowState Out:', state);
    return state;
  };

  let membersAdmin = true;

  const { fullName, subscription, memberStatus, suspended, subsStatus } = member || {};

  const deletePending = member.deleteState;
  const newMember = member.newMember;
  // if (subsStatus.status !== 'OK')
  var title = (
    <div style={{ width: '100%' }}>
      {fullName}

      {formState.dirty ? '(changed)' : ''}
      {isFetching && <Loading styleI={{ width: '1em', height: '1em' }} />}
      <span
        style={{
          float: 'right',
          hidden: !editMode || formState.dirty,
          cursor: 'pointer',
        }}
        className='closeWindow'
        onClick={closeEdit}
      >
        {!editMode || formState.dirty ? '' : 'X'}
      </span>
    </div>
  );
  const showState = getShowState(subsStatus?.status, member.deleteState);

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
  logit('showState', memberId, showState, delSettings, subsStatus, member);

  const Input = ({ name, required, onChange, ...rest }) => {
    return (
      <FormLineX className={name}>
        <label>{name}</label>
        <input
          {...rest}
          name={name}
          onChange={onChange}
          ref={register({ required })}
          defaultValue={member[name]}
          disabled={!editMode}
        />
      </FormLineX>
    );
  };

  const MemSelect = ({ name, options }) => {
    let value = member[name] || '';
    return (
      <FormLineX className={name}>
        <label>{name}</label>
        <select name={name} ref={register} defaultValue={value} disabled={!editMode}>
          {Object.entries(options || {}).map(([key, label]) => (
            <option value={key} key={key}>
              {label}
            </option>
          ))}
        </select>
      </FormLineX>
    );
  };
  const Textarea = ({ name, ...options }) => {
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
          ref={register}
          defaultValue={member[name]}
          disabled={!editMode}
        />
      </FormLineX>
    );
  };

  const PickRoles3 = () => {
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

    const roles = pickOpt(member.roles);

    const customStyles = {
      control: (prov) => ({ ...prov, minWidth: 257 }),
      option: (base, { isDisabled }) =>
        isDisabled ? { ...base, display: 'none' } : base,

      multiValueRemove: (base, { data, isDisabled }) => {
        return isDisabled || data.isDisabled ? { ...base, display: 'none' } : base;
      },
    };
    const [values, setReactSelectValue] = React.useState({ selectedOption: roles });
    React.useEffect(() => {
      logit('selectedOptions', values);
    }, [values]);
    const handleMultiChange = (selectedOption) => {
      logit('handleMultiChange', selectedOption);
      setValue('roles', selectedOption);
      setReactSelectValue({ selectedOption });
    };

    React.useEffect(() => {
      register({ name: 'roles', type: 'custom' }); // custom register react-select
    }, []);

    return (
      <FormLineX>
        <label>Roles</label>
        <Select
          name='roles'
          value={values.selectedOption}
          onChange={handleMultiChange}
          isMulti
          styles={customStyles}
          options={roleOptions}
          isClearable={false}
          isDisabled={!editMode}
          placeholder={!editMode ? 'No Roles' : 'Select...'}
          removeSelected
          backspaceRemovesValue={false}
        />
      </FormLineX>
    );
  };

  // logit('formState', formState, formState.dirty, formState.dirtyFields);
  logit('showState@render', memberId, showState, delSettings, subsStatus, member);

  return (
    <Panel
      className={'show-member-details ' + (editMode ? 'editmode' : 'showMode')}
      // header={isFetching ? title + 'fetching...' : title}
      header={title}
    >
      <FormContainer className={clss} {...delSettings}>
        <form className='form' disabled={!editMode}>
          <Input name='lastName' required onChange={properCaseName} />
          <Input name='firstName' required onChange={properCaseName} />

          <Textarea name='address' onChange={properCaseAddress} />
          <Input name='phone' onChange={normalizePhone} />
          <Input name='email' />
          <Input name='mobile' onChange={normalizeMobile} />
          <TwoCol hidden={['Guest', 'HLM'].includes(memberStatus)}>
            <Input name='subscription' className={subsStatus?.status} />
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

          <MemSelect name='memberStatus' options={memOpts} />
          <Textarea name='nextOfKin' />
          <Textarea name='medical' />

          <PickRoles3 />
          <Input name='memberId' />

          <TwoCol>
            <Input name='accountId' disabled={!newMember} />
            <AccountMembers member={member} {...{ newMember, editMode }} />
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
            visible={!editMode && membersAdmin}
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
              deleteState: member.deleteState,
            }}
          />
        </form>
        {/* </form> */}
      </FormContainer>
    </Panel>
  );
});
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
