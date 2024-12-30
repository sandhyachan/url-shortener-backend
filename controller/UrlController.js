const { UrlModel } = require('../models/UrlModel')
const shortid = require('shortid')

// Controller to create a short URL
const createShortUrl = async (req, res) => {
    const { longUrl } = req.body

    // Validate the long URL input
    if (!longUrl) {
        return res.status(400).json({ message: 'Please provide a long URL.' })
    }

    // Check if URL is valid
    const urlRegex = /^(http|https):\/\/[^ "]+$/
    if (!urlRegex.test(longUrl)) {
        return res.status(400).json({ message: 'Invalid URL format!' })
    }

    try {
        // Generate a unique short URL using shortid
        const shortUrl = shortid.generate()

        // Check if the short URL already exists
        const existingUrl = await UrlModel.findOne({ shortUrl })
        if (existingUrl) {
            return res.status(409).json({ message: 'Short URL collision detected, try again.' })
        }

        // Create a new URL entry in the database
        const newUrl = new UrlModel({
            longUrl,
            shortUrl,
            createdBy: req.user.userId
        })

        // Save the new URL entry
        const savedUrl = await newUrl.save()

        // Return the newly created short URL
        return res.status(201).json({
            message: 'Short URL created successfully!',
            data: {
                longUrl: savedUrl.longUrl,
                shortUrl: `http:localhost:3000/${savedUrl.shortUrl}`
            }
        })

    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: 'Something went wrong.', error: error.message })
    }
}

// Handle redirecting
const redirectToLongUrl = async (req, res) => {
    const { shortUrl } = req.params

    try {
        // Find the URL entry by short URL
        const urlEntry = await UrlModel.findOne({ shortUrl })

        if (!urlEntry) {
            return res.status(404).json({ message: 'Short URL not found.' })
        }

        // Redirect to the original long URL
        return res.redirect(urlEntry.longUrl)

    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: 'Something went wrong.', error: error.message })
    }
}

module.exports = {
    createShortUrl,
    redirectToLongUrl
}
