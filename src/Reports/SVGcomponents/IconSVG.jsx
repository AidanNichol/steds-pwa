import React from 'react';

import { ReactComponent as icon_A } from '../images/icon-A.svg';
// import { ReactComponent as icon_K } from '../images/icon-+.svg';
// import { ReactComponent as icon_KX } from '../images/icon-+X.svg';
import { ReactComponent as icon_B } from '../images/icon-B.svg';
import { ReactComponent as icon_BX } from '../images/icon-BX.svg';
import { ReactComponent as icon_BL } from '../images/icon-BL.svg';
import { ReactComponent as icon_Blank } from '../images/icon-Blank.svg';
import { ReactComponent as icon_Cancel } from '../images/icon-Cancel.svg';
import { ReactComponent as icon_C } from '../images/icon-C.svg';
import { ReactComponent as icon_Chk } from '../images/icon-Chk.svg';
import { ReactComponent as icon_CX } from '../images/icon-CX.svg';
import { ReactComponent as icon_P } from '../images/icon-P.svg';
import { ReactComponent as icon_PX } from '../images/icon-PX.svg';
import { ReactComponent as icon_T } from '../images/icon-T.svg';
import { ReactComponent as icon_TX } from '../images/icon-TX.svg';
import { ReactComponent as icon_W } from '../images/icon-W.svg';
import { ReactComponent as icon_WX } from '../images/icon-WX.svg';
import { icon_Wn } from '../../images/icon-Wn.js';
import { ReactComponent as page_up } from '../images/page-up.svg';
import { ReactComponent as page_down } from '../images/page-down.svg';
import { ReactComponent as user_add } from '../images/user-add.svg';
import { ReactComponent as user_delete } from '../images/user-delete.svg';
import { ReactComponent as user_undelete } from '../images/user-undelete.svg';
import { ReactComponent as user_disable } from '../images/user-disable.svg';
import { ReactComponent as user_enable } from '../images/user-enable.svg';
import { ReactComponent as Delete_Member } from '../images/Delete_Member.svg';
// import { ReactComponent as Printer } from '../images/Printer.svg';

const icons = {
  A: icon_A,
  // '+': icon_K,
  // '+X': icon_KX,
  B: icon_B,
  BX: icon_BX,
  BL: icon_BL,
  Cancel: icon_Cancel,
  Blank: icon_Blank,
  Chk: icon_Chk,
  C: icon_C,
  CX: icon_CX,
  P: icon_P,
  PX: icon_PX,
  T: icon_T,
  TX: icon_TX,
  W: icon_W,
  WX: icon_WX,
  Wn: icon_Wn,
  page_up,
  page_down,
  user_add,
  user_delete,
  user_disable,
  user_enable,
  user_undelete,
  Delete_Member
  // Printer
};

export const Icon = ({ type, name, className, ...rest }) => {
  const Comp = icons[type];
  if (!Comp) console.warn('icon', type);

  return <Comp className={(className || '') + ` icon ${type} ${name}`} {...rest} />;
};
