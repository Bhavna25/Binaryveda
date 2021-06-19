const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    age: {
        type: Number,
        required: false,
        default: 30,
        trim: true
    },
    password: {
        type: String,
        required: true,
    },
    JWTtokens: [{ 
        token: {
            type: String,
            required: true
        }
    }]
});




const User = mongoose.model("User", userSchema, 'users');


module.exports = User;