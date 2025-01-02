const express = require('express')
const cors = require('cors')
const { connectDB } = require('./dbConfig')
const { userRegistration, userAccountActivation, userLogin, userForgotPassword, userResetPassword } = require('./controller/AuthController')
const { createShortUrl, redirectToLongUrl, getDashboardStatistics, getAllUrlsForUser } = require('./controller/UrlController')
const { UserModel } = require('./models/UserModel')
const { verifyJwtToken } = require('./middleware/VerifyJwt')
const server = express()
const PORT = 3000

connectDB()

// Middleware and routes setup
server.use(express.json())
server.use(cors())

//Endpoint to fetch all users
server.get('/users', async (request, response) => {
    console.log("Request URL:", request.url)
    try {
        const result = await UserModel.find()
        response.status(200).json({
            message: "Registered users fetched successfully",
            data: result
        })
    } catch (error) {
        response.status(400).json({
            message: "Something went wrong",
            error: error.message,
        })
    }
})

//ROUTE HANDLERS
server.post('/registration', userRegistration)

server.post('/activation', userAccountActivation)

server.post('/login', userLogin)

server.post('/forgotpassword', userForgotPassword)

server.post('/resetpassword', userResetPassword)

server.use(verifyJwtToken)

// Create a new short URL
server.post('/shorten-url', createShortUrl)

// Redirect from short to long URL
server.get('/:shortUrl', redirectToLongUrl)

server.get('/all-urls', verifyJwtToken, getAllUrlsForUser)

server.use(verifyJwtToken)

server.get('/dashboard/statistics', verifyJwtToken, getDashboardStatistics)


// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})