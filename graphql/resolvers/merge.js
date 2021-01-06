const Event = require('../../models/event');
const User = require('../../models/user');

const { dateToString } = require('../../helpers/date');

const getEvents = async eventIds => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    return events.map(event => {
      return {
        ...event._doc,
        _id: event.id,
        date: dateToString(event._doc.date),
        creator: getUser.bind(this, event._doc.creator)
      }
    })
  } catch(err) {
    throw err;
  }
}

const getEvent = async eventId => {
  try {
    const event = await Event.findOne({ _id: eventId });
    return {
      ...event._doc,
      _id: event.id,
      creator: getUser.bind(this, event.creator)
    };
  } catch (err) {
    throw err;
  }
};

const getUser = async userId => {
  try {
    const userInfo = await User.findById(userId);
    user = userInfo._doc;
    return {
      _id: userInfo.id,
      email: user.email,
      password: null,
      createEvent: getEvents.bind(this, user.createEvent)
    }
  } catch (err) {
    throw err
  }
}

const transformEvent = event => {
  return {
    ...event._doc,
    _id: event.id,
    date: dateToString(event._doc.date),
    creator: getUser.bind(this, event._doc.creator)
  };
};

const transformBooking = booking => {
  return {
    ...booking._doc,
    _id: booking.id,
    event: getEvent.bind(this, booking._doc.event),
    user: getUser.bind(this, booking._doc.user),
    createdAt: dateToString(booking._doc.createdAt),
    updatedAt: dateToString(booking._doc.updatedAt)
  }
}

exports.transformBooking = transformBooking;
exports.transformEvent = transformEvent;