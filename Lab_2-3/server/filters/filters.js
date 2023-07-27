const express = require('express');
const filterRouter = express.Router();

let notes = require('../notes/apinotes');

filterRouter.post('/api/notes/sort', (req, res) => {

});

module.exports = filterRouter;

