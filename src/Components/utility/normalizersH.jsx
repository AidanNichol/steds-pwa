// import {titleize} from 'underscore.string';
import Logit from 'logit';
const titleize = (string) =>
  string.toLowerCase().replace(/(^|\s)[a-z]/g, function (f) {
    return f.toUpperCase();
  });

var logit = Logit('components/utility/normalizers');
export function normalize(field, fn) {
  let origalOnChange = field.onChange;
  // if (event.type!=='input')
  return {
    ...field,
    onChange: (event) => {
      logit('normalizer', { field, event, target: event.target });
      event.target.value = fn(event.target.value, field.value);

      return origalOnChange(event);
    },
  };
}

export function properCaseName(e) {
  if (!e.target.value) return;
  let name = e.target.value;
  const lowerCaseNames = ['van', 'de', 'de la', 'de le', 'von', 'van der'];
  var pcexp, pre, result;
  pcexp = /^(Mac|Mc|.+[ '])?(\w)$/;

  result = pcexp.exec(name);
  if (result) {
    pre = result[1];
    // logit('properCaseName', result);
    if (pre) {
      if (lowerCaseNames.includes(pre.trim().toLowerCase())) pre = pre.toLowerCase();
    } else pre = '';
    name = pre + result[2].toUpperCase();
  }
  e.target.value = name;
}
export function properCaseAddress(e) {
  if (!e.target.value) return;
  let address = e.target.value;
  // if (address.substr(0, oldValue.length) !== oldValue) return address;
  const addressShortcuts = {
    Wb: 'Whitley Bay',
    'W/b': 'Whitley Bay',
    Ns: 'North Shields',
    'N/s': 'North Shields',
    Nut: 'Newcastle upon Tyne',
    'N/t': 'Newcastle upon Tyne',
    'N/c': 'Newcastle upon Tyne',
    Wal: 'Wallsend',
    Cul: 'Cullercoats',
    'M/s': 'Monkseaton',
    Mon: 'Monkseaton',
    Mnk: 'Monkseaton',
    Tyn: 'Tynemouth',
    Tm: 'Tynemouth',
    TN: 'Tynemouth',
    'T/m': 'Tynemouth',
  };
  let result,
    addrLines = address.split('\n'),
    //Post Code validation
    pcexp = /^([^]*)([abcdefghijklmnoprstuwyz]{1}[abcdefghklmnopqrstuvwxy]?[0-9]{1,2})(\s*)([0-9]{1}[abdefghjlnpqrstuwxyz]{2})$/i;
  addrLines.forEach((line, index) => {
    if ((result = pcexp.exec(line)))
      line =
        titleize(result[1]) + result[2].toUpperCase() + ' ' + result[4].toUpperCase();
    else {
      line = titleize(line);
      if (addressShortcuts[line]) line = addressShortcuts[line];
    }
    addrLines[index] = line;
  });
  e.target.value = addrLines.join('\n');
}

export function normalizePhone(e) {
  if (!e.target.value) return;
  var onlyNums = e.target.value.replace(/[^\d]/g, '');
  if (onlyNums.length > 0 && onlyNums[0] !== '0') onlyNums = '0191' + onlyNums;

  const rg = /^(\d{0,4})(\d{0,3})?(\d*)?$/;
  let result = onlyNums.match(rg);
  if (!result) return;

  e.target.value = result
    .slice(1)
    .filter((b) => b)
    .join('-');
}

export default normalizePhone;
