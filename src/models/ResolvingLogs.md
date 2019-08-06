## Terminology

- **Date** usually refers to a timestamp that records the date and time of the event to the nearest millisecond. The only time it doesn't is the date of a walk which is only the day on which it takes place.
- **Booking** can be a little ambiguous. It can change over time e.g. go on the waiting list, get a seat on the bus, cancel it, replace that with a car booking etc. Each change is recorded in a booking log record and **booking** usually refers to these log records because they tell us the state at any particular time, e.g. when payments are received.

## Background

At the start of the system all users started from a zero base. The bookings are made and payments are received. The current balance is calculated by going forward through time and calculating a running total of how much each user owes us. If at the end the number is positive then they have some credit and if negative then they still owe us for un paid bookings.

The problem is that as time goes by this system becomes more clumbersome becuase there is more and more data that has to be processed. This reduces response time and eventually the amount of data that needs to be held in memory will exceed the capacity available.

We need to find a way to be able to move forward and show the current user status without processing all the data. The basis for doing this is establish zero points in time when the user is completely paided up for previous bookings and has no credits available (this last caviat is because I would like to be able to show why a user has credit avaiable but is not an absolute requirement).

Another side effect of working from the start through time is that we are continually repeating the same calculations getting the same answers. Up until the point were money is banked, payments and bookings can be changed but once the banking point is reached they become frozen so will always give the same results.

The intension is to find a way they the results of these calculations can be stored with the data on the data base (in an efficient way) so that the calculations can be started at some later points in time.

## Problems

There are certain complications that need to be handled.

1. Most users pay for all outstanding bookings as soon as they can which means that achieve a zero balance point allowing us to potentially restart from there. But often this does not happen. They may not have enough money or they decide to pay more than they owe so they have a credit for a future booking e.g. they are on the waiting list and are confident that they'll eventually get a seat on the bus.
2. Some users permanently have two or three bookings and only pay for the current walk. Looking at their transactions chronolgically they never hit a point when the account is in balance.
3. Sometimes a user books a walk and then cancels late (so they still owe for the walk) but don't come out again for a long time. How do we make sure we don't loose these bookings without going back through all walks.
4. Walks can be booked by the user out for sequence, e.g. they book some later walks and the due to changes in their circumstances decide to book on the next walk. If they then make a partial payment which walk does that apply to the first booked or the oldest walk.

## Handling payments

The way the system currently works is that go through all payment chronologically:

1. for each payment we get all the booking log records that have not yet been cleared that were available at the time the payment was made.
2. The booking log records are sorted and group by walk date. The payment is used to clear as many of those bookings as possible starting with the oldest walk.
3. If all the booking logs are cleared then the balance will be zero and is point at which we could potentially start looking at the account from this time onwards and ignore everthing that happened earlier.
4. If there are any bookings that aren't cleared by the payment then these will have to be defered to be handled by a later payment. We handle this by assigning a delayed date to the log record which is one millisecond after this payment was received. By using this delayed date rather than the actual transaction date for the booking we can still use this payment as a restart point.

   ## How to Use a Restartpoint

   If we look at a payment that is flagged as restart point(i.e. zero balance) how do we know what bookings must be considered to move forward from there.

5. we need to look at payments made after that restart point.
6. we need to look at all bookings made after that restart point.
7. we need to look at booking made be before the rest point that have a delayed date that is after the restart point.

How do we find those bookings? We don't want have to look at every walk to find them so we need.

- against each payment we store the walk id of the oldest walk that was handled by that payment. So if we take the first payment after the restart point
