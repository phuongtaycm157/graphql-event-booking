require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3000;

const graphQlSchema = require('./graphql/schema/index')
const graphQlResolve = require('./graphql/resolvers/index')

app.use(bodyParser.json());

app.use(
  '/graphql',
  graphqlHTTP({
    schema: graphQlSchema,
    rootValue: graphQlResolve,
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