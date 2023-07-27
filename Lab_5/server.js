const express = require('express');
const graphqlHTTP = require('express-graphql');
const schema = require('./src/graphql/schema.js');
const bodyParser = require('body-parser');
const path = require('path');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const PORT = process.env.PORT || 3000;
const app = express();


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());

app.use(express.static(path.resolve(__dirname, 'client')));

//app.get('*', (req, res) => {
//    console.log("get page");
//    res.sendFile(__dirname + "/client/index.html");
//});
const addUser = async (req) => {
    req.next();
};

app.use('/', bodyParser.json(), addUser, graphqlHTTP((req,response, graphQLParams) => ({
    schema: schema,
    graphiql: true,
    context:{
        user: req.headers,
    }
})));


app.listen(PORT, ()=>{
    console.log('GraphQL APIz Server up and running at localhost:' + PORT);
});
