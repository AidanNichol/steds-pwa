import { action, Action, computed, Computed } from 'easy-peasy';
import _ from 'lodash';
import Logit from '../../logit';
let logme = Logit(`store/debugSettings/debugOptions`);
let logBuild = Logit(`store/debugSettings/buildTree`);
let logmeC = Logit(`store/debugSettings/children`);
let logmeP = Logit(`store/debugSettings/parent`);

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
  [key: string]: {};
  count?: bicount;
  gc?: bicount;
}
export interface settingsModel {
  tree: node;
  nodes: {};
  changeSelect: Action<settingsModel, string>;
  load: Action<settingsModel>;
  save: Action<settingsModel>;
  enableString: Computed<settingsModel, string>;
}
export const debugSettings: settingsModel = {
  tree: null,
  nodes: {},
  load: action((draft) => {
    buildTree(draft);
  }),
  save: action((draft) => {}),
  enableString: computed([(state) => state.tree], (tree) =>
    getEnableString(tree, select.NO).substr(1),
  ),
  changeSelect: action((draft, id) => {
    const state = getById(draft.tree, id).state;
    const newState = state === select.YES ? select.NO : select.YES;
    logme('changeState------------------', id, select[state], '==>', select[newState]);

    setStateAndHeirarchy(draft.tree, id, newState);
    setById(draft.tree, id, newState);
  }),
};
function isChildNode(obj: any, key?: string): obj is node {
  if (key === 'root') return false;
  if (obj.parentId === undefined) return false;
  return obj.name !== '*' && obj.id !== '*';
}
function Node(id: string, leaf = false): void {
  this.leaf = leaf;
  this.id = id;
  const i = _.lastIndexOf(id, ':');
  if (i > 0) {
    this.parentId = id.substr(0, i);
    this.name = id.substr(i + 1);
  } else {
    this.parentId = id === '*' ? '' : '*';
    this.name = id;
  }
  logBuild('parsename', id, i, this.parentId, this.name);
  this.state = select.NO;
}
function getEnableString(node: node, parentDerivedState: select): string {
  let enableString = '';
  if (!node) return '';
  if (node.state !== select.SOME) {
    if (parentDerivedState === node.state) return '';
    enableString = (node.state === select.YES ? ',' : ',-') + node.name + ':*';
    logmeP('string 1', node.name, parentDerivedState, node.state, enableString);
    return enableString;
  }
  if (node.derivedState !== parentDerivedState && node.derivedState !== select.SOME) {
    enableString = (node.derivedState === select.YES ? ',' : ',-') + node.name + ':*';
    parentDerivedState = parentDerivedState === select.YES ? select.NO : select.YES;
  }
  enableString = Object.values(node).reduce(
    (str, child) => str + getEnableString(child as node, parentDerivedState),
    enableString,
  ) as string;
  logmeP('string 2', node.name, node.derivedState, enableString);
  return enableString;
}
function nodeChildren(node: node) {
  const nodes: node[] = [];
  Object.entries(node).forEach(([key, child]) => {
    if (isChildNode(child, key)) nodes.push(child);
  });
  return nodes;
}
function getCount(node: node): bicount {
  node.derivedState = node.state;
  if (node.state !== select.SOME) {
    const bc: bicount = node.state === select.YES ? [1, 0] : [0, 1];
    logmeP('count 0', node.name, bc);
    return bc;
  }
  let myCount: bicount = nodeChildren(node).reduce(
    (count, child) => {
      const cc = getCount(child as node);
      return [count[0] + cc[0], count[1] + cc[1]];
    },
    [0, 0],
  ) as bicount;
  node.count = myCount;
  let diff = myCount[0] - myCount[1];
  let { state, derivedState } = node;
  logmeP('count', node.name, myCount, { diff, state, derivedState });
  if (Math.abs(diff) < 2 && node.parent) return myCount;
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

  draft.tree = new Node('*');
  draft.nodes['*'] = draft.tree;
  logitCodes.forEach((code, i) => {
    if (`${code}:` === logitCodes[i + 1]) {
      logBuild('collison', i, code, logitCodes[i + 1]);
    }
    let parent: node = draft.tree;
    const codes = code.split(':').map((part) => _.upperFirst(part)) as string[];
    codes.forEach((part, i, arr) => {
      if (!parent[part]) {
        let id = arr.slice(0, i + 1).join(':');
        parent[part] = new Node(id, i === arr.length - 1);
        draft.nodes[id] = parent[part];
        parent.childrenIDs.push();
      }
      logBuild('treepart', code, part, i, arr, i >= arr.length - 1, parent);

      parent = parent[part] as node;
    });
  });
  logBuild('---- data -----', draft.tree);
  setCurrentValues(draft.tree);
}
/* 
override the default values with the current setting
 */
function setCurrentValues(root: node) {
  var enableString: string = JSON.parse(localStorage.getItem('enableString') || '""');
  logme('enableString read', enableString);
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
      setStateAndHeirarchy(root, name, val);
    });
  // data.count;
}
const setChildrenState = (node: node, val?: select) => {
  nodeChildren(node).forEach((child) => {
    logmeC('set child', child.name, select[val], child.id);
    child.state = val;
    if (!child.leaf) {
      setChildrenState(child, val);
    }
  });
};

const setStateAndHeirarchy = (draft: node, id: string, val: select) => {
  const node = getById(draft, id);
  logmeP('setStateAndHierarchy', id, select[val], val, node, draft);
  if (!node || node.state === val) return;

  logmeP(`setState`, node.name, `${select[node.state]} ==> ${select[val]}`);
  node.state = val;

  setChildrenState(node, val);
  // const ids = id.split(/:/);
  // for (let i = 0; i < ids.length; i++) {
  //   const id = ids.slice(0, i + 1).join(':');
  //   setById(draft, id, val);
  // }
  setParentState(draft, node, val);
  getCount(draft);
  logmeP('change finished', draft);
  return draft;
};
const setParentState = (draft: node, node: node, val: select, i = 0) => {
  if (i > 10) {
    logmeP('too deep');
  }
  if (node.parentId === '') return;
  let parent = node.parentId === '*' ? draft : getById(draft, node.parentId);

  let resVal = val;
  if (val !== select.SOME) {
    nodeChildren(parent).forEach((child) => {
      if (child.state !== val) {
        resVal = select.SOME;
      }
    });
  }
  logmeP('set parent', parent.name, resVal, select[resVal], parent.id);
  parent.state = resVal;
  setParentState(draft, parent, resVal, i + 1);
};

const getById = (draft: node, id: string): node => {
  const child = _.get(draft, id.split(/:/));
  if (!child) logmeC('getById', id, draft, draft[id]);
  return child as node | undefined;
};
const setById = (draft: node, id: string, state: select): void => {
  const child = _.get(draft, id.split(/:/));
  if (!child) throw new Error(`${id} not found in tree`);
  logmeP('setById', id, select[state]);

  child.state = state;
};

export default debugSettings;
