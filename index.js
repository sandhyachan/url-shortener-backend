const express = require('express')
const cors = require('cors')
const { connectDB } = require('./dbConfig')
const { userRegistration, userAccountActivation } = require('./controller/AuthController')
const { UserModel } = require('./model/UserModel')
const server = express()
const PORT = 3004

connectDB()

// Middleware and routes setup
server.use(express.json())
server.use(cors())

//ROUTE HANDLERS
server.post('/registration', userRegistration)

server.post('/activation', userAccountActivation)

//Endpoint to fetch all users
server.get('/users', async (request, response) => {
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

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})
