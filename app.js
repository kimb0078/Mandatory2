const port = process.env.PORT
const express = require('express')
require('./database/mongoose')
const app = express()
const router = require('./routers/routes')
const userLimiter = require('./middleware/rateLimiter')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(router)
app.use(userLimiter)

app.listen(port, () => {
    console.log('Server is running on port ' + port)
})



