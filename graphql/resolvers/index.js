const event = require("../../models/event");
const auth = require("./auth");
const booking = require("./booking");
const events = require("./events");

module.exports = {
  ...events,
  ...booking,
  ...auth
}