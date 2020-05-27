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

// export const DateStore = types
//   .model({
//     today: types.optional(types.Date, new Date()),
//     testing: types.optional(types.boolean, false)
//   })
//   .views(self => ({
//     datetimePlus1(oldDate, inc = 1) {
//       return formatISOdate(addMilliseconds(parseISO(oldDate), inc));
//     },

//     dispDate(dat) {
//       return dispDate(dat, self.Today);
//     },

//     get dayNo() {
//       return getDay(self.today);
//     },

//     get todaysDate() {
//       return formatDate(self.today);
//     },
//     getLogTime(today = new Date()) {
//       return formatISOdate(today);
//     },

//     get now() {
//       return format(new Date(), 'yyyy-MM-dd HH:mm');
//     },

//     get prevDate() {
//       return formatDate(addDays(self.today, -55));
//     },

//     get lastAvailableDate() {
//       return formatDate(addDays(self.today, 59));
//     },

//     get logTime() {
//       return formatISOdate(new Date());
//     },
//     datetimeIsRecent(datStr) {
//       return self.datetimeIsToday(datStr);
//     },
//     datetimeIsToday(datStr) {
//       return datStr.substr(0, 10) === self.todaysDate; // in the same day
//     },

//     datePlusNweeks(dat, n = 4) {
//       return formatDate(addWeeks(parseISO(dat), n));
//     },
//     datePlusNyears(dat, n) {
//       return formatDate(addYears(dat ? parseISO(dat) : new Date(), n));
//     },
//     datePlusNmonths(dat, n) {
//       return formatDate(addMonths(parseISO(dat), n));
//     },
//     datePlusNdays(dat, n) {
//       return formatDate(addDays(new Date(dat), n));
//     }
//   }))
//   .actions(self => ({
//     setNewDate(newDate, testing = false) {
//       self.today = typeof newDate === 'string' ? new Date(newDate) : newDate;
//       self.testing = testing;
//     }
//   }));
