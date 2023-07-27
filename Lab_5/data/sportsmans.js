const {v4} = require('uuid');

const Sportsmans = [
    {
        id: v4(),
        name: "Dina Averina",
        country: "Russia",
        podiums: 202,
        champion_wins: 120
    },
    {
        id: v4(),
        name: "Arina Averina",
        country: "Russia",
        podiums: 100,
        champion_wins: 40
    },
    {
        id: v4(),
        name: "Melitina Staniouta",
        country: "Belarus",
        podiums: 41,
        champion_wins: 3
    },
    {
        id: v4(),
        name: "Ekateryna Galkina",
        country: "Belarus",
        podiums: 20,
        champion_wins: 0
    }
];

module.exports = Sportsmans;
