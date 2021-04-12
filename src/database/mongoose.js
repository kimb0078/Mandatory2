const mongoose = require('mongoose')

mongoose.connect(process.env.DB_HOST, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).catch((error) => {
    console.log(error, 'Cannot connect')
})
