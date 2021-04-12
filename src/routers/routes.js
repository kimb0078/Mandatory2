const express = require('express')
const fs = require('fs')
const User = require('../models/user.js')
const auth = require('../middleware/auth.js')
const { sendWelcomeEmail } = require('../emails/account')
const router = new express.Router()
const myDirectory = process.env.ROOT_DIRECTORY


const header = fs.readFileSync(myDirectory + '/views/header.html'.toString())


//HTTP GET request to fetch login page, which is the home page
router.get("/", (req, res)=> {
        return res.send(header + `
        <body>
            <h1>Login</h1>
            <form action="/users/me" method="post">
                <label for="email">Email:</label><br>
                <input type="text" id="email" name="email"><br>
                <label for="password">Password:</label><br>
                <input type="password" id="password" name="password"><br>
                <input type="submit" value="Login"><br>
                <p>Don't have an account yet? </p>
                <a href="/signup" type="button">Create Account</a>
            </form>
        </body>
        </html>`)
})

//HTTP GET request to fetch signup page
router.get("/signup", (req, res)=> {
    return res.send(header + `<body>
        <form action="/users" method="POST">
            <label for="username">Username:</label> 
            <input type="text" id="username" name=username value="Anonymous"><br>
            <label for="email">E-mail address:</label> 
            <input type="text" id="email" name=email><br>
            <label for="password">Password</label> 
            <input type="text" id="password" name=password><br>
            <input type="submit" value="Submit">
        </form>
        </body>`)
})

//HTTP GET request to fetch signup page
router.get("/signup_successful", (req, res)=> {
    return res.send(header + `
        <h1> Your account has been successfully created!</h1>
    
        <a href="/">'Click here to login'<a/>`)
})
//HTTP POST request to create new user
router.post('/users', async (req, res) => {
    try {
        const user = new User(req.body)
        await user.generateAuthToken()
        await user.save()//Promise for what happens after a user is successfully saved
        await sendWelcomeEmail(user.username, user.email)

        res.status(201).redirect('/signup_successful')//Status code set to 201 "Created" and confirmation page is sent back
    }
    catch (e) { //If unsuccessful, HTTP status code is set to 400 "Bad Request" and error is sent back
        res.status(400).send(e)
    }
})



//HTTP POST request to login user
router.post('/users/me', async (req, res) => {
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()

        res.status(202).send(header +`
        <body>
            <h1>Profile</h1>
            <table>
                <tr>
                    <th>Username</th>
                    <td>${user.username}</td>
                </tr>
                <tr>
                    <th>E-mail</th>
                    <td>${user.email}</td>
                </tr>
            </table>
            <h3>Change Password:</h3>
            <form action="/users/me" method="PATCH">
                <label for="password">New Password:</label> 
                <input type="password" id="password" name=password><br>
                <input type="submit" value="Submit">
            </form>
        </body>
        </html>`)

    } catch (e) {
        res.status(400).send()
    }
})

//HTTP POST request to logout user - removes user's current token - only logs them out of current device
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })

        await req.user.save()
        res.send()

    } catch (e) {
        res.status(500).send()
    }
})



//HTTP POST request to logout user - removes all user's tokens - logged out on all devices
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [] //replaces tokens array with empty array
        await req.user.save()
        res.send()

    } catch (e) {
        res.status(500).send()
    }
})

//HTTP GET request to fetch user's profile from database with auth middleware
router.get('/users/me', auth, async (req, res)=> {

    const user = req.user

    return res.send(header + `
        <body>
            <table>
                <tr>
                    <th>Username</th>
                    <td>${user.username}</td>
                </tr>
                <tr>
                    <th>E-mail</th>
                    <td>${user.email}</td>
                </tr>
            </table>
            
            <h3>Change Password:</h3>
            <form action="/users/me" method="PATCH">
                <label for="password">New Password:</label> 
                <input type="password" id="password" name=password><br>
                <input type="submit" value="Submit">
            </form>
        </body>
        </html>`)

})

//HTTP PATCH/UPDATE request to reset user's password
router.patch('/users/me', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['password']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!'})
    }
    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    }
    catch (e) {
       res.status(400).send(e)
    }
})

//HTTP DELETE request to delete profile
router.delete('/users/me', auth, async (req, res) => {
    try {

        await req.user.remove() //remove() is a method from the mongoose document
        res.send(req.user)

    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router