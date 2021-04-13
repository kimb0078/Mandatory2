const express = require('express')
require('./database/mongoose')
const router = require('./routers/routes')
const userLimiter = require('./middleware/rateLimiter')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const myDirectory = process.env.ROOT_DIRECTORY

const app = express()
const server = http.createServer(app)
const io = socketio(server);

app.use(express.static(path.join(myDirectory, 'public')))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(router)
app.use(userLimiter)

//Sends message when client connects
io.on('connection', socket => {

    socket.emit('message', 'Welcome to the chat!')

    //broadcasts to all users when user connects, except that user
    socket.broadcast.emit('message', 'A user has joined the chat')

    //Runs when a user disconnects
    socket.on('disconnect', () => {
        io.emit('message', 'A user has left the chat')
    })

    //Listen for chat message
    socket.on('chatMessage', msg => {
        io.emit(msg) //Broadcasts to all users
    })
})

const port = 3000 || process.env.PORT
server.listen(port, () => {
    console.log('Server is running on port ' + port)
})



