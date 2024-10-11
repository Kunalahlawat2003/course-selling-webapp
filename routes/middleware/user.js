const jwt = require("jsonwebtoken");
const {jwtuserpass} = require("../../config");

function userMiddleware(req, res, next) {
    const token = req.headers.token;
    const decoded = jwt.verify(token, jwtuserpass);

    if (decoded) {
        req.userId = decoded.id;
        next()
    } else {
        res.status(403).json({
            message: "You are not signed in"
        })
    }

}

module.exports = {
    userMiddleware: userMiddleware
}