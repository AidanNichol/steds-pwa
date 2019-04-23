export const viewsIndex = self => ({
  membersSorted(ui) {
    let members =
      ui.sortProp === 'name' ? self.membersSortedByName : self.membersSortedByMemNo;

    return members;
  },
  get membersSortedByName() {
    const byNameR = (a, b) => a.fullNameR.localeCompare(b.fullNameR);
    return self.members.filter(memb => !self.hideOld || !memb.isOld).sort(byNameR);
  },

  get membersSortedByMemNo() {
    const byMemId = (a, b) => a.memNo - b.memNo;
    return self.members.filter(memb => !self.hideOld || !memb.isOld).sort(byMemId);
  },
  membersIndex(ui) {
    return ui.sortProp === 'name' ? self.membersIndexByName : self.membersIndexByNumber;
  },

  get membersIndexByName() {
    const members = self.membersSortedByName;
    let key = [],
      index = {},
      lastKey = '';
    members.forEach((mem, i) => {
      let c = mem.lastName[0];
      if (c !== lastKey) {
        lastKey = c;
        key.push([c, c, i]);
        index[c] = 0;
      }
      index[c]++;
    });
    return { key, index };
  },

  get membersIndexByNumber() {
    const members = self.membersSortedByMemNo;
    let key = [],
      index = {};
    let bsize = Math.ceil(members.length / 24);
    for (var i = 0; i < members.length; i = i + bsize) {
      let c = members[i].memberId;
      key.push(['○', c, i]);
      index[c] = i;
    }
    return {
      key,
      index
    };
  },
  syncToIndex(ui) {
    if (!self.currentMember) return (ui.dispStart = 0);
    let i = self.membersSorted.findIndex(mem => mem._id === self.currentMember._id);
    if (i >= ui.dispStart && i <= ui.dispStart + ui.dispLength - 1) return ui.dispStart; // already showing on current page
    return Math.max(i - 11, 0); // postion in middle of page
  }
});
