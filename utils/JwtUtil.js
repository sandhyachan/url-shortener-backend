const jwt = require('jsonwebtoken')
require('dotenv').config()

/**
 * Function to generate a JWT token
 * @param {Object} data - The payload for the token
 * @param {String} SECRET_KEY - The secret key for signing the JWT
 * @param {String} expiresIn - Token expiration time (default: 5 hours)
 * @returns {String} - The generated JWT token
 */

function generateJwtToken(data = {}, SECRET_KEY = process.env.JWT_SECRET, expiresIn = '5h') {
    const token = jwt.sign(data, SECRET_KEY, { expiresIn })
    return token
}

module.exports = { generateJwtToken }