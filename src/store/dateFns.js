const {
  format,
  addSeconds,
  differenceInMonths,
  parseISO,
  addMonths,
  setMilliseconds,
  addMilliseconds,
} = require('date-fns');
const { format: fmtFp } = require('date-fns/fp');
export const formatDate = fmtFp('yyyy-MM-dd');
export const formatDateTime = fmtFp('yyyy-MM-dd HH:mm');
export const formatISOdate = fmtFp("yyyy-MM-dd'T'HH:mm:ss.SSS");
const loadedDate = new Date();
export const dispDate = (dat, base = loadedDate) => {
  const tdat = parseISO(dat);
  const fmt = differenceInMonths(base, tdat) > 6 ? 'dd MMM, yyyy' : 'dd MMM HH:mm';
  return format(tdat, fmt);
};
export const ageInMonths = (dat, base = loadedDate) => {
  if (!dat) return 10000;
  const tdat = parseISO(dat.substr(0, 10));
  console.log('ageinMonths', dat, tdat);
  return differenceInMonths(base, tdat);
};

export const yearMonth = (dat) => {
  if (!dat) return '';
  // const tdat = parseISO(dat.substr(0, 10));

  return fmtFp('MMM yyyy', parseISO(dat.substr(0, 10)));
};

export const adjustMonths = (oldDate, inc = 1) => {
  return formatDate(addMonths(parseISO(oldDate), inc));
};

export const datetimeNextSec = (oldDate, inc = 1) => {
  return formatISOdate(addSeconds(setMilliseconds(parseISO(oldDate), 0), inc));
};
export const datetimePrevSec = (oldDate, inc = -1) => {
  return formatISOdate(setMilliseconds(addMilliseconds(parseISO(oldDate), inc), 0));
};

export const todaysDate = () => {
  let tdy = new Date();
  tdy = parseISO('2020-03-18');
  return formatDate(tdy);
};
export const now = () => {
  let tdy = formatDateTime(new Date());
  // tdy = setDay(setMonth(tdy, 3), 18);
  tdy = '2020-03-18' + tdy.substr(10);
  return tdy;
};

export const today = () => {
  let tdy = new Date();
  tdy = parseISO('2020-03-18');
  return formatDate(tdy);
};
export const currentSubsYear = () => {
  let year = today().substr(0, 4);
  const tdy = parseISO(today());
  const lastYear = format(addMonths(tdy, -3), 'yyyy');
  if (lastYear < year) year = lastYear;
  console.log('currentSubsYear', year);
  return year;
};

export const getTimestamp = () => {
  return formatISOdate(new Date());
};
