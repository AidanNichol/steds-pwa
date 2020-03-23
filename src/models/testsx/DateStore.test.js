import { DateStore } from '../DateStore';

const testDate = '2019-02-21 14:30:15.123';
const testDate2 = '2018-02-21 14:30:15.123';
it('can-create an instance of dateStore', async () => {
  const DS = DateStore.create({ today: new Date(testDate) });

  expect(DS.todaysDate).toBe('2019-02-21');

  expect(DS.datetimePlus1(testDate, 1)).toBe('2019-02-21T14:30:15.124');

  expect(DS.dispDate(testDate2)).toBe('21 Feb, 2018');

  expect(DS.dayNo).toBe(4);

  expect(DS.getLogTime(new Date(testDate))).toBe('2019-02-21T14:30:15.123');

  expect(DS.prevDate).toBe('2018-12-28');

  expect(DS.lastAvailableDate).toBe('2019-04-21');

  expect(DS.datePlusNweeks(testDate, -4)).toBe('2019-01-24');

  expect(DS.datePlusNyears(testDate, -1)).toBe('2018-02-21');

  expect(DS.datePlusNmonths(testDate, -3)).toBe('2018-11-21');

  expect(DS.datePlusNdays(testDate, 4)).toBe('2019-02-25');
  // expect(DS.logTime).toBe('');
});
