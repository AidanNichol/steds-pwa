const W2019_02_02 = {
  _id: 'W2019-02-02',
  _rev: '104-8ef9c92fe97d5be1774c6640f5ba5086',
  type: 'walk',
  capacity: 51,
  closed: true,
  fee: 8,
  firstBooking: '2018-12-12',
  lastCancel: '2019-01-27 23:59',
  venue: 'Warkworth',
  bookings: {
    M1050: {
      status: 'B',
      annotation: '',
      logs: [
        {
          dat: '2018-12-12T18:50:54.420',
          req: 'B',
          who: '',
          machine: ''
        }
      ],
      memId: 'M1050',
      paid: true,
      lastUpdate: '2019-02-01T17:31:20.225'
    },
    M1051: {
      status: 'B',
      annotation: '',
      logs: [
        {
          dat: '2019-01-30T18:50:56.459',
          req: 'B',
          who: '',
          machine: ''
        }
      ],
      memId: 'M1051',
      lastUpdate: '2018-12-30T18:50:56.459'
    },
    M1052: {
      status: 'B',
      annotation: '',
      logs: [
        {
          dat: '2018-12-12T18:51:41.170',
          req: 'B',
          who: '',
          machine: ''
        }
      ],
      memId: 'M1052',
      lastUpdate: '2018-12-12T18:51:41.170'
    }
  },
  time: '8:00',
  region: 'N',
  organizer: 'Derek Squires',
  map: null,
  walkId: 'W2019-02-02',
  lastUpdate: '2019-02-02T19:59:10.714'
};
const W2019_02_16 = {
  _id: 'W2019-02-16',
  _rev: '104-ecc0fa678023ea2cec590df782e6e027',
  type: 'walk',
  capacity: 51,
  closed: true,
  fee: 8,
  firstBooking: '2019-01-02',
  lastCancel: '2019-02-10 23:59',
  venue: 'Elsdon',
  bookings: {
    M1051: {
      status: 'B',
      annotation: '',
      logs: [
        {
          dat: '2019-01-20T18:40:32.107',
          req: 'B',
          who: '',
          machine: ''
        }
      ],
      memId: 'M1051',
      lastUpdate: '2019-02-01T13:05:25.836'
    },
    M1052: {
      status: 'BX',
      annotation: '',
      logs: [
        {
          dat: '2019-01-02T18:40:39.572',
          req: 'B',
          who: '',
          machine: ''
        },
        {
          dat: '2019-01-16T18:54:22.901',
          req: 'BX',
          who: '',
          machine: ''
        }
      ],
      memId: 'M1052',
      lastUpdate: '2019-01-16T18:54:22.901'
    },
    M1050: {
      status: 'BL',
      annotation: '',
      logs: [
        {
          dat: '2019-01-02T18:41:29.383',
          req: 'B',
          who: '',
          machine: ''
        },
        {
          dat: '2019-02-09T21:23:54.008',
          req: 'BL',
          who: '',
          machine: ''
        }
      ],
      memId: 'M1050',
      lastUpdate: '2019-02-09T21:23:54.008'
    }
  },
  time: '8:00',
  region: 'N',
  organizer: 'Peter Reed',
  map: null,
  walkId: 'W2019-02-16',
  lastUpdate: '2019-02-17T12:42:22.294'
};
const W2019_03_02 = {
  _id: 'W2019-03-02',
  _rev: '72-c197bcc423a7117c39849bfc868c5e56',
  type: 'walk',
  capacity: 51,
  closed: false,
  fee: 8,
  firstBooking: '2019-01-16',
  lastCancel: '2019-02-24 23:59',
  venue: 'Thirsk',
  bookings: {
    M1049: {
      status: 'BX',
      annotation: '',
      logs: [
        {
          dat: '2019-01-16T19:17:39.570',
          req: 'B',
          who: '',
          machine: ''
        },
        {
          dat: '2019-02-26T15:26:57.457',
          req: 'BX',
          who: '',
          machine: ''
        }
      ],
      memId: 'M1049'
    },
    M1051: {
      status: 'B',
      annotation: '',
      logs: [
        {
          dat: '2019-01-17T19:17:39.570',
          req: 'B',
          who: '',
          machine: ''
        }
      ],
      memId: 'M1051'
    }
  },
  time: '8:00',
  region: 'YD',
  organizer: 'George Bruce',
  map: null,
  walkId: 'W2019-03-02'
};
const A1049 = {
  _id: 'A1049',
  _rev: '62-f81e300ed18f45b084c83257d6ded731',
  type: 'account',
  members: ['M1049'],
  logs: [
    {
      req: 'P',
      dat: '2019-01-31T14:54:11.655',
      who: 'M1180',
      type: 'A',
      amount: 8
    }
  ]
};
const A1050 = {
  _id: 'A1050',
  _rev: '62-f81e300ed18f45b084c83257d6ded731',
  type: 'account',
  members: ['M1050'],
  logs: [
    // {
    //   req: 'P',
    //   dat: '2019-01-31T14:54:11.655',
    //   who: 'M1180',
    //   type: 'A',
    //   amount: 8
    // }
  ]
};
const A1052 = {
  _id: 'A1052',
  _rev: '62-f81e300ed18f45b084c83257d6ded731',
  type: 'account',
  members: ['M1052'],
  logs: [
    {
      req: 'P',
      dat: '2019-01-31T14:54:11.655',
      who: 'M1180',
      type: 'A',
      amount: 8
    }
  ]
};
const A1051 = {
  _id: 'A1051',
  _rev: '62-f81e300ed18f45b084c83257d6ded731',
  type: 'account',
  members: ['M1051'],
  logs: [
    {
      req: 'P',
      dat: '2019-02-02T14:54:11.655',
      who: 'M1180',
      type: 'A',
      amount: 8
    },
    {
      req: 'P',
      dat: '2019-02-16T14:54:11.655',
      who: 'M1180',
      type: 'A',
      amount: 8
    },
    {
      req: 'P',
      dat: '2019-03-02T14:54:11.655',
      who: 'M1180',
      type: 'A',
      amount: 8
    }
  ]
};
export const M1049 = {
  _id: 'M1049',
  _rev: '23-68dc735b91cfe92e31e3abea7fb1e204',
  type: 'member',
  memberId: 'M1049',
  accountId: 'A1049',
  firstName: 'Aidan',
  lastName: 'Nichol',
  memberStatus: 'Member',
  memNo: 1049
};
export const M1050 = {
  _id: 'M1050',
  _rev: '23-68dc735b91cfe92e31e3abea7fb1e204',
  type: 'member',
  memberId: 'M1050',
  accountId: 'A1050',
  firstName: 'Margaret',
  lastName: 'Nichol',
  memberStatus: 'Member',
  memNo: 1050
};
export const M1051 = {
  _id: 'M1051',
  _rev: '23-68dc735b91cfe92e31e3abea7fb1e204',
  type: 'member',
  memberId: 'M1051',
  accountId: 'A1051',
  firstName: 'Gareth',
  lastName: 'Nichol',
  memberStatus: 'Member',
  memNo: 1051
};
export const M1052 = {
  _id: 'M1052',
  _rev: '23-68dc735b91cfe92e31e3abea7fb1e204',
  type: 'member',
  memberId: 'M1052',
  accountId: 'A1052',
  firstName: 'Antonia',
  lastName: 'Nichol',
  memberStatus: 'Member',
  memNo: 1052
};
const BP = {
  _id: 'BP2019-01-16T21:44',
  _rev: '2-b4c347fc0cc74546bdab272dc2b593aa',
  type: 'paymentSummary',
  startDispDate: '05 Jan 20:42',
  endDispDate: '16 Jan 21:44',
  closingCredit: 68,
  closingDebt: -532,
  openingCredit: 68,
  openingDebt: 444,
  endDate: '2019-02-25T21:44:35.937',
  startDate: '2019-01-05T20:42:45.607'
};
export const testStore = {
  MS: { members: [M1049, M1050, M1051, M1052] },
  AS: { accounts: [A1049, A1050, A1051, A1052] },
  WS: { walks: [W2019_02_02, W2019_02_16, W2019_03_02] },
  BP,
  router: {},
  signin: { name: 'sandy', loggedIn: true, roles: ['bookings'] }
};
