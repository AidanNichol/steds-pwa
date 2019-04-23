/* jshint quotmark: false, jquery: true */
import React from 'react';
import { observer, inject } from 'mobx-react';

import { types } from 'mobx-state-tree';
import classnames from 'classnames';
import { EditMemberData } from './EditMemberDataM.js';
import { Member } from '../../../models/Member';
import TooltipButton from '../../utility/TooltipButton.js';
import { PrintButton } from '../../utility/PrintButton';
import { MembershipListReport } from '../../../Reports/membershipListRpt';
import { Icon } from '../../utility/Icon';

import { Panel } from '../../utility/AJNPanel';

import Logit from 'logit';
var logit = Logit('components/views/members/membersList');
// const saveChanges = (values)=>{
//   logit('saveChanges', values);
//   membersEditSaveChanges({doc: values, origDoc: members});
// }
//┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
//┃   UIState                                                ┃
//┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
const uiModel = types
  .model({
    dispStart: 0,
    dispLength: 23,
    sortProp: 'name',
    editMode: false,
    modalOpen: false,
    currentMember: types.maybe(Member)
  })
  .actions(self => ({
    setDispStart(no) {
      self.dispStart = no;
      logit('dispStart', self.dispStart);
    },
    setSortProp(no) {
      self.sortProp = no;
    },
    setEditMode(mode) {
      self.editMode = mode;
    },
    setMember(mem) {
      self.currentMember = mem;
    }
  }));
const ui = uiModel.create();

const showResults = values => {
  logit('showResults', values);
  new Promise(resolve => {
    setTimeout(() => {
      // simulate server latency
      window.alert(`You submitted:\n\n${JSON.stringify(values, null, 2)}`);
      resolve();
    }, 500);
  });
};

const Memberslist = inject('store')(
  observer(props => {
    const store = props.store;
    const { MS, AS } = store;
    let currentMember = MS.currentMember || {};
    const saveEdit = memData => {
      logit('saveEdit', currentMember, memData);

      currentMember.saveEdit(memData);
    };
    const createNewMember = () => {
      currentMember = MS.createNewMember();
      ui.setEditMode(true);

      logit('saveEdit', currentMember);
    };
    const deleteMember = () => {
      const { _id, accountId, fullName } = currentMember;
      logit('deleteMember', _id, accountId._id, fullName);
      const account = store.AS.accounts.get(accountId);
      if (account) account.deleteMemberFromAccount(currentMember._id);
      ui.setMember(undefined);
      ui.setEditMode(false);
    };
    const closeEdit = () => {
      ui.setEditMode(false);
      if (!currentMember.newMember) return;
      MS.deleteCurrentMember();
      ui.setMember(undefined);
    };
    const editFunctions = { saveEdit, deleteMember, closeEdit };

    // var props = {
    //   allList: MS.membersSorted,
    //   memberIndex: MS.membersIndex,
    //   membersAdmin: store.signin.isMembersAdmin,
    const setCurrentMember = (memId, dispStart) => {
      logit('setCurrentMember', memId);
      ui.setDispStart(dispStart);
      MS.setCurrentMember(memId);
    };
    logit('props', props);
    const allList = MS.membersSorted(ui);
    var { membersAdmin } = props;

    var list = MS.membersSorted(ui).slice(ui.dispStart, ui.dispStart + ui.dispLength);

    var members = list.map(member => {
      var showMemberStatus =
        member.memberStatus !== 'Member' && member.memberStatus !== 'OK';
      let subsStatus = member.subsStatus.status;
      let clss = classnames(
        'list-line',
        member.memberStatus,
        { current: currentMember._id === member._id },
        member.suspended ? 'suspended' : subsStatus
      );
      return (
        <div
          key={member._id}
          className={clss}
          onClick={() => setCurrentMember(member.memberId, ui.dispStart)}
        >
          <span className="line-name">
            <span className="id">{member._id.substr(1)}</span>
            <span className="name">{member.lastName + ', ' + member.firstName}</span>
          </span>
          <span className="member-status">
            {showMemberStatus ? `(${member.memberStatus})` : ''}
          </span>
        </div>
      );
    });
    logit('memberIndex', MS.membersIndex(ui));
    var index = MS.membersIndex(ui).key.map(([disp, key, start], i, idx) => {
      let value = start;
      let end = i < idx.length - 1 ? idx[i + 1][2] - 1 : allList.length - 1;
      let seeStart = start >= ui.dispStart && start < ui.dispStart + ui.dispLength;
      let seeEnd = end >= ui.dispStart && end < ui.dispStart + ui.dispLength;
      let partVisible = seeStart || seeEnd;
      let allVisible = seeStart && seeEnd;
      let cl = classnames({ indexItem: true, partVisible, allVisible });
      return (
        <div
          className={cl}
          onClick={() => ui.setDispStart(value)}
          key={'mem:index:' + key}
        >
          {disp}
        </div>
      );
    });
    const pageDown = () => {
      ui.setDispStart(
        Math.min(ui.dispStart + ui.dispLength, allList.length - 0.5 * ui.dispLength)
      );
    };
    const pageUp = () => {
      ui.setDispStart(Math.max(ui.dispStart - ui.dispLength, 0));
    };
    var title = <h4>Membership Lists</h4>;
    return (
      <Panel header={title} className="member-list" id="steds_memberlist">
        <div className="sort-buttons" hidden={ui.editMode}>
          <TooltipButton
            key="name"
            className={ui.sortProp === 'name' ? 'active' : ''}
            onClick={() => ui.setSortProp('name')}
            visible
          >
            sort by Name
          </TooltipButton>
          <TooltipButton
            key="number"
            className={ui.sortProp === 'id' ? 'active' : ''}
            onClick={() => ui.setSortProp('id')}
            visible
          >
            sort by Number
          </TooltipButton>
          <TooltipButton
            key="hide"
            className="active"
            onClick={() => MS.toggleHideOld('id')}
            visible
          >
            {MS.hideOld ? 'Show Old' : 'Hide Old'}
          </TooltipButton>
        </div>
        <div className="index" hidden={ui.editMode}>
          <div>
            <Icon name="page_up" onClick={pageUp} />
          </div>
          {index}
          <div>
            <Icon name="page_down" onClick={pageDown} />
          </div>
        </div>
        <div className="names" hidden={ui.editMode}>
          {members}
        </div>
        <EditMemberData
          key={currentMember._rev || currentMember._id}
          className="details"
          {...{ currentMember, MS, AS, ...editFunctions, membersAdmin, ui }}
          onSubmit={showResults}
          onRequestHide={() => ui.setEditMode(false)}
          style={{ minHeight: '100%' }}
        />

        <span className="action-buttons" hidden={ui.editMode}>
          {/* <PrintButton  onClick={()=>summaryReport(printFull)} overlay={printFull ? 'F' : 'W'} onContextMenu={togglePrint} tiptext="Print All  Walks PDF" visible/> */}
          <PrintButton
            // onClick={() => membershipListReport(allList)}
            rcomp={MembershipListReport}
            rprops={{ members: allList }}
            rtitle="St.Edward's Fellwalkers - Members"
            placement="right"
            visible
            tiptext={`Print Membership List (Sorted by ${ui.sortProp})`}
          />
          {/* <PrintButton report='memberslist' payload={allList} placement='right' tiptext={`Print Membership List (Sorted by ${sortProp})`} /> */}
          <TooltipButton
            icon="user_add"
            onClick={createNewMember}
            tiptext="Create a New Member"
            visible
          />
        </span>
      </Panel>
    );
  })
);

export default Memberslist;
