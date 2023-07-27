const { GraphQLList, GraphQLObjectType } = require('graphql');

const { SportsmanType, UserType } = require('./types.js');
let Sportsmans = require('../../data/sportsmans');
let Users = require('../../data/users');

const MainQueryType = new GraphQLObjectType({
    name: 'MainQueryType',
    description: 'Query Schema for MainType',
    fields: {
        sportsmans: {
            type: new GraphQLList(SportsmanType),
            resolve: () => Sportsmans
        },
        users: {
            type: new GraphQLList(UserType),
            resolve: () => Users
        }
    }
});

module.exports = MainQueryType;
