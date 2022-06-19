const mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true},
    name: String,
    email: { type: String, required: true},
    password: { type: String, required: true},
    level: { type: String, required: true },
    deleted: Boolean
});

module.exports = mongoose.model('user', userSchema)