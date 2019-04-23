const R = require('ramda');
const allHidable = R.all(R.equals(false), R.map(R.prop('hideable')));
const test1 = [{ hideable: true }, { hideable: true }, { hideable: true }];
const test2 = [{ hideable: false }, { hideable: false }, { hideable: false }];
const test3 = [{ hideable: false }, { hideable: true }, { hideable: false }];
describe('handles all hidden', () => {
  const res = allHidable(test1);

  expect(res).toBe(true);
});
describe('handles all show', () => {
  const res = allHidable(test2);
  expect(res).toBe(false);
});
describe('handles mixed', () => {
  const res1 = R.map(R.prop('hideable'))(test3);
  const res = allHidable(test3);
  const res2 = R.all(R.equals(false))(res1);
  test('should match', () => {
    console.log(res1);
    expect(res1).toMatchObject([false, true, false]);
  });
  it('res2 should be false', () => {
    expect(res2).toBe(false);
  });
  it('should be false', () => {
    expect(res).toBe(false);
  });
});
