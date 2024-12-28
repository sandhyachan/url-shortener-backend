const mongoose = require('mongoose')

//User Model Schema
const UserSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: false
    },
    activationCode: { 
        type: String, 
        required: false 
    },
    codeExpiration: { 
        type: Date, 
        required: false 
    },
})

const UserModel = mongoose.model('users', UserSchema)

module.exports = { UserModel }