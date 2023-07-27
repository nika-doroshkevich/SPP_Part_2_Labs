const express = require('express');
const notesRouter = express.Router();
const {v4} = require('uuid');

const auth = require('../middleware/auth');
let data = require('../../model/notes_model');

let notes = data.notes;
let filters = data.filters;

notesRouter.get('/api/notes', (req, res) => {
    res.status(200).json(filters);
});

notesRouter.post('/api/notes', auth, (req, res) => {
    console.log(req.body);
    const note = {...req.body, id: v4()};
    notes.push(note);
    res.status(201).json(note);
});

notesRouter.delete('/api/notes/:id', auth, (req, res) => {
    notes = notes.filter(note => note.id !== req.params.id);
    res.status(200).json({message: 'The note has been deleted.'});
});

notesRouter.put('/api/notes/:id', auth, (req, res) => {
    let id = notes.findIndex(note => note.id === req.params.id);
    data.notes[id] = req.body;
    res.status(200).json(notes[id]);
});

notesRouter.post('/api/notes/filter', (req, res) => {
    let filter = {...req.body};

    if (filter.firstValue > filter.secondValue) {
        let s = filter.firstValue;
        filter.firstValue = filter.secondValue;
        filter.secondValue = s;
        console.log('yes');
    }

    filters = filters.filter(pilot => pilot.createdDate >= filter.firstValue && pilot.createdDate <= filter.secondValue);

    switch (filter.sortParam) {
        case "Title":
            console.log("Title");
            filters.sort((a, b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0));
            break;

        case "Description":
            console.log("Description");
            filters.sort((a, b) => (a.description > b.description) ? 1 : ((b.description > a.description) ? -1 : 0));
            break;
    }
    res.status(200).json(filters);
});

module.exports = notesRouter;
