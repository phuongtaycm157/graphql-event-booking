const Booking = require('../../models/booking');
const Event = require('../../models/event');
const { transformEvent, transformBooking } = require('./merge');

module.exports = {
  // Query Booking
  bookings: async () => {
    try {
      const bookings = await Booking.find();
      return bookings.map(booking => {
        return transformBooking(booking);
      });
    } catch (err) {
      throw err;
    }
  },
  // Mutation Booking
  bookEvent: async args => {
    try {
      const fetchedEvent = await Event.findOne({ _id: args.eventId});
      const booking = new Booking({
        event: fetchedEvent.id,
        user: '5fec5ba08c334f163ce649b3',
      })
      const result = await booking.save();
      return transformBooking(result);
    } catch (err) {
      throw err;
    }
  },
  cancelBooking: async args => {
    try {
      const booking = await Booking.findById(args.bookingId).populate('event');
      const event = transformEvent(booking.event);
      await booking.deleteOne({ _id: args.bookingId });
      return event;
    } catch (err) {
      throw err;
    }
  }
}