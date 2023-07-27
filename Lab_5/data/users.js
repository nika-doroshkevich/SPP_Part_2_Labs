const bcrypt = require('bcrypt');

const Users = [
    {
        email: "nika",
        password: bcrypt.hashSync("123", bcrypt.genSaltSync(10))
    },
    {
        email: "admin@tut.by",
        password: bcrypt.hashSync("123", bcrypt.genSaltSync(10))
    },
    {
        email: "veronika@mail.ru",
        password: bcrypt.hashSync("123", bcrypt.genSaltSync(10))
    },
    {
        email: "nika@mail.ru",
        password: bcrypt.hashSync("123", bcrypt.genSaltSync(10))
    }
];

module.exports = Users;
