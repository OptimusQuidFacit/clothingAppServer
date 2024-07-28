const { default: mongoose } = require("mongoose");


const UserSchema= new mongoose.Schema({
    googleId: {type: String, required:true},
    email: {type: String},
    password: {type: String},
    firstName: {type: String, required:true},
    lastName: {type: String},
    displayName: {type: String, required:true},
    image: {type: String, },
    isAdmin:{type:Boolean, default:false}
})

module.exports= mongoose.model('User', UserSchema);