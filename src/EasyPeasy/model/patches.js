import { action, thunk, thunkOn, debug } from "easy-peasy";
import _ from "lodash";
import { postData } from "../use-data-api";

// import { dispDate } from '../dateFns';

import Logit from "logit";
var logit = Logit("hooks/patches");

/*
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                    useApplyPatches                       ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ 
*/

export const patches = {
  queue: [],
  processing: false,
};
patches.setProcessing = action((state, bool) => state.processing = bool);
patches.onPushToQueue = thunkOn(
  (actions) => actions.pushToQueue,
  (actions) => actions.processQueue(),
);
patches.processQueue = thunk(
  async (actions, payload, { getState, getStoreActions }) => {
    if (getState().processing) return;
    actions.setProcessing(true);
    const send = getStoreActions().socket.send;

    let queue = getState().queue;
    logit("queue changed", queue.length, debug(queue));
    while (queue.length > 0) {
      const [patch, /*unpatch*/ , accountId] = queue.shift();
      logit("process patch", debug(patch));
      const res = await postData(patch);
      logit("appliedPatches", debug(patch), res);
      send({ changed: accountId });
      actions.shiftFromQueue();
    }
    actions.setProcessing(false);
  },
);

/*
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃                    useAddPatches                         ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ 
*/

patches.pushToQueue = action((state, patches) => {
  state.queue.push(patches);
  logit("pushToQueue", state.queue.length);
});
patches.shiftFromQueue = action((state) => state.queue = _.tail(state.queue));
patches.addToQueue = thunk((actions, patches, { getStoreState }) => {
  const index = getStoreState().names;
  logit("AddPatches", patches);
  let xpatches = expandPatch(patches);
  if (xpatches[2]) xpatches[2] = index.get(xpatches[2])?.accountId;
  actions.pushToQueue(xpatches);
});
const expandPatch = (arr) => {
  let [patches, unpatches] = arr;
  const newPatches = [];
  logit("patches.in", debug(patches));
  let memberId;

  patches.forEach((p) => {
    if (/Stack$/i.test(p.path[0])) return;
    if (p.path[0] === "balance") return;
    let { op, path, value } = _.cloneDeep(p);
    value = debug(value);
    p = { op, path, value };

    if (path[0] === "bookings") {
      if (path[2] === "Allocations") return;
      memberId = value.memberId;
      let log = _.last(value.BookingLogs);
      if (log) {
        const patch = { op: "add", path: ["BookingLog"], value: log };
        newPatches.push(patch);
      }

      delete value.Walk;
      delete value.BookingLogs;
      delete value.Allocations;
      path[0] = "Booking";
      return newPatches.push(p);
    }

    if (path[0] === "payments" && path[2] === "Allocations") {
      p.path = ["Allocation"];
      if (!_.isArray(p.value)) p.value = [value];
      p.value.forEach((v) => delete v.Booking);

      return newPatches.push(p);
    }
    if (path[0] === "payments") path[0] = "Payment";
    if (path[0] === "Payment" && path.length < 3) {
      logit("payments", p);
      let allocs = (value.Allocations || []).filter((v) => !v.id);
      if (allocs.length > 0) {
        allocs.forEach((a) => delete a.Booking);
        const patch = { op, path: ["Allocation"], value: allocs };
        newPatches.push(patch);
      }
      delete value.Walk;
      delete value.Allocations;
    }

    newPatches.push(p);
  });
  logit("patches.out", debug(newPatches));
  newPatches.forEach((p, i) =>
    logit("new " + i, p.op, p.path.join("."), p.value)
  );
  return [newPatches, unpatches, memberId];
};
