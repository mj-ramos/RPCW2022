const mongoose = require('mongoose')

var paraSchema = new mongoose.Schema({
    data: String,
    paragrafo: String
})

module.exports = mongoose.model('paragrafo', paraSchema)

