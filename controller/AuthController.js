const { UserModel } = require('../model/UserModel')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const { sendActivationEmail } = require('../utils/EmailUtil')

// Generate random activation code
const generateActivationCode = () => {
    return crypto.randomBytes(3).toString('hex')
}

// User Registration function
const userRegistration = async (req, res) => {
    const { email, password, firstName, lastName, phoneNumber } = req.body

    // Validate the input fields
    if (!email || !password || !firstName || !lastName || !phoneNumber) {
        return res.status(400).json({
            message: "Please enter all the required fields."
        })
    }

    // Validate password length
    if (password.length < 8) {
        return res.status(400).json({
            message: "Password length must be at least 8 characters!"
        })
    }

    try {
        // Check if the email already exists in the database
        const emailExists = await UserModel.findOne({ email })
        if (emailExists) {
            return res.status(409).json({
                message: "Account already exists. Please log in to your account."
            })
        }

        // Hash the password before saving it
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create a new user
        const newUser = new UserModel({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phoneNumber
        })

        // Save the user to the database
        const result = await newUser.save()

        const activationCode = generateActivationCode()
        const codeExpiration = Date.now() + 3600000 // 1 hour expiration

        // Save activation code and expiration time
        newUser.activationCode = activationCode
        newUser.codeExpiration = codeExpiration
        await newUser.save()

        // Send activation email to the user
        await sendActivationEmail(email, firstName, activationCode)

        return res.status(201).json({
            message: "Account created successfully. Please check your email to activate your account.",
            data: result
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: "Something went wrong",
            error: error.message
        })
    }
}

module.exports = { userRegistration, userAccountActivation }
