const mongoose = require('mongoose')

const connectDB = async (req, res) => {
    try {
        const connection = await mongoose.connect(
            "mongodb+srv://sandhyachan:Password123@cluster0.ahjkd.mongodb.net/ElysianShores?retryWrites=true&w=majority&appName=Cluster0", 
            { serverSelectionTimeoutMS: 30000 }
        )
        if(connection){
            console.log("DB Connection successful")
        } else {
            console.log("DB Connection could not be established")
        }
    } catch (error) {
        console.log("DB Connection error:", error.message
        )
    }

}

module.exports = { connectDB }