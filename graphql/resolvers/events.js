const Event = require('../../models/event');
const User = require('../../models/user');
const { transformEvent } = require('./merge');

module.exports = {
  // Query Event
  events: async () => {
    try {
      const events = await Event.find();
      return events.map(event => {
        return transformEvent(event);
      });
    } catch (err) {
      throw err
    };
  },
  // Mutation Event
  createEvent: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: req.userId
    })
    try {
      const result = await event.save();
      console.log(result);
      let createdEvent = transformEvent(result);

      const user = await User.findById(req.userId);
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
  }
}