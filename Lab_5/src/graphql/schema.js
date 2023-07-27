const { GraphQLSchema } = require('graphql');

const MainQueryType = require('./queries');
const MainMutationType = require('./mutations');

const MainSchema = new GraphQLSchema({
    query: MainQueryType,
    mutation: MainMutationType
});

module.exports = MainSchema;
