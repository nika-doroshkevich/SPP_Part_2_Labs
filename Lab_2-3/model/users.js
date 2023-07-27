const {v4} = require('uuid');
const bcrypt = require('bcrypt');

class User {
    constructor(email, password) {
        this.email = email;
        this.password = password;
    }
}

let users = [];
users.push(new User("veronika@mail.ru", bcrypt.hashSync("12343210", bcrypt.genSaltSync(10))));
users.push(new User("123@mail.ru", bcrypt.hashSync("12345678", bcrypt.genSaltSync(10))));

module.exports = users;