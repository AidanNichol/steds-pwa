import { action, thunk, thunkOn, computed } from 'easy-peasy';
import { currentSubsYear, getTimestamp } from '../dateFns';
import _ from 'lodash';
import { queryCache } from 'react-query';

import { produceWithPatches, enablePatches } from 'immer';
import { fetchData } from '../use-data-api';
import Logit from '../../logit';
var logit = Logit('store/member');
enablePatches();
const subsYear = currentSubsYear();

/*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃                    Model                                 ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ 
*/
export const members = {
  list: [],
  current: { memberId: '', data: {} },
  showAll: false,
  sortBy: 'sortName',
  dispStart: 0,
  dispLength: 23,
  newMember: false,
  editMode: false,
};
/*
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                    computed                              ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ 
*/
export const paidUp = (m) => m.memberStatus !== 'Member' || m.subscription >= subsYear;
members.sortedByName = computed((s) => s.sortedBy('sortName'));
members.sortedByNo = computed((s) => s.sortedBy('memNo'));
members.sorted = computed((s) => s.sortedBy(s.sortBy));
members.sortedBy = computed([(s) => s.list, (s) => s.showAll], (list, showAll) => {
  return (sortBy) => {
    return _.sortBy(
      list?.filter((m) => showAll || paidUp(m)),
      [sortBy],
    );
  };
});
/*
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                    actions                               ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ 
*/
members.setCurrentId = action((state, id) => {
  state.current.memberId = id;
});
members.setCurrentData = action((state, data) => {
  state.current.data = data;
});
members.setShowAll = action((state, bool) => {
  state.showAll = bool;
});
members.setSortBy = action((state, bool) => {
  state.sortBy = bool;
});
members.setList = action((state, list) => {
  state.list = list;
});
members.updateMember = action((state, data) => {
  state.current.data = data;
});
members.setDispStart = action((state, no) => {
  state.dispStart = no;
});
members.setNewMember = action((state, bool) => {
  state.newMember = bool;
});
members.setEditMode = action((state, bool) => {
  state.editMode = bool;
  logit('editMode', state.editMode);
});
/*
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                    Thunks                                ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ 
*/

// members.onSetPage = thunkOn(
//   (actions, storeActions) => storeActions.member.setCurrentId,
//   (actions, { payload: memberId, getStoreState }) => {
//     logit('detected setPage  :', page);
//     if (page === 'membersList') actions.getMemberFromAccount();
//   },
// );
members.onSetPage = thunkOn(
  (actions, storeActions) => storeActions.router.setPage,
  (actions, { payload: page, getStoreState }) => {
    logit('detected setPage  :', page);
    if (page === 'membersList') actions.getMemberFromAccount();
  },
);
members.getMemberFromAccount = thunk((actions, payload, { getStoreState }) => {
  const id = getStoreState().accountStatus.bookings?.Members[0]?.memberId;
  if (id) {
    logit('seting memberId :', id);
    actions.setCurrentId(id);
    const { sorted, dispStart, dispLength } = getStoreState().members;
    let i = sorted.findIndex((mem) => mem?.memberId === id);
    logit('sync index', i, id, members);
    if (i > dispStart || i > dispStart + dispLength - 1) {
      actions.setDispStart(Math.max(i - 11, 0)); // postion in middle of page
    }
  }
});
members.setCurrentAccount = thunk(
  (actions, memberId, { getStoreActions, getStoreState }) => {
    const index = getStoreState().names;
    const accountId = index.get(memberId).accountId;
    getStoreActions().accountStatus.setAccount(accountId);
  },
);
// members.onChangedMember = thunkOn(
//   (actions) => actions.setCurrentId,
//   async (actions, { payload: id }) => {
//     const res = await fetchData('Member/includeAccount/' + id);
//     logit('members fetchdata returned', res);
//     actions.setCurrentData(res.data);
//   },
// );
members.loadMembers = thunk(async (actions, payload, { getState }) => {
  const mems = await fetchData('Member/index');

  logit('members fetchdata returned', mems.data?.length, mems);
  actions.setList(mems.data);
  logit('memberslist', getState().list);
});
/* ( ͡° ͜ʖ ͡°)  ヽ(͡◕ ͜ʖ ͡◕)ﾉ  ( ͡ಠ ʖ̯ ͡ಠ)
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃                    useActiveData                         ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ 
*/
members.updateMember = thunk((actions, payload, { getState, getStoreActions }) => {
  logit('dispatchPayload', payload);
  const [nextState, ...patches] = produceWithPatches(getState().current.data, (draft) => {
    const newMember = getState().current.data.newMember;
    const when = getTimestamp();
    const why = newMember ? 'Create' : 'Update';
    draft.lastAction = [
      when,
      getState().current.data.memberId,
      why,
      JSON.stringify(payload),
    ];

    Object.entries(payload).forEach(([key, value]) => {
      draft[key] = value;
    });
  });
  // if (newMember) return payload;
  logit('patches', nextState, patches);
  patches.forEach((g) =>
    g.forEach((p) => {
      if (p.path[0] !== 'lastAction') {
        p.path = ['Member', getState().current.memberId, ...p.path];
      }
    }),
  );
  if (patches[0].length === 0) return;
  logit('nextState', nextState, patches);
  getStoreActions().patches.addToQueue(patches);
  actions.setCurrentData(nextState);
});

members.createNewMember = thunk((actions, payload, { getStoreState }) => {
  const memNo =
    getStoreState().members.list.reduce(
      (max, mem) => Math.max(max, mem.memberId.substr(1)),
      0,
    ) + 1;
  const memberId = 'M' + memNo;
  const newMem = {
    memberId: memberId,
    accountId: 'A' + memNo,
    firstName: '',
    lastName: '',
    newMember: true,
    memberStatus: 'Guest',
  };
  queryCache.setQueryData(['Member/includeAccount/', memberId], newMem);
  actions.setCurrentId(memberId);
  actions.setCurrentData(newMem);
  actions.setNewMember(true);
  return newMem;
});

/*
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                    Member Index                          ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ 
*/

members.index = computed((state) => {
  return state.sortBy === 'sortName' ? state.indexByName : state.indexByNumber;
});
members.indexByName = computed([(state) => state.sortedByName], (members = []) => {
  let key = [],
    index = {},
    lastKey = '';
  (members || []).forEach((mem, i) => {
    let c = mem.lastName[0];
    if (c !== lastKey) {
      lastKey = c;
      key.push([c, c, i]);
      index[c] = 0;
    }
    index[c]++;
  });
  return { key, index };
});
members.indexByNumber = computed([(state) => state.sortedByNo], (members = []) => {
  let key = [],
    index = {};
  let bsize = Math.ceil(members.length / 24);
  for (var i = 0; i < members.length; i = i + bsize) {
    let c = members[i].memberId;
    key.push(['○', c, i]);
    index[c] = i;
  }
  return {
    key,
    index,
  };
});
// members.syncToIndex = computed((state, storeState) => {
//   return (ui) => {
//     const memId = state.current?.memberId;
//     if (!memId) return 0;
//     let i = storeState?.members?.findIndex((mem) => mem?.memberId === memId);
//     logit('sync index', i, memId, members);
//     if (i >= ui.dispStart && i <= ui.dispStart + ui.dispLength - 1) {
//       return ui.dispStart; // already showing on current page
//     }
//     return Math.max(i - 11, 0); // postion in middle of page
//   };
// });

/*
  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
  ┃                    Member Utilities                      ┃
  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ 
  */

members.showState = computed((state) => {
  const subsStatus = state.current?.data.subsStatus?.status ?? '?';
  const deleteState = state.current?.data.deleteState;
  let showState = subsStatus === 'ok' ? '' : subsStatus.toUpperCase()[0];
  if (deleteState >= 'S') showState = deleteState;
  return showState;
});
members.subsStatus = computed((state) => {
  const mem = state.current?.data;
  return getSubsStatus(mem);
});
export const getSubsStatus = (mem) => {
  if (!mem) return { due: false, status: '?', showSubsButton: false };
  let _today = new Date();
  // DS.todaysDate;
  let status = 'ok';
  if (mem.memberStatus === 'HLM') {
    return { due: false, status, showSubsButton: false };
  }
  if (mem.memberStatus === 'Guest') {
    return { due: false, status: 'guest', showSubsButton: false };
  }

  const currentUserSubs = parseInt(mem.subscription || 0);

  let fee = 15;
  // const _today = new Date();
  let thisYear = _today.getFullYear();
  // year - all new subs will be ok until the end of thie 'year'
  let year = _today >= new Date(`${thisYear}-10-01`) ? thisYear + 1 : thisYear;
  // dueSubsYear - we are collecting subs for this year
  let dueSubsYear = _today >= new Date(`${thisYear}-12-31`) ? thisYear + 1 : thisYear;
  // okSubsYear - if current value is this then you get the reduced rate.
  let okSubsYear = _today < new Date(`${thisYear}-02-01`) ? thisYear - 1 : thisYear;
  let showSubsButton = _today >= new Date(`${thisYear}-12-01`) && currentUserSubs < year;
  if (currentUserSubs >= okSubsYear) fee = 13;
  // console.log({currentUserSubs, year, thisYear, dueSubsYear,  okSubsYear, showSubsButton})
  if (currentUserSubs >= year || currentUserSubs >= dueSubsYear) {
    if (showSubsButton) {
      return { due: false, status, year, fee, showSubsButton };
    } else return { due: false, status, showSubsButton };
  }
  status = 'due';
  if (currentUserSubs >= okSubsYear) fee = 13;
  else status = 'late';
  showSubsButton = true;
  return { due: true, year, fee, status, showSubsButton };
};

export default members;
