import React from 'react';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fad } from './images/fa-subset/js-packages/@fortawesome/pro-duotone-svg-icons';
import { far } from './images/fa-subset/js-packages/@fortawesome/pro-regular-svg-icons';
import { fas } from './images/fa-subset/js-packages/@fortawesome/pro-solid-svg-icons';

// const symbs0 = ['fad faBus', 'far faClock', 'far faCircle', 'far faPrint', 'far faSack'];
const symbs = [
  ['fad', 'bus'],
  ['fad', 'clock'],
  ['far', 'circle'],
  ['fad', 'print'],
  ['fad', 'sack'],
  ['fad', 'car-side'],
];
export const IconsLoad = () => (
  <span style={{ display: 'none' }}>
    {symbs.map((nm, j) => (
      <FontAwesomeIcon icon={nm} key={j} />
    ))}
    <FontAwesomeIcon icon={['ajn', 'credit']} color='green' />
    <FontAwesomeIcon icon={['fad', 'bus']} color='orange' />
    <FontAwesomeIcon icon={['fad', 'faBus']} color='blue' />

    <FontAwesomeIcon icon={['fas', 'tenge']} color='cyan' />
    <FontAwesomeIcon icon={['fad', 'bus']} color='purple' />
    <FontAwesomeIcon icon={['ajn', 'credit']} color='green' />
  </span>
);
// const L = {
//   prefix: 'fas',
//   iconName: 'fa-late',
//   icon: [
//     24,
//     24,
//     [],
//     'e000',
//     'M8.777,2 L8.777,18.573 L20.714,18.573 L20.714,15.509 L12.488,15.509 L12.488,2 z',
//   ],
// };
const treasurer = {
  prefix: 'ajn',
  iconName: 'treasurer',
  icon: [
    24,
    24,
    [],
    'e001',
    'M17.706,18.252 L14.004,18.719 L14.164,5.692 L17.883,6.275 L17.883,11.142 L20.681,11.142 L20.362,2.05 C17.706,2.254 15.049,2.312 12.357,2.312 C9.701,2.312 7.026,2.254 4.281,2.05 L3.962,11.142 L6.778,11.142 L6.778,6.275 L10.462,5.692 L10.781,18.719 L6.955,18.252 L6.955,22.711 C9.559,22.565 10.887,22.478 12.322,22.478 C13.845,22.478 15.155,22.594 17.706,22.711 z',
  ],
};
const credit = {
  prefix: 'ajn',
  iconName: 'credit',
  icon: [
    24,
    24,
    [],
    'e002',
    'M22.847,13.308 C22.537,12.396 21.857,11.759 20.926,11.759 C19.518,11.759 18.801,13.181 18.252,14.539 L18.24,14.539 L18.491,11.59 L14.624,12.417 L15.054,15.855 L16.271,15.006 L16.391,19.356 L14.899,19.165 L14.899,22.411 C15.603,22.348 16.45,22.284 17.286,22.284 C18.097,22.284 18.909,22.348 20.246,22.411 L20.246,19.165 L18.372,19.356 L18.372,17.234 C18.825,16.194 19.434,15.303 20.198,15.324 L21.093,16.555 z M11.49,5.253 C10.998,4.817 9.547,3.946 8.162,3.946 C3.422,3.946 1.88,9.427 1.88,13.448 C1.88,18.39 3.603,22.923 8.162,22.923 C9.016,22.923 10.247,22.565 10.998,22.104 C11.969,21.54 12.889,20.619 13.51,19.645 L12.513,16.29 C11.853,17.161 10.454,19.184 8.162,19.184 C6.232,19.184 4.807,16.982 4.807,13.448 C4.807,10.221 6.31,7.557 8.162,7.557 C9.703,7.557 10.622,8.531 11.05,8.864 L10.648,12.09 L12.617,13.14 L14.326,3.895 L11.827,2.384 z',
  ],
};
library.add(treasurer, credit, fad, fas, far);
