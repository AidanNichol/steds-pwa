/* jshint quotmark: false, jquery: true */
import React from 'react';

import Logit from 'logit';
var logit = Logit('components/utility/SelectWalk');
const toJS = (x) => x;
var SelectWalk = function (props) {
  var { walks, currentWalk, setCurrentWalk } = props;
  if (!currentWalk && walks && walks.length > 0) setCurrentWalk(walks[0]);
  if (!currentWalk) return null;
  logit('SelectWalk', toJS(walks), currentWalk, props);
  return (
    <div className='walkSelect'>
      <div style={{ marginBottom: 10 }}>
        {walks.map(function (walk) {
          logit('walk', toJS(walk));
          let style = {
            width: `${100 / walks.length}%`,
            backgroundColor: currentWalk.walkId === walk.walkId ? '#87bbe7' : '#d9edf7',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          };
          return (
            <button
              style={style}
              key={'Y' + walk.walkId}
              onClick={() => {
                setCurrentWalk(walk);
              }}
            >
              {walk.displayDate}
              <br />
              {walk.longName}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SelectWalk;
