import { AccountLog } from '../AccountLog';
const log = {
  req: 'P',
  dat: '2016-10-31T14:54:11.655',
  who: 'M1180',
  type: 'A',
  amount: 8,
  logsFrom: '2016-10-31T14:54:11.615',
  restartPt: true
};
it('can-create an instance of accountLog', () => {
  const item = AccountLog.create(log);
  // expect(item.walk.venue).toBe('xxx');
  expect(item.type).toBe('A');
  expect(item.req).toBe('P');
  expect(item.text).toBe('');
});
