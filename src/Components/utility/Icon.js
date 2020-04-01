import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const X = [
  { icon: 'slash', color: 'white', transform: 'up-2' },
  { icon: 'slash', color: 'red' }
];
const afIcons = {
  B: { icon: 'bus', color: 'green' },
  C: { icon: 'car', color: 'blue' },
  W: { icon: ['far', 'clock'] },
  T: { icon: ['ajn', 'treasurer'] },
  P: { icon: 'pound-sign', transform: 'grow-3 right-2' },
  // '+': {icon:['ajn', 'credit']},
  BL: [{ icon: 'bus', color: 'red' }, ...X],
  '+': [
    { icon: 'hand-holding', transform: ' down-1' },
    { icon: 'pound-sign', transform: 'shrink-6 up-3' }
  ],
  A: { icon: 'edit' },
  Blank: { icon: ['far', 'circle'], color: 'blue' },
  Cancel: { icon: 'times' },
  Printer: { icon: ['far', 'print'] },
  page_up: { icon: 'arrow-alt-up' },
  page_down: { icon: 'arrow-alt-down' },
  user_add: [
    { icon: 'user' },
    { icon: 'plus', color: 'green', transform: 'shrink-8 up-5 right-7' }
  ],
  user_enable: [
    { icon: 'user', color: 'orange' },
    { icon: 'check', color: 'green', transform: 'shrink-8 up-5 right-7' }
  ],
  user_disable: [
    { icon: 'user', color: 'green' },
    { icon: 'ban', color: 'red', transform: 'shrink-8 up-5 right-7' }
  ],
  user_delete: [
    { icon: 'user', color: 'orange' },
    { icon: 'times', color: 'red', transform: 'grow-1' }
  ],
  user_undelete: [
    { icon: 'user', color: 'red' },
    { icon: 'check', color: 'green', transform: 'grow-1' }
  ],
  Delete_Member: [{ icon: 'user', color: 'red' }, { icon: 'times', transform: 'grow-1' }]
};
['B', 'C', 'W', 'T', 'P'].forEach(ky => (afIcons[ky + 'X'] = [afIcons[ky], ...X]));
afIcons['+X'] = [...afIcons['+'], ...X];

console.log('fa Icons', afIcons);
// import logo from '../../../public/icon-B.svg';
export const Icon = ({ type, name, className, size, ...rest }) => {
  if (!name && type) name = type;
  if (!name) return null;
  if (afIcons[name]) {
    if (!afIcons[name].length)
      return <FontAwesomeIcon {...{ ...afIcons[name], size, className, ...rest }} />;
    return (
      <span className={'fa-layers fa-fw ' + className} {...rest}>
        {afIcons[name].map((ics, i) => (
          <FontAwesomeIcon {...{ ...ics, size }} key={i} />
        ))}
      </span>
    );
  }

  console.log('Icon2', name, type);
  return null;
};
