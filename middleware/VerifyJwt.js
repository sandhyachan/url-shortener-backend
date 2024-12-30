const jwt = require('jsonwebtoken')
require('dotenv').config()

function verifyJwtToken(req, res, next) {
    const token = req.header('Authorization')?.replace('Bearer', '')

    if(!token){
        return res.status(401).json({ message: 'Please log in.'})
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if(err){
            return res.status(403).json({ message: 'Invalid or expired token.' })
        }
        req.user = decoded
        next()
    })
}

module.exports = { verifyJwtToken }