const {
    GraphQLString,
    GraphQLInt,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLInputObjectType
} = require('graphql');

const MessageType = new GraphQLObjectType({
    name: 'MessageType',
    description: 'Return messages',
    fields: {
        message: { type: GraphQLString },
        token: { type: GraphQLString }
    }
});

const UserType = new GraphQLObjectType({
    name: 'UserType',
    description: 'User list',
    fields: {
        email: { type: GraphQLString },
        password: { type: GraphQLString }
    }
});

const UserRegType = new GraphQLInputObjectType({
    name: 'UseAddType',
    description: 'User add to list',
    fields: {
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
    }
});

const UserLogType = new GraphQLInputObjectType({
    name: 'UseAddType',
    description: 'User add to list',
    fields: {
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
    }
});

const SportsmanType = new GraphQLObjectType({
    name: 'SportsmanType',
    description: 'Sportsman list',
    fields: {
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        country: { type: GraphQLString },
        podiums: { type: GraphQLInt },
        champion_wins: {type: GraphQLInt }
    }
});

const SportsmanCreateType = new GraphQLInputObjectType({
   name: 'SportsmanCreateType',
   description: 'Add sportsman to the list',
   type: SportsmanType,
   fields: {
       name: { type: new GraphQLNonNull(GraphQLString) },
       country: { type: new GraphQLNonNull(GraphQLString) },
       podiums: { type: new GraphQLNonNull(GraphQLInt) },
       champion_wins: { type: GraphQLNonNull(GraphQLInt) }
   }
});

const SportsmanDeleteType = new GraphQLInputObjectType({
    name: 'SportsmanDeleteType',
    description: 'Delete sportsman from the list',
    type: SportsmanType,
    fields: {
        id: { type: new GraphQLNonNull(GraphQLString) }
    }
});

const SportsmanUpdateType = new GraphQLInputObjectType({
    name: 'SportsmanUpdateType',
    description: 'Update sportsman from the list',
    type: SportsmanType,
    fields: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        country: { type: new GraphQLNonNull(GraphQLString) },
        podiums: { type: new GraphQLNonNull(GraphQLInt) },
        champion_wins: {type: new GraphQLNonNull(GraphQLInt) }
    }
});

const SportsmanSortType = new GraphQLInputObjectType({
    name: 'SportsmanSortType',
    description: 'Sort sportsman from the list',
    type: SportsmanType,
    fields: {
        sortParam: { type: new GraphQLNonNull(GraphQLString) },
        countryFilter: {type: new GraphQLNonNull(GraphQLString) },
        firstValue: { type: new GraphQLNonNull(GraphQLInt) },
        secondValue: { type: new GraphQLNonNull(GraphQLInt) }
    }
});

module.exports = { SportsmanType: SportsmanType, SportsmanCreateType, SportsmanDeleteType, SportsmanUpdateType, SportsmanSortType, UserType, UserRegType, UserLogType, MessageType };
