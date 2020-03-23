import { Store } from '../Store';
import { Member } from '../Member';
import { testStore } from './testdata/A1049 statusTestData';
import { resolveIdentifier } from 'mobx-state-tree';

describe('Can correctly handle current member', () => {
  let store,
    MS,
    testno = 47;
  beforeEach(() => {
    store = Store.create(testStore, { useFullHistory: true });
    MS = store.MS;
  });

  test('right number of members', () => {
    expect(MS.members.length).toBe(4);
  });
  test('undefined current member', () => {
    expect(MS.currentMember).toBe(undefined);
  });
  test('set current member', () => {
    MS.setCurrentMember('M1049');
    expect(MS.currentMember._id).toBe('M1049');
    expect(MS.currentMember.firstName).toBe('Aidan');
  });
  test('undefined current member', () => {
    MS.setCurrentMember(undefined);
    expect(MS.currentMember).toBe(undefined);
  });

  describe('Test deleting member', () => {
    let MS;
    beforeAll(() => {
      MS = store.MS;
      MS.setCurrentMember('M1050');
      MS.deleteCurrentMember();
    });
    console.log(testno, MS);
    test('right number of members', () => {
      expect(MS.members.length).toBe(3);
    });
    test('delete member not found', () => {
      const mem = resolveIdentifier(Member, store, 'M1050');
      expect(mem).toBe(undefined);
    });
  });
});
