const debug = require('debug');
const _ = require('lodash');
// export var opts = {};
// export var logitCodes = [];
var opts = {};
var logitCodes = [];
const debugme = debug('logit:setup');
// const debugme = logit = (...Y) => console.log('logit:setup', ...Y);

let enableStr = '';
if (typeof window !== 'undefined') enableStr = window.localStorage.getItem('debug') || '';
enableStr = (enableStr || '')
  .replace(/"/g, '')
  .split(',')
  // .filter(str => !str.includes('logit'))
  .filter((str) => !str.includes('logit') && !str.includes('pouchdb'))
  .join(',');
enableStr += ',⨁:*,steds:*,-logit:setup';
if (!process.env.DEBUG) debug.enable(enableStr);
// debug.enable(enableStr + ',steds:logit,-logit:setup, -pouchdb*');
// export default function Logit(source) {
module.exports = function Logit(source1, enabled = true) {
  const symbs = {
    components: '⚙️',
    views: '️⛰🏔🗻🌇🌆',
    ducks: '️🦆',
    utility: '️🚧',
    reports: '🖨',
    mobx: '𝔐𝔛',
    containers: '📦',
    StEdsStore: '🏬🏭🏬',
    StEdsLogger: '㏒📜📃📑',
    debugSettings: '🦟🐛🐞',
  };
  if (/^(color|backg)/.test(source1)) console.error('logit old style', source1);
  const parts = source1.split(/[\\/](app|node_modules|packages)[\\/]/);
  const goodBit = parts.pop();

  let source = goodBit
    .replace(/[\\/]/g, ':')
    .replace(/-mobx|.js/g, '')
    .split(':')
    .filter((tk, i, arr) => i === 0 || arr[i] !== arr[i - 1])
    .map((tk) => symbs[tk] || tk)
    .join(':');

  let debb = debug(`⨁:${source}`);
  if (!enabled) debb.disable();
  logitCodes.push(`⨁:${source}`);
  if (typeof window !== 'undefined')
    localStorage.setItem('logitCodes', JSON.stringify(logitCodes));
  _.set(opts, source.split(':'), true);
  debugme(
    'logit setup',
    source,
    logitCodes,
    opts,
    typeof window !== 'undefined' ? localStorage.getItem('logitCodes') : '',
  );
  let backgroundColor = debb.color;
  let textColor = getContrastYIQ(backgroundColor);
  let colorFormat = `color:${textColor}; background:${backgroundColor}; font-weight:bold`;
  const logit = (...Y) => debb('%c %s ', colorFormat, ...Y);
  logit.table = (Y) => debb.enabled && console.table(Y);
  return logit;
};

function getContrastYIQ(hexcolor) {
  if (typeof hexcolor !== 'string') return 'black';
  var r = parseInt(hexcolor.substr(1, 2), 16);
  var g = parseInt(hexcolor.substr(3, 2), 16);
  var b = parseInt(hexcolor.substr(5, 2), 16);
  var yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq > 120 ? 'black' : 'white';
  // return yiq > 120 ? '#000000' : '#ffffff';
}
