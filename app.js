require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const app = express();
const port = process.env.PORT || 3000;

const Event = require('./models/event');
const User = require('./models/user');

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

      type User {
        _id: ID!
        email: String!
        password: String
      }

      input EventInput {
        title: String!,
        description: String!,
        price: Float!,
        date: String!
      }

      input UserInput {
        email: String!,
        password: String!
      }

      type RootQuery {
        events: [Event!]!
      }

      type RootMutation {
        createEvent(eventInput: EventInput): Event
        createUser(userInput: UserInput): User
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
          date: new Date(args.eventInput.date),
          creator:"5fec5ba08c334f163ce649b3"
        })
        let createdEvent;
        return event.save()
          .then(result => {
            createdEvent = { ...result._doc, _id: result._doc._id.toString() };
            return User.findById('5fec5ba08c334f163ce649b3');
          })
          .then(user => {
            if (!user) {
              throw new Error('User doesn\'t exit!')
            }
            user.createEvent.push(createdEvent._id)
            return user.save()
          })
          .then(result => createdEvent)
          .catch(err => {
            console.log(err);
            throw err;
          });
      },
      createUser: args => {
        return User.findOne({email: args.userInput.email})
          .then(user => {
            if (user) {
              throw new Error('User exits already!')
            }
            return bcrypt.hash(args.userInput.password, 12)
          })
          .then(hashPassword => {
            const user = new User({
              email: args.userInput.email,
              password: hashPassword
            });
            return user.save()
          })
          .then(result => {
            return { ...result._doc, password: null, _id: result.id };
          })
          .catch(err => {
            throw err;
          })
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