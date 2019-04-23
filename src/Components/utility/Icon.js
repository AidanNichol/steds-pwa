import React from 'react';
//
import icon_A from '../../images/icon-A.svg';
import icon_K from '../../images/icon-+.svg';
import icon_KX from '../../images/icon-+X.svg';
import icon_B from '../../images/icon-B.svg';
import icon_BX from '../../images/icon-BX.svg';
import icon_BL from '../../images/icon-BL.svg';
import icon_Blank from '../../images/icon-Blank.svg';
import icon_Cancel from '../../images/icon-Cancel.svg';
import icon_C from '../../images/icon-C.svg';
import icon_CX from '../../images/icon-CX.svg';
import icon_P from '../../images/icon-P.svg';
import icon_PX from '../../images/icon-PX.svg';
import icon_T from '../../images/icon-T.svg';
import icon_TX from '../../images/icon-TX.svg';
import icon_W from '../../images/icon-W.svg';
import icon_WX from '../../images/icon-WX.svg';
import page_up from '../../images/page-up.svg';
import page_down from '../../images/page-down.svg';
import user_add from '../../images/user-add.svg';
import user_delete from '../../images/user-delete.svg';
import user_undelete from '../../images/user-undelete.svg';
import user_disable from '../../images/user-disable.svg';
import user_enable from '../../images/user-enable.svg';
import Delete_Member from '../../images/Delete_Member.svg';
import Printer from '../../images/Printer.svg';

const icons = {
  A: icon_A,
  '+': icon_K,
  '+X': icon_KX,
  B: icon_B,
  BX: icon_BX,
  BL: icon_BL,
  Cancel: icon_Cancel,
  Blank: icon_Blank,
  C: icon_C,
  CX: icon_CX,
  P: icon_P,
  PX: icon_PX,
  T: icon_T,
  TX: icon_TX,
  W: icon_W,
  WX: icon_WX,
  page_up,
  page_down,
  user_add,
  user_delete,
  user_disable,
  user_enable,
  user_undelete,
  Delete_Member,
  Printer
};

// import logo from '../../../public/icon-B.svg';
export const Icon = ({ type, name, className, ...rest }) => {
  // return (<svg className={(className||'')+' icon'} {...rest}>
  //   <use xlinkHref={`../assets/icons.svg#${type ? 'icon-'+type : name}`} />
  //   {/* <use xlinkHref={`../assets/requestTypeIcons.svg#${type ? 'icon-'+type : name}`} /> */}
  // </svg>)
  return (
    <img
      className={(className || '') + ` icon ${type} ${name}`}
      alt={type + ' ' + name}
      {...rest}
      src={icons[type || name]}
    />
  );
};
