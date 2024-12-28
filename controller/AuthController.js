const { UserModel } = require('../model/UserModel')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const { sendActivationEmail, sendPasswordResetEmail } = require('../utils/EmailUtil')

// Generate random activation code
const generateActivationCode = () => {
    return crypto.randomBytes(3).toString('hex')
}

//Generate random reset token
const generateResetToken = () => {
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

//User Login Function
const userLogin = async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({
            message: "Bad Credentials"
        })
    }
    try {
        const userExist = await UserModel.findOne({ email })

        //Check if user exists
        if (!userExist) {
            return res.status(404).json({
                message: "Account not found"
            })
        }

        //Check if user's account status is active
        if (userExist.accountStatus === 'inactive') {
            return res.status(403).json({
                message: "Please activate your account. Check your email for the activation code."
            })
        }

        //Check if the password is valid
        const isPasswordValid = await bcrypt.compare(password, userExist.password)
        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Bad Credentials"
            })
        }
        return res.status(200).json({
            message: "Login successful"
        })

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: "Something went wrong",
            error: error.message
        })
    }
}

// Forgot password function
const forgotPassword = async (req, res) => {
    const { email } = req.body

    // Check if user exists
    const user = await UserModel.findOne({ email })
    if (!user) {
        return res.status(404).json({ message: 'Account not found!' })
    }

    // Generate reset token and set expiration
    const resetToken = generateResetToken()
    const tokenExpiration = Date.now() + 3600000  // Token expires in 1 hour

    user.resetToken = resetToken
    user.tokenExpiration = tokenExpiration
    await user.save()

    try {
        // Send password reset email
        await sendPasswordResetEmail(email, resetToken)

        return res.status(200).json({ message: 'Password reset email sent!' })
    } catch (error) {
        console.error('Error sending email:', error.res ? error.res.body : error.message)
        return res.status(500).json({
            message: 'Failed to send reset email. Please try again later.',
            error: error.res ? error.res.body : error.message,
        })
    }
}

module.exports = { userRegistration, userAccountActivation, userLogin, forgotPassword }
