module.exports = class User {
    userId;
    email;
    password;

    constructor(userId, email, password) {
        this.userId = userId;
        this.email = email;
        this.password = password;
    }
};