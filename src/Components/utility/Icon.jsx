import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Logit from '../../logit';
const logit = Logit('Component/utility/Icon');

const X = [
  { icon: ['fas', 'slash'], color: 'white', transform: 'up-2' },
  { icon: ['fas', 'slash'], color: 'red' },
];
const afIcons = {
  B: { icon: ['fad', 'bus'], color: 'green' },
  C: { icon: ['fad', 'car-side'], color: 'blue' },
  W: { icon: ['fad', 'clock'] },
  T: { icon: ['ajn', 'treasurer'] },
  P: { icon: 'pound-sign', transform: 'grow-3 right-2' },
  // '+': {icon:['ajn', 'credit']},
  BL: [{ icon: ['fad', 'bus'], color: 'red' }, ...X],
  '+': [
    { icon: ['ajn', 'credit'] },
    // { icon: 'hand-holding', transform: ' down-1' },
    // { icon: 'pound-sign', transform: 'shrink-6 up-3' },
  ],
  A: { icon: ['fad', 'edit'] },
  Bank: [
    { icon: ['fad', 'sack'] },
    { icon: 'pound-sign', color: 'green', transform: 'shrink-8 down-2' },
  ],
  Blank: { icon: ['far', 'circle'], color: 'blue' },
  Cancel: { icon: 'times' },
  Printer: { icon: ['fad', 'print'] },
  spinner: { icon: ['fad', 'spinner'], color: 'blue', className: 'fa-spin' },
  spinner_third: { icon: ['fad', 'spinner-third'], className: 'fa-spin' },
  info_square: { icon: ['far', 'info-square'] },
  long_arrow_down: { icon: ['far', 'long-arrow-down'] },
  page_up: { icon: ['fad', 'arrow-alt-up'] },
  page_down: { icon: ['fad', 'arrow-alt-down'] },
  thumbs_up: { icon: ['fad', 'thumbs-up'] },
  thumbs_down: { icon: ['fad', 'thumbs-down'] },
  user_add: [
    { icon: ['fad', 'user'] },
    { icon: 'plus', color: 'green', transform: 'shrink-8 up-5 right-7' },
  ],
  user_enable: [
    { icon: ['fad', 'user'], color: 'orange' },
    { icon: 'check', color: 'green', transform: 'shrink-8 up-5 right-7' },
  ],
  user_disable: [
    { icon: ['fad', 'user'], color: 'green' },
    { icon: 'ban', color: 'red', transform: 'shrink-8 up-5 right-7' },
  ],
  user_delete: [
    { icon: ['fad', 'user'], color: 'orange' },
    { icon: 'times', color: 'red', transform: 'grow-1' },
  ],
  user_deceased: [
    { icon: ['fad', 'user'], color: 'orange' },
    { icon: ['fad', 'tombstone'], color: 'black', transform: 'shrink-8 up-5 right-7' },
  ],
  user_undelete: [
    { icon: ['fad', 'user'], color: 'red' },
    { icon: 'check', color: 'green', transform: 'grow-1' },
  ],
  Delete_Member: [
    { icon: ['fad', 'user'], color: 'red' },
    { icon: 'times', transform: 'grow-1' },
  ],
};
['B', 'C', 'W', 'T', 'P'].forEach((ky) => (afIcons[ky + 'X'] = [afIcons[ky], ...X]));
afIcons['+X'] = [...afIcons['+'], ...X];

// import logo from '../../../public/icon-B.svg';
export const Icon = ({ type, name, className: cls, size, ...rest }) => {
  if (!name && type) name = type;
  if (!name) return null;

  if (afIcons[name]) {
    if (!afIcons[name].length) {
      let { className = '', ...afIcon } = afIcons[name];
      className = className + ' ' + cls;
      return <FontAwesomeIcon {...{ ...afIcon, size, className, ...rest }} />;
    }
    return (
      <span className={'fa-layers fa-fw ' + cls} {...rest}>
        {afIcons[name].map((ics, i) => (
          <FontAwesomeIcon {...{ ...ics, size }} key={i} />
        ))}
      </span>
    );
  } else {
    logit(`can't find`, name);
  }

  return null;
};
const Centered = styled.span`
  justify-self: center;
  align-self: center;
  margin: auto;
`;
export const Loading = ({ styleI, ...rest }) => (
  <Centered {...rest}>
    <Icon
      name='spinner'
      style={{ width: '5em', height: '5em', ...styleI, color: '#877031' }}
    />
  </Centered>
);
