import { action, thunk, thunkOn } from "easy-peasy";

import { fetchData } from "../use-data-api";
import Logit from "logit";

var logit = Logit("easyPeasy/walkBookingStatus");

export const walkBookingStatus = {
  status: [],
  stale: false,
  setStatus: action((state, status) => {
    state.status = status;
  }),
  setStale: action((state, stale) => {
    logit("setting stale:", stale);
    state.stale = stale;
  }),
  onStatusStale: thunkOn(
    (actions) => actions.setStale,
    async (actions, target) => {
      logit("onStatusStale", target);
      if (target.payload !== true) return;
      const res = await fetchData("Walk/bookingCount");
      const status = res.data.map((w) => {
        w.full = w.capacity - w.booked - w.waiting <= 0;
        return w;
      });
      logit("getStatus", status);
      actions.setStatus(status);
      actions.setStale(false);
    },
  ),
  loadStatus: thunk(async (actions) => {
    const res = await fetchData("Walk/bookingCount");
    const status = res.data.map((w) => {
      w.full = w.capacity - w.booked - w.waiting <= 0;
      return w;
    });
    logit("getStatus", status);
    actions.setStatus(status);
    actions.setStale(true);
  }),
  updateStatus: action((state, { walkId, from, to }) => {
    const walk = state.status.find((w) => w.walkId === walkId);
    if (from === "B") walk.booked -= 1;
    if (from === "W") walk.waiting -= 1;
    if (from === "C") walk.cars -= 1;
    if (to === "B") walk.booked += 1;
    if (to === "W") walk.waiting += 1;
    if (to === "C") walk.cars += 1;
    walk.full = walk.capacity - walk.booked - walk.waiting <= 0;
  }),
};
export default walkBookingStatus;
