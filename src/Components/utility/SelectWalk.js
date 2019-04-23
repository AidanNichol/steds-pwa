/* jshint quotmark: false, jquery: true */
import React from 'react';

import Logit from 'logit';
var logit = Logit('components/utility/SelectWalk');

var SelectWalk = function(props) {
  var { walks, currentWalk, setCurrentWalk } = props;
  if (!currentWalk && walks && walks.length > 0) setCurrentWalk(walks[0]._id);
  if (!currentWalk) return null;
  logit('SelectWalk', walks, props);
  return (
    <div className="walkSelect">
      <div style={{ marginBottom: 10 }}>
        {walks.map(function(walk) {
          let style = {
            width: `${100 / walks.length}%`,
            backgroundColor: currentWalk._id === walk._id ? '#87bbe7' : '#d9edf7',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          };
          return (
            <button
              style={style}
              key={'Y' + walk._id}
              onClick={() => {
                setCurrentWalk(walk._id);
              }}
            >
              {walk.dispDate}
              <br />
              {walk.lName}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SelectWalk;
