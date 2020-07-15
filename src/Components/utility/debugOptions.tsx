//@ts-check
// const BrowserWindow = remote.BrowserWindow;
import React from 'react';

import styled from 'styled-components';
import Logit from '../../logit';
import { useStoreState, useStoreActions } from 'easy-peasy'; // 👈import the helper
// import { settingsModel } from '../../store/model/debugSettings'; // 👈 import our model type
import { node } from '../../store/model/debugSettings'; // 👈 import our model type
import { getEnableString } from '../../store/model/debugSettings';

let logme = Logit(`components/utility/debugOptions`);

enum select {
  YES = 1,
  SOME = '???',
  NO = 0,
  '???' = 'SOME',
}
type bicount = [number, number];

interface setdraft {
  (id: string, state: select): void;
}
interface NodeMap {
  [name: string]: node;
}
interface boolProps {
  className?: string;
  key?: string;
  id: string;
  root: NodeMap;
  changeSelect?(id: string): void;
}
const ShowBool = (props: boolProps) => {
  let { id, className } = props;
  const root = useStoreState((state) => state.debugSettings.nodes) as NodeMap;

  const obj = root[id];
  const changeSelect = useStoreActions(
    (actions) => (actions.debugSettings as any).changeSelect,
  );

  let stateName = select[obj.state] + ' ' + select[obj.derivedState];
  const onClick = () => {
    changeSelect(obj.id);
  };

  logme('showBool', obj.name, obj.state, stateName, obj);
  return (
    <div key={obj.name} className={stateName + ' ' + (className ?? '')} {...{ onClick }}>
      <input
        key={obj.name + 'I'}
        type='checkbox'
        checked={obj.state === select.YES}
        ref={(input) => {
          if (input) {
            input.indeterminate = obj.state === select.SOME;
          }
        }}
      />
      <span>
        {' '}
        {obj.name}
        {obj.count && `[${obj.count[0]},${obj.count[1]} ]`}
        {obj.gc && `[${obj.gc[0]},${obj.gc[1]} ]`}
        &nbsp;{select[obj.state]}&nbsp;{select[obj.derivedState]}
        {/* &nbsp;{(obj.state === select.SOME && derivedStateName) || ''} */}
      </span>
    </div>
  );
};

interface treeProps {
  className?: string;
  key?: string;
  root: NodeMap;
  id: string;
  changeSelect?(id: string): void;
}

const ObjectTree = (props: treeProps) => {
  let { id, className, changeSelect } = props;
  const root = useStoreState((state) => state.debugSettings.nodes) as NodeMap;
  const node = root[id];
  logme('called ObjectTree', node.id, node);
  return (
    <ObjectDiv className={'obj ' + className} key={'obj:' + node.name}>
      {!node.leaf && (
        <h4 className={`${select[node.state]} ${select[node.derivedState]}`}>
          <ShowBool id={node.id} {...{ root, changeSelect }} />
        </h4>
      )}
      <div key={'obj:' + node.name} className='objContent'>
        {node.childrenIDs.map((childId) => {
          const child = root[childId];
          // if (!child.name) return null;
          logme('objectTree', child.id, child.parentId, child.name, child);
          if (child.leaf) {
            return (
              <ShowBool
                key={childId}
                id={childId}
                className='bool'
                {...{ changeSelect, root }}
              />
            );
          } else {
            return <ObjectTree key={child.id} id={childId} {...{ root, changeSelect }} />;
          }
        })}
      </div>
    </ObjectDiv>
  );
};
const ObjectDiv = styled.div`
  margin: 10px;
  margin-left: 0;

  h4 {
    /* background-color: cyan; */
    border-bottom: black solid thin;
    font-size: 1.1em;
    font-weight: normal;
    margin: 0;
    padding-left: 0px;
    .YES {
      background-color: #00ff00;
      &.SOME {
        /* opacity: 50%; */
        background-color: #88ff88;
      }
    }
    .NO {
      background-color: #ff0000;
      &.SOME {
        /* opacity: 50%; */
        background-color: #ff8888;
      }
    }
  }

  span {
    display: inline-block;
    /* width: 150px; */
    margin: 4px;
  }

  & > div {
    padding-left: 10px;
    & .objContent {
      padding-left: 40px;
    }
  }
  .bool {
    padding-left: 25px;
  }

  border: #000000 solid thin;
  max-width: 620px;

  .base {
    display: none;
  }
  .YES {
    font-weight: bold;
    color: green;
  }
  .NO > span {
    text-decoration: line-through;
  }
  .SOME {
    opacity: 0.7;
  }
`;
export const DebugOptions = React.memo((props) => {
  // const [root, setRoot] = useImmer({} as node);
  const [showRaw, setShowRaw] = React.useState(false);
  const changes = useStoreState((state) => state.debugSettings.changes) as number;

  // const [, setRerender] = React.useState(false);
  // const refRoot = React.useRef(root);
  const root = useStoreState((state) => state.debugSettings.nodes);
  // const enableString = useStoreState((state) => state.debugSettings.enableString);
  const save = useStoreActions((actions) => (actions.debugSettings as any).save);
  const changeSelect = useStoreActions(
    (actions) => (actions.debugSettings as any).changeSelect,
  );
  logme('render', changeSelect, root);

  return (
    <>
      <button
        // style={{ position: 'fixed', top: 0, left: 0 }}
        onClick={() => {
          setShowRaw(!showRaw);
        }}
      >
        toggle
      </button>
      <span>{changes}</span>
      {showRaw ? (
        <pre>
          {JSON.stringify(root, (key, value) => (key === 'root' ? 'root' : value), ' ')}
        </pre>
      ) : (
        <div id='settings-page'>
          <div className='item'>
            <img
              className='main-logo'
              src={`../assets/St.EdwardsLogoSimple.svg`}
              height='120px'
              alt=''
            />
            <div className='main-text'>
              <div>St.Edwards Booking System</div>
              <div style={{ fontSize: '1em' }}>Debug Options</div>
            </div>
          </div>
          <div>
            <button onClick={save}>Save</button>
            <ObjectTree id='*' {...{ changeSelect, root }} />
            <button onClick={save}>Save</button>
            <div>enable: {getEnableString(root, '*', select.NO).substr(1)}</div>
          </div>
        </div>
      )}
    </>
  );
});
