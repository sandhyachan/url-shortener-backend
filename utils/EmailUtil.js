const sendGridMail = require('@sendgrid/mail')
require('dotenv').config()

// Set the SendGrid API key
sendGridMail.setApiKey(process.env.SENDGRID_API_KEY)

// Activation email function
const sendActivationEmail = async (email, firstName, activationCode) => {
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
                    <h4>Hi ${firstName},</h4>
                    <p>Thanks for registering with <strong>OpalShort</strong>! To activate your account, please use the code below:</p>
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
}

module.exports = { sendActivationEmail }