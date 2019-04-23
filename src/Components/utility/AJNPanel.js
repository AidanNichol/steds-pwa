import React from 'react';
const mode = process.env.REACT_APP_database_current;
export const Panel = props => {
  const { className = '', header, children, body = {}, ...other } = props;
  // console.log('Panel', {className, header, style, children, other, props})
  const { className: clb, ...bdy } = body;
  console.log('env', process.env);
  return (
    <div className={`panel ajn-panel ${className} ${mode}`} {...other}>
      <div className={'panel-header ' + mode}>{header}</div>
      <div className={'panel-body ' + (clb || '')} {...bdy}>
        <div className="panel-contents">{children}</div>
      </div>
    </div>
  );
};
