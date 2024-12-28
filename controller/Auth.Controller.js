const { UserModel } = require("../model/User.Model")
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
require('dotenv').config()

const sendGridMail = require('@sendgrid/mail')

sendGridMail.setApiKey(process.env.SENDGRID_API_KEY)

//Generate a random activation code
const activateCode = () => {
    return crypto.randomBytes(6).toString('hex')
}

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

        const activationCode = activateCode()
        const codeExpiration = Date.now() + 3600000

        newUser.activationCode = activationCode
        newUser.codeExpiration = codeExpiration
        await newUser.save()


        const message = {
            to: email,
            from: 'honeycoupleart@gmail.com',
            subject: 'OpalShort Account Activation Request',
            text: `
            Hi ${firstName},

            Thanks for registering with OpalShort! To activate your account, please use the code below:

            Activation Code: ${activationCode}

            To activate:
            - Log in and enter the code.
            - Once entered, your account will be activated, and you can start using all our features.

            Need help?
            If you didn’t sign up for this account or need assistance, contact us at honeycoupleart@gmail.com.

            Thanks,
            The OpalShort Team
            `,
            html: `
            <html>
                <body>
                    <h4> Hi ${firstName}, </h4>
                    <p> Thanks for registering with <strong>OpalShort</strong>! To activate your account, please use the code below:</p>
                    <h3><strong>Activation Code: ${activationCode}</strong></h3>
                    <p><strong>To activate:</strong></p>
                    <ul>
                        <li>Log in and enter the code.</li>
                        <li>Once entered, your account will be activated, and you can start using all our features.</li>
                    </ul>
                    <p><strong>Need help?</strong></p>
                    <p>If you didn’t sign up for this account or need assistance, contact us at <a href="mailto:honeycoupleart@gmail.com">honeycoupleart@gmail.com</a>.</p>
                    <p>Thanks,<br>The <strong>OpalShort Team</strong></p>
                </body>
            </html>
            `
        }
        await sendGridMail.send(message)
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
