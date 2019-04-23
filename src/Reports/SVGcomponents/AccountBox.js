import React from 'react';
import { MoneyBox } from './MoneyBox';
import { AccountHeader } from './AccountHeader';
import { MemberSumm } from './MemberSumm';
import Logit from 'logit';
const logit = Logit('/Reports/SVGcomponents/AccountBox');

export const AccountBox = ({ account }) => {
  const { sortname, codes, balance, members } = account;
  logit('account', account, sortname, codes);
  const vw = 387,
    b = 2,
    vh = 24 + members.length * 14;

  const style = {
    head: { fill: '#e8e8e8', stroke: 'none' },
    border: { stroke: 'rgb(136,136,136)', strokeWidth: b, fill: 'none' }
  };

  return (
    <svg
      width={vw}
      height={vh}
      viewBox={`0 0 ${vw} ${vh}`}
      style={{
        fillRule: 'evenodd',
        clipRule: 'evenodd',
        strokeLinejoin: 'round',
        strokeMiterlimit: 1.41421
      }}
    >
      <AccountHeader x="1" y="1" {...{ name: sortname, codes }} />
      <MoneyBox x="4" y={11 + members.length * 8} balance={balance} />

      <g id="members">
        {members.map((member, n) => (
          <MemberSumm y={n * 14 + 17} {...{ member }} key={member._id} />
        ))}
      </g>
      <g id="border">
        <rect x="1" y="1" width={vw - 2} height={vh - 2} rx="5" style={style.border} />
      </g>
    </svg>
  );
};
