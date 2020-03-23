var PouchDB = require('pouchdb');
var pouchCore = require('pouchdb-core');
var http = require('pouchdb-adapter-http');
var Authentication = require('pouchdb-authentication');

PouchDB = pouchCore.plugin(http);
PouchDB.plugin(Authentication);

var dbHost = 'http://127.0.0.1:5984';
var dbName = dbHost + '/devbookings';

var db;

db = new PouchDB(dbName);
console.log(db);
db.logIn('aidan', 'admin')
  .then(() => {
    console.log('logged in');
  })
  .catch(error => console.log(error));
