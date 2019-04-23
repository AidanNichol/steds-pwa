import { types } from 'mobx-state-tree';
const stati = ['B', 'W', 'WX', 'WL', 'BX', 'BL', 'C', 'CX', 'CL'];
export const tBookingStatus = types.enumeration(stati);
export const iAccountId = types.refinement(types.string, id => /^A\d+$/.test(id));
export const tLogReq = types.enumeration([...stati, 'N', 'A']);
export const tWalkId = types.refinement(types.string, id =>
  /^W\d\d\d\d-\d\d-\d\d$/.test(id)
);
export const tbookingId = types.refinement(types.string, id =>
  /^W\d\d\d\d-\d\d-\d\dM\d+$/.test(id)
);
export const tLogDate = types.refinement(types.string, id =>
  /^\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d(.\d\d\d)?$/.test(id)
);
