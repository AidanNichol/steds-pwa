/* jshint quotmark: false, jquery: true */
import React, { useState } from 'react';
import { useStoreState, useStoreActions } from 'easy-peasy';

import classnames from 'classnames';
import { EditMemberData } from './EditMemberDataH.jsx';
import TooltipButton from '../../utility/TooltipButton';
import { PrintButton } from '../../utility/PrintButton';
import { MembershipListReport } from '../../../Reports/membershipListRpt';
import { Icon } from '../../utility/Icon';

import { Panel } from '../../utility/AJNPanel';

import Logit from 'logit';
var logit = Logit('components/views/members/membersList');
//┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
//┃   UIState                                                ┃
//┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
const uiModel = {
  dispStart: 0,
  dispLength: 23,
  sortProp: 'sortName',
  editMode: false,
  modalOpen: false,
  currentMemberId: null,
};

const showResults = (values) => {
  logit('showResults', values);
  new Promise((resolve) => {
    setTimeout(() => {
      // simulate server latency
      window.alert(`You submitted:\n\n${JSON.stringify(values, null, 2)}`);
      resolve();
    }, 500);
  });
};

const Memberslist = (props) => {
  //       👇  map the state from the store
  const allList = useStoreState((s) => s.members.sorted);
  const currentMember = useStoreState((s) => s.members.current.data);
  const showAll = useStoreState((s) => s.members.showAll);
  const sortBy = useStoreState((s) => s.members.sortBy);
  const memberIndex = useStoreState((s) => s.members.index);
  const syncToIndex = useStoreState((s) => s.members.syncToIndex);

  logit('state', allList, currentMember, memberIndex, syncToIndex);

  //       👇  map actions from the store
  const setShowAll = useStoreActions((a) => a.members.setShowAll);
  const setSortBy = useStoreActions((a) => a.members.setSortBy);
  const setCurrentId = useStoreActions((a) => a.members.setCurrentId);
  const createNewMember = useStoreActions((a) => a.members.createNewMember);
  const updateMember = useStoreActions((a) => a.members.updateMember);
  const [ui, setUi] = useState(uiModel);
  const setDispStart = (dispStart) => setUi({ ...ui, dispStart });

  // setDispStart(syncToIndex(ui));

  function setSortProp(prop) {
    setSortBy(prop);
    setUi((draft) => {
      draft.sortProp = prop;
    });
  }
  function setEditMode(mode) {
    setUi((draft) => {
      draft.editMode = mode;
    });
  }

  const saveEdit = (memData) => {
    logit('saveEdit', currentMember, memData);

    updateMember(memData);
  };

  const deleteMember = () => {
    const { memberId, accountId, fullName } = currentMember;
    logit('deleteMember', memberId, accountId.accountId, fullName);
    setCurrentId(undefined);
    setEditMode(false);
  };
  const closeEdit = () => {
    setEditMode(false);
    if (!currentMember.newMember) return;
    // MS.deleteCurrentMember();
    setCurrentId(undefined);
  };
  const editFunctions = { saveEdit, deleteMember, closeEdit };

  const changeCurrentMember = (memId, dispStart) => {
    logit('changeCurrentMember', memId);
    setDispStart(dispStart);
    setCurrentId(memId);
  };
  logit('props', props);
  var { membersAdmin } = props;

  var list = allList.slice(ui.dispStart, ui.dispStart + ui.dispLength);

  var Members = (props) => {
    return (
      <div>
        {list.map((member) => {
          var showMemberStatus =
            member.memberStatus !== 'Member' && member.memberStatus !== 'OK';
          let subsStatus = member.subsStatus.status;
          let clss = classnames(
            'list-line',
            member.memberStatus,
            { current: currentMember?.memberId === member.memberId },
            member.suspended ? 'suspended' : subsStatus,
          );
          return (
            <div
              key={member.memberId}
              className={clss}
              onClick={() => changeCurrentMember(member.memberId, ui.dispStart)}
            >
              <span className='line-name'>
                <span className='id'>{member.memberId.substr(1)}</span>
                <span className='name'>{member.lastName + ', ' + member.firstName}</span>
              </span>
              <span className='member-status'>
                {showMemberStatus ? `(${member.memberStatus})` : ''}
              </span>
            </div>
          );
        })}
      </div>
    );
  };
  logit('memberIndex', memberIndex);
  var Index = (props) => {
    return (
      <React.Fragment>
        {memberIndex.key.map(([disp, key, start], i, idx) => {
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
              onClick={() => setDispStart(value)}
              key={'mem:index:' + key}
            >
              {disp}
            </div>
          );
        })}
      </React.Fragment>
    );
  };
  const pageDown = () => {
    setDispStart(
      Math.min(ui.dispStart + ui.dispLength, allList.length - 0.5 * ui.dispLength),
    );
  };
  const pageUp = () => {
    setDispStart(Math.max(ui.dispStart - ui.dispLength, 0));
  };
  var title = <h4>Membership Lists</h4>;
  logit('renderPage');
  return (
    <Panel header={title} className='member-list' id='steds_memberlist'>
      <div className='sort-buttons' hidden={ui.editMode}>
        <TooltipButton
          key='name'
          className={sortBy === 'sortName' ? 'active' : ''}
          onClick={() => setSortProp('sortName')}
          visible={sortBy !== 'sortName'}
        >
          sort by Name
        </TooltipButton>
        <TooltipButton
          key='number'
          className={sortBy === 'memberId' ? 'active' : ''}
          onClick={() => setSortProp('memberId')}
          visible={sortBy !== 'memberId'}
        >
          sort by Number
        </TooltipButton>
        <TooltipButton
          key='hide'
          className='active'
          onClick={() => setShowAll(!showAll)}
          visible
        >
          {showAll ? 'Hide Old' : 'Show Old'}
        </TooltipButton>
      </div>
      <div className='index' hidden={ui.editMode}>
        <div>
          <Icon name='page_up' onClick={pageUp} />
        </div>
        <Index />
        <div>
          <Icon name='page_down' onClick={pageDown} />
        </div>
      </div>
      <div className='names' hidden={ui.editMode}>
        <Members />
      </div>
      <EditMemberData
        key={currentMember?.memberId}
        className='details'
        {...{ ...editFunctions, membersAdmin, ui }}
        onSubmit={showResults}
        onRequestHide={() => setEditMode(false)}
        style={{ minHeight: '100%' }}
      />

      <span className='action-buttons' hidden={ui.editMode}>
        {/* <PrintButton  onClick={()=>summaryReport(printFull)} overlay={printFull ? 'F' : 'W'} onContextMenu={togglePrint} tiptext="Print All  Walks PDF" visible/> */}
        <PrintButton
          // onClick={() => membershipListReport(allList)}
          rcomp={MembershipListReport}
          rprops={{ members: allList }}
          rtitle="St.Edward's Fellwalkers - Members"
          placement='right'
          visible
          tiptext={`Print Membership List (Sorted by ${sortBy})`}
        />
        {/* <PrintButton report='memberslist' payload={allList} placement='right' tiptext={`Print Membership List (Sorted by ${sortProp})`} /> */}
        <TooltipButton
          icon='user_add'
          onClick={createNewMember}
          tiptext='Create a New Member'
          visible
        />
      </span>
    </Panel>
  );
};

export default Memberslist;
