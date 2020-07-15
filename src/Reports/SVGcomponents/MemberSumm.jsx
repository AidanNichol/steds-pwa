import React from 'react';
// import Symbols from './Symbols';
import { Icon } from '../../Components/utility/Icon';
import '@fortawesome/fontawesome-svg-core/styles.css'; // Import the CSS

import Logit from '../../logit';
const logit = Logit('Reports/SVGcomponents/MemberSumm');

const styles = {
  name: {
    textAnchor: 'end',
    fontSize: 12,
    fontStyle: 'italic',
  },
  icon: {
    width: 30,
    height: 30,
    textAlign: 'center',
  },
};
export const MemberSumm = ({ member, codes, ...props }) => {
  logit('member', member);
  const vw = 387;
  const wd = 30;
  const codeStart = vw - codes.length * wd;
  const vh = 16;
  // const opacity = (type, pos) => ({ opacity: pos <= 0.4 ? 0.4 : 1 });
  const opacity = (type, pos) => (pos <= 0.4 ? { opacity: 0.4 } : {});
  const width = 14;
  const height = 14;
  return (
    <svg x='0' {...props} width='387' height={vh} viewBox={`0 0 387 ${vh}`}>
      <g style={styles.bkngBoxes} key={member.memberId}>
        <text y='10' x={codeStart - 2} style={styles.name}>
          {member.sName}
        </text>
        <g>
          {codes.map(([walkId], key) => {
            const [type, pos] = member.icons[walkId] || ['Chk', 1];
            const style = { ...styles.icon, ...opacity(type, pos) };
            const x = codeStart + key * wd + 8;
            const y = 2;
            return <Icon {...{ x, y, width, height, type, pos, key, style }} />;
          })}
        </g>
      </g>
    </svg>
  );
};
