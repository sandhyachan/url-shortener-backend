const { UserModel } = require("../model/User.Model")
const bcrypt = require('bcryptjs')

// User sign up function
const userRegistration = async (request, response) => {
    const { email, password, firstName, lastName, phoneNumber } = request.body

    // Check if all required fields are provided
    if (!email || !password || !firstName || !lastName || !phoneNumber) {
        return response.status(400).json({
            message: "Please enter all the required fields."
        })
    }
    // Password validation
    if (password.length < 8) {
        return response.status(400).json({
            message: "Password length must be at least 8 characters!"
        })
    }

    try {
        const emailExists = await UserModel.findOne({email})
        //Check if email already exists
        if(emailExists){
            return response.status(409).json({
                message: "Account already exists. Please log in to your account."
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        // Create a new user
        const newUser = new UserModel({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phoneNumber
        })
        
        const result = await newUser.save()
        //Activation mail---
        return response.status(201).json({
            message: "Account created successfully. Please check your email to activate your account.",
            data: result
        })
        
    } catch (error) {
        console.error(error)
        response.status(500).json({
            message: "Something went wrong",
            error: error.message
        })
    }
}

module.exports = { userRegistration }
