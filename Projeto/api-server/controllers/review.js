var { Review } = require('../models/schemas')
var mongoose = require('mongoose')

// Retorna uma review a partir do seu id
module.exports.find = function(id){
    id =  mongoose.Types.ObjectId(id)
    return Review.findOne({_id: id}).exec()
}

// Retorna todas as reviews associadas a um recurso, do mais recente para o mais antigo
module.exports.list_from_file = function(file){
    file =  mongoose.Types.ObjectId(file)
    return Review.find({id_file : file}).sort({time:1}).exec()
}

module.exports.insert = function(r){
    var newReview = new Review(r)
    return newReview.save()
}

module.exports.delete = function(id){
    return Review.findByIdAndDelete(id).exec()
}

module.exports.edit = function(id, r){
    return Review.findOneAndUpdate({_id: id}, r).exec()
}