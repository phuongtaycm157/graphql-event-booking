require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const {
    buildSchema
} = require('graphql');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.use(
    '/graphql',
    graphqlHTTP({
        schema: buildSchema(`
            type RootQuery {
                events: [String!]!
            }

            type RootMutation {
                createEvent(name: String): String
            }

            schema {
                query: RootQuery
                mutation: RootMutation
            }
        `),
        rootValue: {
            events: () => {
                return  ['Romantic Cooking', 'Sailing', 'All-Night Coding'];
            },
            createEvent: (args) => {
                const eventName = args.name;
                return eventName.toUpperCase();
            }
        },
        graphiql: true
    })
);

app.get('/', (req, res, next) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Server are running at port ${port}`);
});