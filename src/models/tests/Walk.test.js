import { Walk } from '../Walk';
import { Booking } from '../Booking';
import { testWalk } from './testdata/W2019-03-02.js';
import { resolveIdentifier } from 'mobx-state-tree';
// Object.keys(testWalk.bookings).forEach(id => (testWalk.bookings[id]['memId'] = id));
it('can create an instance of walk', () => {
  const item = Walk.create(testWalk);
  expect(item.venue).toBe('Thirsk');
  expect(item.bookings.size).toBe(Object.keys(testWalk.bookings).length);
  const me2 = resolveIdentifier(Booking, item, 'W2019-03-02M2015');
  const me = item.bookings.get('W2019-03-02M2015');
  expect(me).toBe(me2);
  expect(me.logs[0].dat).toBe('2019-01-19T21:19:36.982');
});
