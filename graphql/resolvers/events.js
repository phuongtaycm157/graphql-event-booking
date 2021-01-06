const Event = require('../../models/event');
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
      createdEvent = transformEvent(result);

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
  }
}