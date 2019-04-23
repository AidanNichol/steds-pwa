/* global emit */
module.exports = {
  _id: '_design/walks',
  views: {
    incomplete: {
      map(doc) {
        if (doc.type == 'walk' && doc.closed && !doc.completed) {
          emit(doc._id, {
            venue: doc.venue,
            closed: doc.closed,
            completed: doc.completed
          });
        }
      }
    }
  }
};

// module.exports = ddoc;
