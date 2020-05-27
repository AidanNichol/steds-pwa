import { action } from "easy-peasy";
import Logit from "logit";
const logit = Logit("store/router");
export const router = {
  page: "",
  memberId: "",
  accountId: "",
  initialized: false,

  setPage: action((state, payload) => {
    logit("setPage", payload);
    if (payload.page) state.page = payload.page;
    else state.page = payload;
  }),
  setAccount: action((state, accountId) => {
    state.accountId = accountId;
  }),
  setMember: action((state, memberId) => {
    state.memberId = memberId;
  }),
};

export default router;
