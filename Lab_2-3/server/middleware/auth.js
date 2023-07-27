const jwt = require('jsonwebtoken');
const users = require('../../model/users');

const auth = (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            console.log("no token");
            throw new Error();
        }

        let token = req.headers.authorization.replace('Bearer ', '');
        console.log("---token:  " + token);

        const data = jwt.verify(token, process.env.SECRET_KEY, {HttpOnly: true});
        console.log(data);
        let id = -1;
        id = users.findIndex(user => user.email === data.email);


        if (id === -1) {
            console.log("no client");
            throw new Error();
        }

        req.user = users[id];
        req.token = token;
        console.log("is valid");
        next()
    } catch (error) {
        console.log("Unauthorized");
        res.status(401).json({message: "Unauthorized user"})
    }
};

module.exports = auth;