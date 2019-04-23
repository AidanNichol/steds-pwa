const {
  format,
  addMilliseconds,
  differenceInMonths,
  differenceInMilliseconds,
  getDay,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  parseISO
} = require('date-fns');
const { format: fmtFp } = require('date-fns/fp');
const formatDate = fmtFp('yyyy-MM-dd');
const formatISOdate = fmtFp("yyyy-MM-dd'T'HH:mm:ss.SSS");

const today = new Date();

export const DS = {
  datetimePlus1(oldDate, inc = 1) {
    return formatISOdate(addMilliseconds(parseISO(oldDate), inc));
  },

  dispDate(dat) {
    const tdat = parseISO(dat);
    const fmt = differenceInMonths(today, tdat) > 6 ? 'dd MMM, yyyy' : 'dd MMM HH:mm';
    return format(tdat, fmt);
  },
  get dispTime() {
    return format(new Date(), 'HH:mm:ss.SSS');
  },
  get dayNo() {
    return getDay(today);
  },

  get todaysDate() {
    return formatDate(today);
  },
  getLogTime(today = new Date()) {
    return formatISOdate(today);
  },

  get now() {
    return format(new Date(), 'yyyy-MM-dd HH:mm');
  },

  get prevDate() {
    return formatDate(addDays(today, -55));
  },

  get lastAvailableDate() {
    return formatDate(addDays(today, 59));
  },

  get logTime() {
    return formatISOdate(new Date());
  },
  duration(start, end) {
    // const diff = differenceInMilliseconds(start, end);
    // console.log('duration ', start, end, diff, diff / 1000);
    return differenceInMilliseconds(end, start) / 1000;
  },
  datetimeIsRecent(datStr) {
    return DS.datetimeIsToday(datStr);
  },
  datetimeIsToday(datStr) {
    return datStr.substr(0, 10) === DS.todaysDate; // in the same day
  },

  datePlusNweeks(dat, n = 4) {
    return formatDate(addWeeks(parseISO(dat), n));
  },
  datePlusNyears(dat, n) {
    return formatDate(addYears(dat ? parseISO(dat) : new Date(), n));
  },
  datePlusNmonths(dat, n) {
    return formatDate(addMonths(parseISO(dat), n));
  },
  datePlusNdays(dat, n) {
    return formatDate(addDays(new Date(dat), n));
  }
};
export default DS;
