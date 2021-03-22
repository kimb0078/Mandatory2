const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

//Model to create new user with Username, email and password
const userSchema = new mongoose.Schema({
    username:{
        type: String,
        default: 'Anonymous',
        maxlength: [20, 'Username too long']
    },
    email: {
        type: String,
        required: [true, 'E-mail address required.'],
        unique: true,
        trim: true,
        lowercase: true,
        normalizeEmail: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('E-mail address invalid.')
            }
        }
    },
    password: {
        type: String,
        required: [true, 'Password required.'],
        trim: true,
        validate(value) {
            if (!validator.isStrongPassword(value, {minlength: 12, maxlength: 100,
                minLowercase: 1, minNumbers: 1, minSymbols: 1, returnScore: false,
                pointsPerUnique: 1, pointsPerRepeat: 0.5, pointsForContainingLower: 10,
                pointsForContainingUpper: 10, pointsForContainingNumber: 10, pointsForContainingSymbol: 10 })){
                throw new Error("'" + value + "is an invalid password.")
            }
            if(validator.contains(value, 'password', { ignoreCase: true })) {
                throw new Error('"Password" is an invalid password...')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})

    //Method that deletes the password and tokens array from the response sent to the user
    //Is automatically called whenever a json response is sent to user
    userSchema.methods.toJSON = function () {
        const user = this
        const userObject = user.toObject()
        const token = userObject.token

        delete userObject.password
        delete userObject._id
        delete userObject.tokens
        userObject.token = token

        return userObject
    }

    userSchema.methods.generateAuthToken = async function () {
        const user = this
        const token = jwt.sign({ _id: user._id.toString() }, process.env.APP_SECRET)
        console.log("model " + user._id)
        user.tokens = user.tokens.concat({ token })
        await user.save()
        return token
    }

    userSchema.statics.findByCredentials = async (email, password) => {
        const user = await User.findOne({ email })

        if (!user) {
            throw new Error('Unable to login')
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            throw new Error('Unable to login')
        }

        return user
    }
//Middleware to hash the plain text password before saving
userSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})
const User = mongoose.model('User', userSchema)

module.exports = User
