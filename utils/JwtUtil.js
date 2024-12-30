const jwt = require('jsonwebtoken')
require('dotenv').config();

function generateJwtToken(data = {}, SECRET_KEY = process.env.JWT_SECRET) {
    const token = jwt.sign(data, SECRET_KEY)
    return token
}

console.log(generateJwtToken())