import Logit from 'logit';

let db;
let store;

var logit = Logit('ducks/dbChangeMonitoring');
const collections = {
  member: doc => store.MS.updateWithDoc(doc),
  walk: doc => store.WS.updateWithDoc(doc),

  account: doc => store.AS.updateWithDoc(doc),
  paymentSummary: doc => store.BP.updateWithDoc(doc)
};

// lastSeq = 138;

export async function monitorChanges(setdb, setStore) {
  db = setdb;
  store = setStore;
  const info = await db.info();
  logit('info', info);
  let lastSeq = info.update_seq;
  // lastSeq =
  // ('9157-g1AAAABdeJzLYWBgYMpgTmEQTM4vTc5ISXLIyU9OzMnILy7JAUklMiTV____PyuJgUGQHY-6PBYgydAApP5DlQvtywIAHVIdVg');
  let monitor = db
    .changes({ since: lastSeq, live: true, timeout: false, include_docs: true })
    .on('change', info => handleChange(info))
    .on('complete', () => {})
    .on('error', error => logit('changes_error', error));
  // The subscriber must return an unsubscribe function
  return () => monitor.cancel();
}

const handleChange = change => {
  logit('change', change);
  if (change.id[0] === '_' || (change.doc && !change.doc.type)) return;
  const doc = change.doc;

  collections[doc.type](doc);

  logit('change', { change, doc });
};
