const nodemailer = require("nodemailer")
const User = require('../models/user.js')


const sendWelcomeEmail = async (username, userEmail)=> {
    let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"Kimberly" <kimb0078@stud.kea.dk>', // sender address
        to: userEmail, // list of receivers
        subject: "Your account is created ✔", // Subject line
        text: `Signup was successful! Welcome to the Chat App, ${username}`
    });

    console.log("Message sent: %s", info.messageId)
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info))
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

//send().catch(console.error)

module.exports = {
    sendWelcomeEmail
}