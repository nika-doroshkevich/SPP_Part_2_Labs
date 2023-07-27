const {v4} = require('uuid');
const _ = require('lodash');
const { GraphQLNonNull, GraphQLObjectType, GraphQLList, GraphQLString } = require('graphql');
const b_crypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const {
    UserType,
    UserRegType,
    UserLogType,
    SportsmanType,
    SportsmanCreateType,
    SportsmanDeleteType,
    SportsmanUpdateType,
    SportsmanSortType,
    MessageType
} = require('./types.js');

let Sportsmans = require('../../data/sportsmans');
let Users = require('../../data/users');

function auth(headers) {
    if (headers.authorization){
        let token = headers.authorization;
        let user = jwt.verify(token, 'SECRET_KEY');
        console.log(user);
        if (user){
            return true;
        }else
        {
            return false;
        }
    }else {
        return false;
    }
}

const MainMutationType = new GraphQLObjectType({
    name: 'MainMutationType',
    description: 'Mutations for MainType',
    fields: {
        createSportsman: {
            type: SportsmanType,
            args: {
                input: { type: new GraphQLNonNull(SportsmanCreateType) }
            },

            resolve: (source, { input }, context) => {
                //console.log(req.headers.authorization);
                //req.status.json()
                //console.log(context.user);
                if (auth(context.user)) {
                    let sportsman = [];
                    sportsman.id = v4();
                    sportsman.name = input.name;
                    sportsman.country = input.country;
                    sportsman.podiums = input.podiums;
                    sportsman.champion_wins = input.champion_wins;
                    Sportsmans.push(sportsman);
                    return sportsman;
                }else {
                    return null;
                }
            }
        },

        deleteSportsman: {
            type: SportsmanType,
            args: {
                input: {type: new GraphQLNonNull(SportsmanDeleteType) }
            },
            resolve: (source, { input }, context) => {
                //console.log(req.headers.authorization);
                //console.log(input);
                if (auth(context.user)) {
                    let deleteSportsman = _.remove(Sportsmans, sportsman => sportsman.id === input.id);
                    return input;
                }else{
                    return null;
                }

            }
        },

        updateSportsman: {
            type: SportsmanType,
            args: {
                input: {type: new GraphQLNonNull(SportsmanUpdateType) }
            },
            resolve: (source, { input }, context) => {
               // console.log(req.headers.authorization);
                if (auth(context.user)) {
                    let sportsmanId = -1;

                    sportsmanId = Sportsmans.findIndex(sportsman => sportsman.id === input.id);
                    if (sportsmanId > -1) {
                        Sportsmans[sportsmanId].name = input.name;
                        Sportsmans[sportsmanId].country = input.country;
                        Sportsmans[sportsmanId].podiums = input.podiums;
                        Sportsmans[sportsmanId].champion_wins = input.champion_wins;
                    }

                    return Sportsmans[sportsmanId];
                }else{
                    return null;
                }
            }
        },

        sortSportsmans: {
            type: new GraphQLList(SportsmanType),
            args: {
                input: {type: new GraphQLNonNull(SportsmanSortType)}
            },
            resolve: (source, { input }) => {
                let sportsmans;// = Sportsmans;

                if (input.countryFilter.length === 0){
                    sportsmans = Sportsmans;
                }else{
                    sportsmans = Sportsmans.filter(sportsman => sportsman.country === input.countryFilter);
                }

                sportsmans = sportsmans.filter(sportsman => sportsman.podiums >= input.firstValue && sportsman.podiums <= input.secondValue);

                switch (input.sortParam) {
                    case "Name": {
                        sportsmans.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
                        break;
                    }
                    case "Country": {
                        sportsmans.sort((a,b) => (a.country > b.country) ? 1 : ((b.country > a.country) ? -1 : 0));
                        break;
                    }
                    case "Podiums": {
                        sportsmans.sort((a,b) => (a.podiums > b.podiums) ? -1 : ((b.podiums > a.podiums) ? 1 : 0));
                        break;
                    }
                    case "Champion wins": {
                        sportsmans.sort((a,b) => (a.champion_wins > b.champion_wins) ? -1 : ((b.champion_wins > a.champion_wins) ? 1 : 0));
                        break;
                    }
                }

                return sportsmans;
            }
        },

        registerUser: {
            type: MessageType,
            args: {
                input: {type: new GraphQLNonNull(UserRegType)}
            },
            resolve:(source, { input }) =>{
                let message = {};
                let id = -1;

                id = Users.findIndex(visitor => visitor.email === input.email);

                if (id >= 0){
                    message.message = "User with this email already exists"
                    //return "User with this email already exists"
                } else {
                    const salt = b_crypt.genSaltSync(10);
                    const password = input.password;
                    const user = {
                        email: input.email,
                        password: b_crypt.hashSync(password, salt)
                    };

                    Users.push(user);
                    //console.log(Users);

                    //message.message ="The User was registered"
                }

                return message;
            }
        },

        loginUser: {
            type: MessageType,
            args: {
                input: {type: new GraphQLNonNull(UserRegType)}
            },
            resolve: (source, { input })=>{
                let visitor_id = -1;
                let res = {};
                visitor_id = Users.findIndex(visitor => visitor.email === input.email);

                if (visitor_id >= 0){
                    const passwordEven = b_crypt.compareSync(input.password, Users[visitor_id].password);
                    if (passwordEven){
                        const token = jwt.sign({
                            email: Users[visitor_id].email
                        }, 'SECRET_KEY', {expiresIn: 60*60});

                        //console.log(token);
                        //res.message = "Token was create";
                        res.token = token;
                    }else{
                        res.message = "Passwords don't match";
                    }
                }else{
                    res.message = "User with this email was not found";
                }

                return res;
            }
        }
    }
});

module.exports = MainMutationType;
