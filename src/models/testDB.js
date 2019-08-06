// export var PouchDB  = require('pouchdb-browser');

import pouchCore from 'pouchdb-core';
import http from 'pouchdb-adapter-http';
import auth from 'pouchdb-authentication';
import map from 'pouchdb-mapreduce';
var PouchDB = pouchCore
  .plugin(auth)
  .plugin(http)
  .plugin(map);

let dbName = 'http://127.0.0.1:5984/devbookings';

// console.log('Opening database at:', dbName);

export const db = new PouchDB(dbName, { skip_setup: true });
console.log({ db });

export default db;
