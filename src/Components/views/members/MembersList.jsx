/* jshint quotmark: false, jquery: true */
import React from 'react';
import { useStoreState, useStoreActions } from 'easy-peasy';
import classnames from 'classnames';
import { EditMemberData } from './EditMemberData.jsx';
import TooltipButton from '../../utility/TooltipButton';
import { PrintButton } from '../../utility/PrintButton';
import { MembershipListReport } from '../../../Reports/membershipListRpt';
import { Icon } from '../../utility/Icon';
// import { Loading } from '../../utility/Icon';

import { Panel } from '../../utility/AJNPanel';

import Logit from '../../../logit';
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
  newMember: false,
  currentMemberId: null,
};

const Memberslist = (props) => {
  //       👇  map the state from the store
  const allList = useStoreState((s) => s.members.sorted);
  // const currentMember = useStoreState((s) => s.members.current.data);
  const currentMemberId = useStoreState((s) => s.members.current.memberId);
  const showAll = useStoreState((s) => s.members.showAll);
  const sortBy = useStoreState((s) => s.members.sortBy);
  const memberIndex = useStoreState((s) => s.members.index);
  const syncToIndex = useStoreState((s) => s.members.syncToIndex);
  const { dispStart, dispLength, editMode } = useStoreState((s) => s.members);

  logit('state', allList, currentMemberId, memberIndex, syncToIndex);

  //       👇  map actions from the store
  const setShowAll = useStoreActions((a) => a.members.setShowAll);
  const setSortBy = useStoreActions((a) => a.members.setSortBy);
  const setDispStart = useStoreActions((a) => a.members.setDispStart);
  const setCurrentId = useStoreActions((a) => a.members.setCurrentId);
  const createNewMember = useStoreActions((a) => a.members.createNewMember);
  // const updateMember = useStoreActions((a) => a.members.updateMember);
  let i = allList?.findIndex((mem) => mem?.memberId === currentMemberId);
  logit('sync index', i, currentMemberId, allList);
  i = i > uiModel.dispLength - 1 ? Math.max(i - 11, 0) : i;

  // const [ui, setUi] = useImmer(uiModel);
  // const setDispStart = (dispStart) => setUi({ ...ui, dispStart });
  // useEffect(() => {
  //   setUi((draft) => {
  //     draft.startDisp = i;
  //   });
  // }, [setUi]);
  // useEffect(() => {
  //   if (!currentMemberId) return 0;
  //   let i = allList?.findIndex((mem) => mem?.memberId === currentMemberId);
  //   logit('sync index', i, currentMemberId, allList);
  //   if (i < ui.dispStart || i > ui.dispStart + ui.dispLength - 1) {
  //     i = Math.max(i - 11, 0); // postion in middle of page
  //     setUi({ ...ui, dispStart: i });
  //   }
  // }, [currentMemberId, allList, ui, setUi]);

  // setDispStart(syncToIndex(ui));

  function setSortProp(prop) {
    setSortBy(prop);
    // setUi({ ...ui, sortProp: prop });
  }
  // function setEditMode(editMode) {
  //   setUi({ ...ui, editMode });
  // }

  // const saveEdit = (memData) => {
  //   logit('saveEdit', currentMemberId, memData);

  //   updateMember(memData);
  // };

  // const deleteMember = (currentMember) => {
  //   const { memberId, accountId, fullName } = currentMember;
  //   logit('deleteMember', memberId, accountId.accountId, fullName);
  //   // MS.deleteCurrentMember();
  //   setCurrentId(undefined);
  //   setEditMode(false);
  // };
  // const closeEdit = (isNew) => {
  //   setEditMode(false);
  //   if (isNew) setCurrentId(undefined);
  // };
  // const editFunctions = { deleteMember, closeEdit };

  const changeCurrentMember = (memId, dispStart) => {
    logit('changeCurrentMember', memId);
    setDispStart(dispStart);
    setCurrentId(memId);
  };
  logit('props', { props, dispStart, dispLength });

  var list = allList.slice(dispStart, dispStart + dispLength);

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
            { current: currentMemberId === member.memberId },
            member.suspended ? 'suspended' : subsStatus,
          );
          return (
            <div
              key={member.memberId}
              className={clss}
              onClick={() => changeCurrentMember(member.memberId, dispStart)}
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
          let seeStart = start >= dispStart && start < dispStart + dispLength;
          let seeEnd = end >= dispStart && end < dispStart + dispLength;
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
    setDispStart(Math.min(dispStart + dispLength, allList.length - 0.5 * dispLength));
  };
  const pageUp = () => {
    setDispStart(Math.max(dispStart - dispLength, 0));
  };
  var title = <h4>Membership Lists</h4>;
  logit('renderPage');
  return (
    <Panel header={title} className='member-list' id='steds_memberlist'>
      <div className='sort-buttons' hidden={editMode}>
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
          className={sortBy === 'memNo' ? 'active' : ''}
          onClick={() => setSortProp('memNo')}
          visible={sortBy !== 'memNo'}
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
      <div className='index' hidden={editMode}>
        <div>
          <Icon name='page_up' onClick={pageUp} />
        </div>
        <Index />
        <div>
          <Icon name='page_down' onClick={pageDown} />
        </div>
      </div>
      <div className='names' hidden={editMode}>
        <Members />
      </div>

      {/* <Suspense fallback={<Loading />}> */}
      <EditMemberData />
      {/* </Suspense> */}

      <span className='action-buttons' hidden={editMode}>
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

// export const Loading = () => (
//   <span style={{ gridArea: 'booked', margin: 'auto' }}>
//     <Icon name='spinner' style={{ width: '10em', height: '10em' }} />
//   </span>
// );
export default React.memo(Memberslist);
