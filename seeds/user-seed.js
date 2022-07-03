const { User } = require("../models/user");

const userData = [
    {
        id: 1,
        username: "cannibalclarence",
        email: "cannibalclarence@gmail.com",
        password: "490783yrnfpweyf989342r89"
    },
    {
        id: 2,
        username: "anuka",
        email: "anuka@gmail.com",
        password: "490783yrnfpweyf989342r89"
    },
    {
        id: 3,
        username: "jose",
        email: "jose@gmail.com",
        password: "490783yrnfpweyf989342r89"
    }
]

const seedUser = () => User.bulkCreate(userData);
module.exports = seedUser;