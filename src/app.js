const express = require('express');
const app = express();

app.use(express.json());

const availableTimes = require('./routes/availableTimes');

app.use('/availableTimes', availableTimes);

app.get('/', (req,res) => {
    response.send();
});

module.exports = app;