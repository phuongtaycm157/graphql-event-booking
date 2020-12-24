require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/', (req, res, next) => {
    res.send('Hello World!');
});

app.listen(port, () => {console.log(`Server are running at port ${port}`);});