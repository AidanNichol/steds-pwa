import React from 'react';
import AccountMembers from './AccountMembers';
import SelectRole from './SelectRole';
import SubscriptionButton from './SubscriptionButton';
import SuspendButtons from './SuspendButtons';
import FormLine from './FormLine';
import ff from './WrappedFormFields';
import { getSubsStatus } from '../../../models/Member';
import { observer } from 'mobx-react';
import { getSnapshot, isStateTreeNode } from 'mobx-state-tree';
import { toJS } from 'mobx';
import classnames from 'classnames';

import TooltipButton from '../../utility/TooltipButton';

import { Panel } from '../../utility/AJNPanel';
import {
  properCaseName,
  properCaseAddress,
  normalizePhone
} from '../../utility/normalizers';

import Logit from 'logit';
var logit = Logit('components/views/members/EditMemberData');
const extractObject = node => (isStateTreeNode(node) && getSnapshot(node)) || node;
export const EditMemberData = observer(
  class EditMemberData extends React.Component {
    constructor(props) {
      super(props);
      logit('props', props);
      let showState = (props.currentMember || {}).showState;
      this.currentMember = props.currentMember;
      const { currentMember } = props;
      const mem = extractObject(props.currentMember);
      logit('snapshot', mem);
      this.state = {
        dirty: false,
        newMember: (currentMember || {}).newMember,
        editMode: (currentMember || {}).newMember,
        showState,
        bacs: false,
        member: mem,
        subsStatus: currentMember.subsStatus
      };
      this.discardChanges = this.discardChanges.bind(this);
      this.setEditMode = this.setEditMode.bind(this);
      this.setDeletePending = this.setDeletePending.bind(this);
      this.setBacs = this.setBacs.bind(this);
      this.saveChanges = this.saveChanges.bind(this);
      this.closeEdit = this.closeEdit.bind(this);
      this.deleteMember = this.deleteMember.bind(this);
      logit('props&state', props, this.state);
    }
    saveChanges() {
      this.setEditMode(false);
      this.props.saveEdit(this.state.member);
    }
    closeEdit() {
      this.setEditMode(false);
      this.props.closeEdit();
    }
    deleteMember() {
      this.setEditMode(false);
      this.props.deleteMember();
    }
    discardChanges() {
      this.setState({ member: extractObject(this.props.currentMember), dirty: false });
    }
    setEditMode(v) {
      this.props.ui.setEditMode(v);
    }
    setDeletePending(bool) {
      if (this.state.deletePending !== bool) this.setState({ deletePending: bool });
    }
    setBacs(bool) {
      if (this.state.bacs !== bool) this.setState({ bacs: bool });
    }
    getShowState(subsStatus, deleteState) {
      let state = subsStatus === 'ok' ? '' : subsStatus.toUpperCase()[0];
      if (deleteState >= 'S') state = deleteState;
      return state;
    }

    render() {
      let { membersAdmin, MS } = this.props;
      membersAdmin = true;
      let editMember = this.state.member;
      const editMode = this.props.ui.editMode;
      if (!this.state.member._id) {
        logit('no member to edit', this.state);
        return null;
      }
      const { firstName, lastName, subscription, memberStatus, suspended } =
        toJS(editMember) || {};

      const onChangeData = (name, v) => {
        logit('onChangeData', name, v, this.state.member);
        if (this.state.member[name] === v) return; // unchanged
        const mem = { ...this.state.member, [name]: v };
        this.setState({ member: mem, dirty: true });
        if (['subscription', 'memberStatus', 'deleteState'].includes(name)) {
          const subsStatus = getSubsStatus(mem.memberStatus, mem.subscription);
          const showState = this.getShowState(subsStatus.status, mem.deleteState);
          this.setState(() => ({ subsStatus, showState }));
          logit('onChangeData', name, v, mem, subsStatus, showState, this.state);
        }
      };
      const deleteMember = this.deleteMember;

      var showMode = !editMode;

      var subsPaid = (fee, bacs) => {
        logit('subsPaid', { fee, bacs });
      };
      const { dirty, deletePending, bacs, newMember, showState } = this.state;
      const subsStatus = this.state.subsStatus || {}; // {due: true, year: 2016, fee: 15, status: 'late'}
      // if (subsStatus.status !== 'OK')
      var title = (
        <div style={{ width: '100%' }}>
          {firstName} {lastName} {dirty ? '(changed)' : ''}
          <span
            style={{
              float: 'right',
              hidden: !(editMode && dirty),
              cursor: 'pointer'
            }}
            className="closeWindow"
            onClick={this.closeEdit}
          >
            {showMode || dirty ? '' : 'X'}
          </span>
        </div>
      );
      const delSettings =
        {
          D: { text: 'Subs Due', style: { '--color': 'green' } },
          G: { text: 'Guest', style: { '--color': 'blue' } },
          L: { text: 'Subs Late', style: { '--color': 'red' } },
          S: { text: 'Suspended', style: { '--color': 'black' } },
          X: { text: 'Delete Me', style: { '--color': 'red' } }
        }[showState] || {};
      let clss = classnames(
        'form-horizontal user-details modal-body ',
        {
          suspended: suspended,
          deleted: deletePending
        },
        subsStatus.status,
        memberStatus
      ).toLowerCase();
      logit('showState', this.state, showState, delSettings);
      if (!editMember) return null;
      let vals = { ...editMember, memId: editMember._id };
      const memOpts = { Member: 'Member', Guest: 'Guest', HLM: 'Honary Life Member' };
      const base = { onChangeData, vals, disabled: !editMode };
      const input = { ...base, Type: ff.Input };
      const textarea = { ...base, Type: ff.Textarea };
      const select = { ...base, Type: ff.Select, options: {} };
      const special = { ...base, Type: 'special' };
      return (
        <Panel
          className={'show-member-details ' + (editMode ? 'editmode' : 'showMode')}
          header={title}
        >
          <div className={clss} {...delSettings}>
            <div className="form">
              <FormLine name="firstName" normalize={properCaseName} {...input} required />
              <FormLine name="lastName" normalize={properCaseName} {...input} required />
              <FormLine name="address" normalize={properCaseAddress} {...textarea} />
              <FormLine name="phone" normalize={normalizePhone} {...input} />
              <FormLine name="email" {...input} />
              <FormLine name="mobile" {...input} />

              <FormLine
                name="subscription"
                className="sub"
                {...input}
                hidden={['Guest', 'HLM'].includes(memberStatus)}
              >
                <SubscriptionButton
                  {...{
                    editMode,
                    showState,
                    bacs,
                    setBacs: this.setBacs,
                    subsStatus: this.state.subsStatus,
                    subscription,
                    subsPaid,
                    onChangeData
                  }}
                />
              </FormLine>
              <FormLine name="memberStatus" {...select} options={memOpts} />
              <FormLine name="nextOfKin" {...textarea} />
              <FormLine name="medical" {...textarea} />

              <FormLine name="roles" {...special} Type={SelectRole} />
              <FormLine name="memId" {...input} disabled />

              <div>
                <FormLine name="accountId" {...input} disabled={!newMember}>
                  <AccountMembers
                    member={editMember}
                    {...{ newMember, editMode }}
                    MS={MS}
                  />
                </FormLine>
              </div>
            </div>
            {showState === 'X' ? (
              <img className="stamp" alt="" src="../assets/Deleted Member.svg" />
            ) : null}
            <div className="edit-buttons">
              <TooltipButton
                className={membersAdmin ? 'edit-member ' : 'edit-member hidden'}
                label="Edit"
                onClick={() => this.setEditMode(true)}
                visible={showMode && membersAdmin}
              />
              <TooltipButton
                label="Close"
                onClick={this.closeEdit}
                visible={editMode && !dirty}
              />
              <TooltipButton
                label="Discard"
                onClick={this.discardChanges}
                visible={editMode && dirty && !deletePending}
              />
              <TooltipButton
                label="Save"
                onClick={this.saveChanges}
                tiptext="Save All Changes to this Member"
                visible={editMode && !deletePending && dirty}
              />
              <SuspendButtons {...{ editMode, showState, onChangeData, deleteMember }} />
            </div>
            {/* </form> */}
          </div>
        </Panel>
      );
    }
  }
);
