const express = require('express');
const router = express.Router();
let users = require('../../model/users');
const b_crypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/register', (req, res) => {
    let id = -1;
    id = users.findIndex(visitor => visitor.email === req.body.email);

    if (id >= 0) {
        res.status(409).json({
            message: "User with this email already exists."
        })
    } else {
        const salt = b_crypt.genSaltSync(10);
        const password = req.body.password;
        const user = {
            email: req.body.email,
            password: b_crypt.hashSync(password, salt)
        };

        users.push(user);
        console.log(users);
        res.status(201).json(user);
    }
});

router.post('/login', (req, res) => {
    let visitor_id = -1;
    visitor_id = users.findIndex(visitor => visitor.email === req.body.email);

    if (visitor_id >= 0) {
        const passwordEven = b_crypt.compareSync(req.body.password, users[visitor_id].password);
        if (passwordEven) {
            const token = jwt.sign({
                email: users[visitor_id].email
            }, process.env.SECRET_KEY, {expiresIn: 60 * 60});

            console.log("send cookie");
            res.status(200)
                .cookie('token',
                    'Bearer ' + token,
                    {
                        HttpOnly: true,
                        secure: false,
                    })
                .json({message_jwt: "jwt is created"});

        } else {
            res.status(401).json({message: "Passwords don't match."});
        }
    } else {
        res.status(404).json({message: "User with this email was not found."});
    }
});

module.exports = router;