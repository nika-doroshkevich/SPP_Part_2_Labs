const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

require('dotenv').config();

const cookie_parser = require('cookie-parser');
const path = require('path');
const body_parser = require('body-parser');
const cors = require('cors');

const regRoute = require('./server/reg/reg');
const notesRoute = require('./server/notes/apinotes');

app.use(body_parser.urlencoded({extended: false}));
app.use(body_parser.json());
app.use(express.json());
app.use(cookie_parser());
app.use(cors());

app.use('', regRoute);
app.use('', notesRoute);

app.use(express.static(path.resolve(__dirname, 'client')));

app.get('*', (req, res) => {
    console.log("get page");
    res.sendFile(__dirname + "/client/index.html");
});

app.listen(PORT, () => {
    console.log("Server is started");
});