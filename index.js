const express = require('express')
const cors = require('cors')
const { connectDB } = require('./dbConfig')
const server = express()

connectDB()

// Middleware and routes setup
server.use(express.json())
server.use(cors())

// Start the server
server.listen(3000, () => {
    console.log("Server is running on http://localhost:3000")
})
