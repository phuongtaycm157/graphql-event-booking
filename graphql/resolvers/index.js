const bcrypt = require('bcrypt');

const Event = require('../../models/event');
const User = require('../../models/user');
const Booking = require('../../models/booking');

const getEvents = async eventIds => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    return events.map(event => {
      return {
        ...event._doc,
        _id: event.id,
        date: new Date(event._doc.date).toISOString(),
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

module.exports = {
  events: async () => {
    try {
      const events = await Event.find();
      return events.map(event => {
        return {
          ...event._doc,
          _id: event._id,
          creator: getUser.bind(this, event._doc.creator)
        }
      });
    } catch (err) {
      throw err
    };
  },
  bookings: async () => {
    try {
      const bookings = await Booking.find();
      return bookings.map(booking => {
        return {
          ...booking._doc,
          _id: booking.id,
          event: getEvent.bind(this, booking._doc.event),
          user: getUser.bind(this, booking._doc.user),
          createdAt: new Date(booking._doc.createdAt).toISOString(),
          updatedAt: new Date(booking._doc.updatedAt).toISOString()
        };
      });
    } catch (err) {
      throw err;
    }
  },
  createEvent: async args => {
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator:"5fec5ba08c334f163ce649b3"
    })
    let createdEvent;
    try {
      const result = await event.save()
      createdEvent = {
        ...result._doc,
        _id: result._doc._id.toString(),
        date: new Date(event._doc.date).toISOString(),
        creator: getUser.bind(this, result._doc.creator)
      };

      const user = await User.findById('5fec5ba08c334f163ce649b3');
      if (!user) {
        throw new Error('User doesn\'t exit!')
      }

      user.createEvent.push(createdEvent._id)
      await user.save();

      return createdEvent;
    } catch (err) {
      console.log(err);
      throw err;
    };
  },
  createUser: async args => {
    try {
      const userAlready = await User.findOne({
        email: args.userInput.email
      });
      if (userAlready) {
        throw new Error('User exits already!')
      }

      const hashPassword = await bcrypt.hash(args.userInput.password, 12);
      const user = new User({
        email: args.userInput.email,
        password: hashPassword
      });

      const result = await user.save();
      return {
        ...result._doc,
        password: null,
        _id: result.id,
        createEvent: getEvents(result._doc.createEvent)
      };
    } catch (err) {
      throw err;
    }
  },
  bookEvent: async args => {
    try {
      const fetchedEvent = await Event.findOne({ _id: args.eventId});
      const booking = new Booking({
        event: fetchedEvent.id,
        user: '5fec5ba08c334f163ce649b3',
      })
      const result = await booking.save();
      return {
        _id: result.id,
        user: getUser.bind(this, result._doc.user),
        event: getEvent.bind(this, result._doc.event),
        createdAt: new Date(result._doc.createdAt).toISOString(),
        updatedAt: new Date(result._doc.updatedAt).toISOString()
      }
    } catch (err) {
      throw err;
    }
  },
  cancelBooking: async args => {
    try {
      const booking = await Booking.findById(args.bookingId).populate('event');
      const event = new Event({
        ...booking.event._doc,
        _id: booking.event.id,
        creator: getUser.bind(this, booking.event._doc.creator)
      });
      await booking.deleteOne({ _id: args.bookingId });
      return event;
    } catch (err) {
      throw err;
    }
  }
}