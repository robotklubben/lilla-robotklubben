var mongoose = require('mongoose');

var userSchema = new mongoose.Schema ({
    username: {type: String, index: {unique: true}},
    password: String,
    firstName: String,
    lastName: String,
    email: {type: String, index: {unique: true}}
}); 

module.exports = mongoose.model('User', userSchema);
