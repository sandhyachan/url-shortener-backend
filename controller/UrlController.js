const { UrlModel } = require('../models/UrlModel')
const shortid = require('shortid')
const jwt = require('jsonwebtoken');
const moment = require('moment'); 

// Controller to create a short URL
const createShortUrl = async (req, res) => {
    const { longUrl } = req.body

    if (!longUrl) {
        return res.status(400).json({ message: 'Please provide a long URL.' })
    }

    const urlRegex = /^(http|https):\/\/[^ "]+$/
    if (!urlRegex.test(longUrl)) {
        return res.status(400).json({ message: 'Invalid URL format!' })
    }

    try {
        const existingUrl = await UrlModel.findOne({ longUrl })
        if (existingUrl) {
            return res.status(200).json({
                message: 'Short URL already created!',
                shortUrl: `http://localhost:3000/${existingUrl.shortUrl}`,
            })
        }

        const shortUrl = shortid.generate()
        const newUrl = new UrlModel({
            longUrl,
            shortUrl,
            createdBy: req.user.userId, 
        })

        const savedUrl = await newUrl.save()

        return res.status(201).json({
            message: 'Short URL created successfully!',
            data: {
                longUrl: savedUrl.longUrl,
                shortUrl: `http://localhost:3000/${savedUrl.shortUrl}`,
            },
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: 'Something went wrong.', error: error.message })
    }
}

// Handle redirecting
const redirectToLongUrl = async (req, res) => {
    const { shortUrl } = req.params
    const token = req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
        return res.status(401).json({ message: 'Please log in.' })
    }

    try {
        // Verify the token
        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid or expired token.' })
            }

            // Attach decoded user information to request
            req.user = decoded

            const urlEntry = await UrlModel.findOne({ shortUrl })

            if (!urlEntry) {
                return res.status(404).json({ message: 'Short URL not found.' })
            }

            return res.redirect(urlEntry.longUrl) // Redirect to long URL
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: 'Something went wrong.', error: error.message })
    }
}

// Controller to get statistics about URLs created today and this month
const getDashboardStatistics = async (req, res) => {
  try {
    const userId = req.user.userId

    // Get the start of today and the start of this month
    const startOfToday = moment().startOf('day').toDate()
    const startOfThisMonth = moment().startOf('month').toDate()

    // Count URLs created today
    const urlsCreatedToday = await UrlModel.countDocuments({
      createdBy: userId,
      createdAt: { $gte: startOfToday },
    })

    // Count URLs created this month
    const urlsCreatedThisMonth = await UrlModel.countDocuments({
      createdBy: userId,
      createdAt: { $gte: startOfThisMonth },
    })

    // Return the statistics
    return res.status(200).json({
      urlsCreatedToday,
      urlsCreatedThisMonth,
    })
  } catch (error) {
    console.error('Error fetching statistics:', error)
    return res.status(500).json({ message: 'Failed to load statistics.', error: error.message })
  }
}

const getAllUrlsForUser = async (req, res) => {
    try {
      const userId = req.user.userId 
      
      // Find all URLs created by the user
      const urls = await UrlModel.find({ createdBy: userId }).sort({ createdAt: -1 })
  
      return res.status(200).json({
        message: 'URLs fetched successfully!',
        data: urls,
      })
    } catch (error) {
      console.error('Error fetching URLs:', error)
      return res.status(500).json({ message: 'Failed to load URLs.', error: error.message })
    }
  }


module.exports = {
    createShortUrl,
    redirectToLongUrl,
    getDashboardStatistics,
    getAllUrlsForUser
}
