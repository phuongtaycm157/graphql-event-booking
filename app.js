require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const {
  graphqlHTTP
} = require('express-graphql');
const {
  buildSchema
} = require('graphql');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3000;

const Event = require('./models/event');

app.use(bodyParser.json());

app.use(
  '/graphql',
  graphqlHTTP({
    schema: buildSchema(`
      type Event {
        _id: ID!,
        title: String!,
        description: String!,
        price: Float!,
        date: String!
      }

      input EventInput {
        title: String!,
        description: String!,
        price: Float!,
        date: String!
      }

      type RootQuery {
        events: [Event!]!
      }

      type RootMutation {
        createEvent(eventInput: EventInput): Event
      }

      schema {
        query: RootQuery
        mutation: RootMutation
      }
    `),
    rootValue: {
      events: () => {
        return Event.find().then(events => {
          return events.map(event => {
            return {
              ...event._doc,
              _id: event._id
            }
          });
        }).catch(err => {
          throw err
        });
      },
      createEvent: args => {
        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price,
          date: new Date(args.eventInput.date)
        })
        return event.save().then(result => {
          console.log(result);
          return { ...result._doc, _id: result._doc._id.toString() };
        }).catch(err => {
          console.log(err);
          throw err;
        });
      }
    },
    graphiql: true
  })
);

app.get('/', (req, res, next) => {
  res.send('Hello World!');
});

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@nishi.t9fo8.gcp.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    app.listen(port, () => {
      console.log(`Server are running at port ${port}`);
    });
  })
  .catch(err => {
    console.log(err);
  });