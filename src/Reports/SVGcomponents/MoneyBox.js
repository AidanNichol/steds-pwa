import React from 'react';
const pickColor = (balance, pos, zero, neg) =>
  balance > 0 ? pos : balance === 0 ? zero : neg;
export const MoneyBox = ({ balance, ...props }) => {
  const fillCol = pickColor(balance, '#cfe', '#fff', '#f88');
  const strokeCol = pickColor(balance, '#484', '#fff', '#800');
  const style = { fill: fillCol, stroke: strokeCol, strokeWidth: 2 };
  const stylePaid = { fill: '#fff', stroke: '#888', strokeWidth: 2 };
  const vh = 16;
  return (
    <svg width="115" height={vh} {...props} viewBox={`0 0 115 ${vh}`}>
      <g id="moneyBox" style={{ fontSize: 12 }}>
        <rect x="1" y="1" rx="3" width="60" height={vh - 2} style={style} />
        <g style={{ fill: balance === 0 ? '#fff' : '#222', fontSize: 13 }}>
          <text x="22" y={vh - 4} style={{ textAnchor: 'end' }}>
            £{Math.abs(balance)}
          </text>
          <text x="24" y={vh - 4} style={{ textAnchor: 'start' }}>
            {balance > 0 ? 'Credit' : 'Owed'}
          </text>
          <text x="64" y={vh - 4} style={{ fill: '#222' }}>
            Paid{' '}
          </text>
          <rect x="90" y="2.5" rx="3" width="23" height={vh - 4} style={stylePaid} />
        </g>
      </g>
    </svg>
  );
};
