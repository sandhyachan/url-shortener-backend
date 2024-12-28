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

        // Save activation code
        newUser.activationCode = activationCode
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

//User Account Activation
const userAccountActivation = async (req, res) => {
    const { activationCode } = req.body
    try {
        const user = await UserModel.findOne({ activationCode })
    
        //Check if user exists or the code is valid
        if(!user){
            return res.status(404).json({ message: 'Invalid activation code!'})
        }
    
        //Check if  account is already active
        if(user.accountStatus === 'active'){
            return res.status(400).json({ message: 'Account is already activated.' })
        }
    
        //Save account status
        user.accountStatus = 'active'
        user.activationCode = undefined
    
        //Save updated user
        await user.save()
        return res.status(200).json({ message: 'Account activation successful!' })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: 'Something went wrong during activation.', error: error.message })
    }

}

module.exports = { userRegistration, userAccountActivation }
