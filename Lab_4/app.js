const express = require('express');
const http = require('http');
const {v4} = require('uuid');
let WebSocketServer = require('ws');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

let noteClass = require('./model/notes_model');
let userClass = require('./model/users');

require('dotenv').config();


let mysql = require('mysql');
let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'spp_lab_4',
    password: '',
});

connection.connect(function (err) {
    if (err) {
        return console.error("Error: " + err.message);
    } else {
        console.log("Connection to MySQL server has been successfully established.");
    }
});

const app = express();
const server = http.createServer(app);

app.use(express.static('client'));

let webSocketServer = new WebSocketServer.Server({
    server
});

let notes = [];
let filters = [];
let users = [];

initialData();

let clients = {};
let appUserId = null;

webSocketServer.on('connection', function (ws) {
    let id = v4();
    clients[id] = ws;
    console.log('Client is connected: ' + id);
    init(id);

    ws.on('message', function (message) {

        console.log('new message has been received:');
        let data = JSON.parse(message);
        console.log(data);

        let noteReqData = {};
        let res = {};

        let date = new Date();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        if (month <= 9) {
            month = "0" + month;
        }
        if (day <= 9) {
            day = "0" + day;
        }

        let fullDate = date.getFullYear() + "-" + month + "-" + day;

        switch (data.type) {
            case "addNote": {
                if (auth(data.client.token)) {

                    let userIdNote = appUserId + 1;

                    const note = [v4(), data.messageData.title, data.messageData.description, fullDate, userIdNote, fullDate];
                    const sql = "INSERT INTO notes2(id, title, description, createdDate, userIdNote, updatedDate) VALUES(?, ?, ?, ?, ?, ?)";

                    connection.query(sql, note, function (err, results) {
                        if (err) console.log(err);
                        else console.log("Add SQL");
                    });

                    noteReqData = new noteClass(v4(), data.messageData.title, data.messageData.description,
                        fullDate, userIdNote, fullDate);

                    notes.push(noteReqData);
                    console.log(notes);

                    res.isDone = true;
                    res.resData = noteReqData;
                    res.public = true;

                } else {
                    res.isDone = false;
                }
                break;
            }

            case "putNote": {
                if (auth(data.client.token)) {

                    const note = [data.messageData.title, data.messageData.description, fullDate, data.messageData.id];
                    const sql = `UPDATE notes2 SET title=?, description=?, updatedDate=? WHERE id=?`;
                    connection.query(sql, note, function (err, results) {
                        if (err) console.log(err);
                        console.log("Updated SQL");
                    });

                    //let userIdNote = appUserId + 1;
                    noteReqData = new noteClass(data.messageData.id, data.messageData.title, data.messageData.description, data.messageData.createdDate, data.messageData.userIdNote, data.messageData.updatedDate);
                    let note_id = null;
                    note_id = notes.findIndex(note => note.id === noteReqData.id);
                    if (note_id !== -1) {
                        notes[note_id].title = noteReqData.title;
                        notes[note_id].description = noteReqData.description;
                        notes[note_id].createdDate = noteReqData.createdDate;
                        notes[note_id].userIdNote = data.messageData.userIdNote;
                        notes[note_id].updatedDate = noteReqData.updatedDate;

                        res.isDone = true;

                        res.resData = noteReqData;
                        res.public = true;
                    }
                } else {
                    res.isDone = false;
                }
                console.log(notes);
                break;
            }

            case "deleteNote": {
                if (auth(data.client.token)) {

                    const note = [data.messageData];
                    const sql = "DELETE FROM notes2 WHERE id=?";

                    connection.query(sql, note, function (err, results) {
                        if (err) console.log(err);
                        console.log("Deleted SQL");
                    });

                    notes = notes.filter(note => note.id !== data.messageData);

                    res.isDone = true;
                    res.resData = data.messageData;
                    res.public = true;
                } else {
                    res.isDone = false;
                }
                break;
            }

            case "filterNotes": {
                let firstValue = data.messageData.firstValue;
                let secondValue = data.messageData.secondValue;
                let sortValue = data.messageData.sortParam;

                let result = notes.filter(note => note.createdDate >= firstValue && note.createdDate <= secondValue);

                switch (sortValue) {
                    case "Title":
                        console.log("Title");
                        result.sort((a, b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0));
                        break;

                    case "Description":
                        console.log("Description");
                        result.sort((a, b) => (a.description > b.description) ? 1 : ((b.description > a.description) ? -1 : 0));
                        break;
                }

                res.public = false;
                res.resData = result;
                res.isDone = true;
                break;
            }

            case "register": {

                let userId = null;
                let id = -1;
                res.resData = {};
                id = users.findIndex(visitor => visitor.email === data.messageData.email);

                if (id >= 0) {
                    res.isDone = false;
                    res.resData.msg = "User with this email already exists";
                } else {
                    const salt = bcrypt.genSaltSync(10);
                    const password = data.messageData.password;
                    const user = new userClass(userId, data.messageData.email, bcrypt.hashSync(password, salt));

                    users.push(user);
                    console.log(users);

                    const userSQL = [data.messageData.email, data.messageData.password];
                    const sql = "INSERT INTO users2(email, password) VALUES(?, ?)";

                    connection.query(sql, userSQL, function (err, results) {
                        if (err) console.log(err);
                        else console.log("User added");
                    });

                    res.isDone = true;
                }

                res.public = false;
                break;
            }

            case "login": {
                res.resData = {};
                let visitor_id = -1;
                visitor_id = users.findIndex(visitor => visitor.email === data.messageData.email);

                if (visitor_id >= 0) {
                    const passwordEven = bcrypt.compareSync(data.messageData.password, users[visitor_id].password);
                    if (passwordEven) {
                        appUserId = visitor_id;
                        res.resData.token = jwt.sign({
                                email: users[visitor_id].email,
                            }
                            , process.env.SECRET_KEY, {expiresIn: 6000});
                        console.log("send cookie");
                        initNotes(appUserId);
                    } else {
                        res.resData.msg = "Passwords don't match";
                    }
                } else {
                    res.resData.msg = "User with this email was not found";
                }

                res.public = false;
                break;
            }

            case "logout": {
                notes = [];
                res.resData = {};
                let email = "";

                res.resData.token = jwt.sign({
                        email: email,
                    }
                    , process.env.SECRET_KEY, {expiresIn: 0});

                console.log("logout app " + res.resData.token);
                break;
            }
        }

        res.type = data.type;
        if (res.public === true) {

            res = JSON.stringify(res);

            console.log("to all");
            for (let key in clients) {
                clients[key].send(res);
            }
        } else {

            console.log("to one");
            res = JSON.stringify(res);
            clients[data.client.id].send(res);
        }
    });

    ws.on('close', function () {
        console.log('Connection closed ' + id);
        delete clients[id]
    });
});

function auth(token) {
    try {
        if (token === null) {
            console.log("no token");
            throw new Error();
        }

        console.log(token);
        const data = jwt.verify(token, process.env.SECRET_KEY);
        console.log(data);
        let id = -1;
        id = users.findIndex(user => user.email === data.email);

        if (id === -1) {
            console.log("no client");
            throw new Error();
        }

        console.log("is valid");
        return true;
    } catch (error) {
        console.log("Unauthorized");
        return false;
    }
}

function init(id) {
    let initData = {};
    initData.userID = id;
    initData.type = "initFront";
    initData.resData = notes;

    initData = JSON.stringify(initData);
    clients[id].send(initData);
}

function initialData() {
    console.log("initialisation");

    /*users.push(new userClass(null,"veronika@mail.ru", bcrypt.hashSync("1234", bcrypt.genSaltSync(10))));
    users.push(new userClass(null,"nika@mail.ru", bcrypt.hashSync("12345", bcrypt.genSaltSync(10))));*/

    connection.query("SELECT * FROM users2",
        function (err, results, fields) {
            results.forEach(function (user) {
                users.push(new userClass(user.userID, user.email, bcrypt.hashSync(user.password, bcrypt.genSaltSync(10))));
            });
        });

    console.log("Users Init" + users);

    /*notes.push(new noteClass(v4(), "Title 1", "Desc1", "2023-02-27"));
    notes.push(new noteClass(v4(), "Title 2", "Desc2", "2023-02-28"));
    notes.push(new noteClass(v4(), "Title 3", "Desc3", "2023-03-01"));
    notes.push(new noteClass(v4(), "Title 4", "Desc4", "2023-03-01"));*/
}

function initNotes(userId) {
    userId = userId + 1;
    const userIdNote = [userId];
    connection.query("SELECT * FROM notes2 WHERE userIdNote = ?", userIdNote,
        function (err, results, fields) {
            results.forEach(function (note) {
                notes.push(new noteClass(note.id, note.title, note.description,
                    note.createdDate, note.userIdNote, note.updatedDate));
            });
        });
}

function checkInit() {
    console.log("Users check" + users);
    users.forEach(function (user) {
        console.log("user " + user);
    });
}

server.listen(process.env.PORT || 4000, () => {
    console.log(`Server started on port ${server.address().port}`);
});