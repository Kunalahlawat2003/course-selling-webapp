require('dotenv').config();

const jwtuserpass = process.env.JWT_USERSECRET;
const jwtadminpass = process.env.JWT_ADMINSECRET;

module.exports = {
    jwtadminpass,
    jwtuserpass
}