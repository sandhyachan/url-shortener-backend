const mongoose = require('mongoose')

// URL Schema
const UrlSchema = mongoose.Schema({
    longUrl: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                // URL validation
                const regex = /^(http|https):\/\/[^ "]+$/;
                return regex.test(v);
            },
            message: 'Invalid URL format!'
        }
    },
    shortUrl: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users', 
        required: true
    }
}, { timestamps: true })

const UrlModel = mongoose.model('url', UrlSchema)

module.exports = { UrlModel }