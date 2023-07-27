const {v4} = require('uuid');

class Note {
    constructor(id, title, description, createdDate) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.createdDate = createdDate;
    }
}

let notes = [];

notes.push(new Note(v4(), "Title 1", "Description 9", "2023-02-27"));
notes.push(new Note(v4(), "Title 2", "Description 2", "2023-02-28"));
notes.push(new Note(v4(), "Title 3", "Description 3", "2023-03-01"));
notes.push(new Note(v4(), "Title 4", "Description 4", "2023-03-01"));

module.exports = {notes: notes, filters: notes};