import React, { useState, useEffect } from 'react';
import { useStoreActions, useStoreState } from 'easy-peasy';
import TextField from '@material-ui/core/TextField';

import Logit from '../../../logit';
var logit = Logit('components/views/bookings/annotateBooking');

export function AnnotateBooking(props) {
  var { booking, closeAnno, isOpen } = props;
  // logit('opening?', booking, isOpen, dispatch, closeAnno);
  const { bookingId, annotation = '' } = booking || {};
  const index = useStoreState((s) => s.names);
  const annotateBooking = useStoreActions((a) => a.accountStatus.annotateBooking);
  const [note, setNote] = useState(annotation);
  useEffect(() => {
    setNote(annotation);
  }, [bookingId, annotation]);
  if (!isOpen || !booking) return null;
  const venue = index.get(booking.walkId).venue;
  const name = index.get(booking.memberId).shortName;

  // logit('props', props, { bookingId, name, venue, annotation });
  const save = () => {
    logit('about to distpatch', { note }, { bookingId, annotation: note });
    annotateBooking({ bookingId, annotation: note });
    closeAnno();
  };
  const change = (event) => setNote(event.target.value);

  return (
    <div className='logonX'>
      Annotate {name}
      {venue}
      {/* <input defaultValue={note} onChange={change} /> */}
      <button onClick={save}>Save</button>
      <button onClick={closeAnno}>Cancel</button>
      <div>
        <TextField
          multiline
          defaultValue={note}
          onChange={change}
          label={'Annotation: ' + name}
          variant='outlined'
        />
      </div>
    </div>
  );
}
