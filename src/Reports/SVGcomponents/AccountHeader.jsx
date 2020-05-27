import React from 'react';
export const AccountHeader = ({ sortName, codes, ...props }) => {
  console.log('AccountHeader', { codes, sortName, props });
  const vw = 387,
    vh = 16,
    b = 2,
    w = vw;

  const wd = 30;
  const codeStart = w - (codes.length - 0.5) * wd - 2;
  return (
    <svg
      {...props}
      width={vw}
      height={vh}
      viewBox={`0 0 ${vw} ${vh}`}
      style={{
        fillRule: 'evenodd',
        clipRule: 'evenodd',
        strokeLinejoin: 'round',
        strokeMiterlimit: 1.41421,
      }}
    >
      <g id='accountHeader'>
        <rect
          x='0'
          y='0'
          rx='5'
          width='100%'
          height={vh}
          style={{
            fill: '#e8e8e8',
            fillRule: 'nonzero',
            stroke: 'none',
          }}
        />
        <path
          d={`M0,${vh - 1} h${vw}`}
          style={{ stroke: 'rgb(136,136,136)', strokeWidth: b }}
        />
        <text x='4' y={vh - 4} style={{ fontSize: 13 }}>
          {sortName}
        </text>
        <g style={{ textAnchor: 'middle', fontSize: 12 }}>
          {codes.map(([walkId, code, opacity], i) => (
            <text x={codeStart + i * wd} y={vh - 4} key={code} style={{ opacity }}>
              {code}
            </text>
          ))}
        </g>
      </g>
    </svg>
  );
};
