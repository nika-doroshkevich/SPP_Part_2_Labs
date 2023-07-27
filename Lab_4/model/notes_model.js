module.exports = class Note {
    id;
    title;
    description;
    createdDate;
    userIdNote;
    updatedDate;

    constructor(id, title, description, createdDate, userIdNote, updatedDate) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.createdDate = createdDate;
        this.userIdNote = userIdNote;
        this.updatedDate = updatedDate;
    }
};
