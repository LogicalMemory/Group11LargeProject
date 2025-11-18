// Send email verification
// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs

function sendVerificationEmail(name, email, verificationToken, IsVerified) {
    const sgMail = require('@sendgrid/mail')
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)

    const msg = {
        to: email, // Change to your recipient
        from: 'loopu2025@gmail.com', // Change to your verified sender
        subject: 'LoopU: Verify Your Email',
        text: 'and easy to do anywhere, even with Node.js. Verification status: ${IsVerified}',
        html: `Hi ${name}!<br><br>Thanks for making a LoopU account!<br><br>Click <a href="https://nicholasfoutch.xyz/api/verify-email/${verificationToken}">here</a> to verify your email and get started with keeping connected with your campus.`,
    }
    sgMail
    .send(msg)
    .then(() => {
        console.log('Email sent')
    })
    .catch((error) => {
        console.error(error)
    })
}
module.exports = { sendVerificationEmail };

function followupVerification(email, IsVerified) {
    const msg = {
            to: email, // Change to your recipient
            from: 'loopu2025@gmail.com', // Change to your verified sender
            text: 'Verification status: ${IsVerified}',
        }
}