import { action, Action, thunk, Thunk } from 'easy-peasy';
import _ from 'lodash';
import Logit from '../../logit';
let logme = Logit(`store/debugSettings/debugOptions`);
let logBuild = Logit(`store/debugSettings/buildTree`);
let logmeC = Logit(`store/debugSettings/children`);
let logmeP = Logit(`store/debugSettings/parent`);
let logmeE = Logit(`store/debugSettings/enable`);

enum select {
  YES = 1,
  SOME = '???',
  NO = 0,
  '???' = 'SOME',
}
type bicount = [number, number];

export interface node {
  state: select;
  id: string;
  parentId: string;
  childrenIDs?: string[];
  name: string;
  derivedState?: select;
  leaf: boolean;

  count?: bicount;
  gc?: bicount;
}
interface NodeMap {
  [name: string]: node;
}
export interface SettingsModel {
  nodes: NodeMap;
  changes: 0;
  changeSelect?: Thunk<SettingsModel, string>;
  setById?: Action<SettingsModel, [string, select]>;
  load?: Action<SettingsModel>;
  save?: Action<SettingsModel>;
  incChanges?: Action<SettingsModel>;
  // enableString?: Computed<SettingsModel, string>;
}
type setById = ([string, select]) => void;
export const debugSettings: SettingsModel = {
  nodes: {},
  changes: 0,
  load: action((draft) => {
    buildTree(draft);
  }),
  save: action((state) => {}),
  incChanges: action((state) => {
    state.changes++;
  }),
  // enableString: computed([(state) => state], (state) =>
  //   getEnableString(state.nodes, '*', select.NO),
  // ),
  changeSelect: thunk((actions, id, { getState }) => {
    const root = getState().nodes;
    const setById = actions.setById;
    actions.incChanges();
    const selct = root[id].state;
    const newState = selct === select.YES ? select.NO : select.YES;
    logme('changeState------------------', id, select[selct], '==>', select[newState]);

    setStateAndHeirarchy(root, id, newState, setById);
    actions.setById([id, newState]);
  }),
  setById: action((state, payload) => {
    const [id, val] = payload;
    state.nodes[id].state = val;
  }),
};

function Node(id: string, leaf = false): void {
  this.leaf = leaf;
  this.id = id;
  this.childrenIDs = [];
  const i = _.lastIndexOf(id, ':');
  if (i > 0) {
    this.parentId = id.substr(0, i);
    this.name = id.substr(i + 1);
  } else {
    this.parentId = id === '*' ? undefined : '*';
    this.name = id;
  }
  logBuild('parsename', id, i, this.parentId, this.name);
  this.state = select.NO;
}
export function getEnableString(
  root: NodeMap,
  id: string,
  parentDerivedState: select,
): string {
  const node = (root ?? {})[id];
  let enableString = '';
  // if (!root) return '';
  logmeE('called', id, node?.state, node, root);
  if (node === undefined) return '';
  const generic = node.leaf ? '' : ':*';
  if (node.state !== select.SOME) {
    if (parentDerivedState === node.state) return '';
    enableString = (node.state === select.YES ? ',' : ',-') + node.id + generic;
    logmeE('string 1', node.id, parentDerivedState, node.state, enableString);
    return enableString;
  }
  if (node.derivedState !== parentDerivedState && node.derivedState !== select.SOME) {
    enableString = (node.derivedState === select.YES ? ',' : ',-') + node.id + generic;
    parentDerivedState = parentDerivedState === select.YES ? select.NO : select.YES;
  }
  enableString = node.childrenIDs.reduce(
    (str, childId) => str + getEnableString(root, childId, parentDerivedState),
    enableString,
  ) as string;
  logmeE('string 2', node.id, node.derivedState, enableString);
  return enableString;
}

function getCount(root: NodeMap, id: string): bicount {
  const node = root[id];
  node.derivedState = node.state;
  if (node.state !== select.SOME) {
    const bc: bicount = node.state === select.YES ? [1, 0] : [0, 1];
    logmeP('count 0', node.name, bc);
    return bc;
  }
  let myCount: bicount = node.childrenIDs.reduce(
    (count, childId) => {
      const cc = getCount(root, childId);
      return [count[0] + cc[0], count[1] + cc[1]];
    },
    [0, 0],
  ) as bicount;
  node.count = myCount;
  let diff = myCount[0] - myCount[1];
  let { state, derivedState } = node;
  logmeP('count', node.name, myCount, { diff, state, derivedState });
  if (Math.abs(diff) < 2 && node.parentId) return myCount;
  node.derivedState = diff > 0 ? select.YES : select.NO;
  const gc: bicount = diff > 0 ? [1, 0] : [0, 1];
  logmeP('count 2', node.name, gc, node.derivedState);
  node.gc = gc;
  return gc;
}

/* 
get table of current logit codes and built the data hierarchy

 */
function buildTree(draft) {
  var logitCodes = JSON.parse(
    localStorage.getItem('logitCodes') || '[]',
  ).sort() as string[];
  logBuild(logitCodes);
  // logitCodes = logitCodes.slice(0, 4);

  const root = new Node('*');
  draft.nodes['*'] = root;
  logitCodes.forEach((code, i) => {
    if (`${code}:` === logitCodes[i + 1]) {
      logBuild('collison', i, code, logitCodes[i + 1]);
    }
    let parent: node = root;
    const codes = code.split(':').map((part) => _.upperFirst(part)) as string[];
    codes.forEach((part, i, arr) => {
      const id = arr.slice(0, i + 1).join(':');
      let node = getById(draft, id);
      if (!node) {
        node = new Node(id, i === arr.length - 1);
        draft.nodes[id] = node;
        parent.childrenIDs = _.sortBy(_.uniq([...parent.childrenIDs, id]));
      }
      logBuild('treepart', code, part, i, arr, i >= arr.length - 1, parent);

      parent = node;
    });
  });
  logBuild('---- data -----', draft.nodes);
  setCurrentValues(draft);
}
/* 
override the default values with the current setting
 */
function setCurrentValues(root: NodeMap) {
  var enableString: string = JSON.parse(localStorage.getItem('enableString') || '""');
  logme('enableString read', enableString);
  const setById = (payload: [string, select]) => {
    const [id, val] = payload;
    root[id].state = val;
  };
  enableString
    .replace(/:\*/g, '')
    .split(',')
    .forEach((name) => {
      let val = select.YES;
      if (name[0] === '-') {
        name = name.substr(1);
        val = select.NO;
      }
      logme('setIndex', name, select[val]);
      setStateAndHeirarchy(root, name, val, setById);
    });
  // data.count;
}
const setChildrenState = (root: NodeMap, id: string, val: select, setById: setById) => {
  const node = root[id];
  node.childrenIDs.forEach((childId) => {
    const child = root[childId];
    logmeC('set child', child.name, select[val], child.id);
    setById([childId, val]);
    // child.state = val;
    setChildrenState(root, childId, val, setById);
  });
};

const setStateAndHeirarchy = (
  root: NodeMap,
  id: string,
  val: select,
  setById: setById,
) => {
  const node = root[id];
  logmeP('setStateAndHierarchy', id, select[val], val, node, root);
  if (!node || node.state === val) return;

  logmeP(`setState`, node.name, `${select[node.state]} ==> ${select[val]}`);
  setById([id, val]);

  setChildrenState(root, id, val, setById);
  // const ids = id.split(/:/);
  // for (let i = 0; i < ids.length; i++) {
  //   const id = ids.slice(0, i + 1).join(':');
  //   setById(draft, id, val);
  // }
  setParentState(root, node.parentId, val, 0, setById);
  getCount(root, '*');
  logmeP('change finished', root);
};
const setParentState = (
  root: NodeMap,
  parentId: string,
  val: select,
  i = 0,
  setById: setById,
) => {
  if (i > 10) {
    logmeP('too deep');
  }
  if (!parentId) return;
  let parent = root[parentId];

  let resVal = val;
  if (val !== select.SOME) {
    parent.childrenIDs.forEach((childId) => {
      if (root[childId].state !== val) resVal = select.SOME;
    });
  }
  logmeP('set parent', parent.name, resVal, select[resVal], parent.id);
  // root[parentId].state = resVal;
  setById([parentId, resVal]);
  setParentState(root, parent.parentId, resVal, i + 1, setById);
};

const getById = (draft: SettingsModel, id: string): node => {
  const child = draft.nodes[id];
  return child as node | undefined;
};

export default debugSettings;
