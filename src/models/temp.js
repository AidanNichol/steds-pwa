    categorizeBookingLogs() {
      const useFullHistory = getEnv(self).useFullHistory;
      const trace = traceIt(self._id);
      const root = getRoot(self);
      trace && logit('tracing', self._id, self.name);
      self.dirty = 0;
      onPatch(self, (patch, unpatch) => {
        !useFullHistory &&
          logit('onPatch', self._id, self.name, { ...patch, was: unpatch.value });
        self.dirty = true;
      });
      var paymentPeriodStart = root.BP.lastPaymentsBanked;
      const currentBookings = [];
      const oldestWalk = root.WS.oldestWalk;
      let oldestWalkNeeded = 'W0000-00-00';
      self.openingCredit = 0;
      // let preHistoryStarts = '0000-00-00';
      self.showLogs('logs', 1000, trace);
      let aLogs = self.logs.filter(log => log.req[0] !== '_');
      aLogs.forEach(log => {
        if (log.dat > paymentPeriodStart) log.update({ hideable: false });
      });
      //┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
      //┃   if using full history just push all data into          ┃
      //┃   currentPayments and currentBookings                    ┃
      //┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
      if (useFullHistory) {
        self.currentPayments = aLogs;
        self.bookings.forEach(bkngId => {
          const booking = resolveIdentifier(Booking, root, bkngId);
          currentBookings.push(...booking.logs);
        });
        self.currentBookings = currentBookings.sort(cmpDat);
        self.showAllLogs('After Catagorize', 1000, trace);
        return;
      }
      //┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
      //┃   We don't want to show anything older than 'oldestWalk'.┃
      //┃   Find the oldest such payment. Our opening balance will ┃
      //┃   be any credit carried over from the last payment       ┃
      //┃   before that one.                                              ┃
      //┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
      let lastPayment = { dat: '0000-00-00', creditCarriedOver: 0 };
      if (aLogs.length > 0) {
        const start = aLogs.findIndex(log => log.oldestWalk >= oldestWalk);
        if (start !== -1) {
          if (start - 1 >= 0) lastPayment = aLogs[start - 1];
          aLogs = aLogs.slice(start);
          oldestWalkNeeded = aLogs[0].oldestWalk;
        } else {
          // no payment in this period so start with the last one received
          lastPayment = aLogs[aLogs.length - 1];
          aLogs = [];
        }
        if (lastPayment.creditCarriedOver > 0) {
          logit(
            'Credit carried forward',
            self._id,
            self.name,
            lastPayment.dispDat,
            lastPayment,
          );
          //┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
          //┃ Create a dummy payment record to show the carried balance┃
          //┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
          const openCredit = AccountLog.create({
            ...getSnapshot(lastPayment),
            amount: lastPayment.creditCarriedOver,
            note: 'Credit carried forward',
            hideable: false,
            req: '+',
            creditCarriedOver: 0,
          });
          aLogs.unshift(openCredit);
          self.openingCredit = lastPayment.creditCarriedOver;
        }
      }
      //┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
      //┃ We need all bookings with an effective date after the    ┃
      //┃ previous payment                                         ┃
      //┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
      const preHistoryStarts = lastPayment.dat;

      trace &&
        logit('categorize', {
          useFullHistory,
          oldestWalk,
          oldestWalkNeeded,
          paymentPeriodStart,
          preHistoryStarts,
        });
      self.bookings.forEach(bkngId => {
        const booking = resolveIdentifier(Booking, root, bkngId);
        if (booking.walk._id < oldestWalkNeeded) return;
        currentBookings.push(
          ...booking.logs.filter(log => log.effDate > preHistoryStarts),
        );
      });
      self.showLogs('currentLogs', null, trace);
      self.showLogSizes(trace);

      self.currentPayments = aLogs;
      self.currentBookings = currentBookings;
      self.showLogSizes(trace);
      self.showAllLogs('After Catagorize', 1000, trace);
      return;
    },
    // extractUnresolvedWalks() {
    //   self.unresolvedWalks.clear();
    //   self.unclearedBookings.forEach(log => {
    //     if (log.walk.closed) self.unresolvedWalks.add(log.walk._id);
    //   });
    // }
  }));
// var resolvedSort = R.sortWith([
//   R.ascend(R.prop('effDate')),
//   R.descend(R.prop('type')),
//   R.ascend(R.prop('dat'))
// ]);