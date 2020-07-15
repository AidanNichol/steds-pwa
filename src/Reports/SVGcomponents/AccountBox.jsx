import React from 'react';
import { MoneyBox } from './MoneyBox';
import { AccountHeader } from './AccountHeader';
import { MemberSumm } from './MemberSumm';
import Logit from '../../logit';
const logit = Logit('Reports/SVGcomponents/AccountBox');

export const AccountBox = ({ account }) => {
  const { sortName, codes, balance, Members } = account;
  logit('account', account, sortName, codes);
  const vw = 387,
    b = 2,
    vh = 24 + Members.length * 14;

  const style = {
    head: { fill: '#e8e8e8', stroke: 'none' },
    border: { stroke: 'rgb(136,136,136)', strokeWidth: b, fill: 'none' },
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
        strokeMiterlimit: 1.41421,
      }}
    >
      <AccountHeader x='1' y='1' {...{ sortName, codes }} />
      <MoneyBox x='4' y={11 + Members.length * 8} balance={balance} />

      <g id='Members'>
        {Members.map((member, n) => (
          <MemberSumm y={n * 14 + 17} {...{ member, codes }} key={member.memberId} />
        ))}
      </g>
      <g id='border'>
        <rect x='1' y='1' width={vw - 2} height={vh - 2} rx='5' style={style.border} />
      </g>
    </svg>
  );
};
