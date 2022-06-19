var { News } = require('../models/schemas')
var mongoose = require('mongoose')

// Lista todas as notícias por data de modificação, de forma decrescente
module.exports.list = function() {
    return News
        .find()
        .sort({created: -1})
        .exec();
}

// Retorna a notícia com o id correspondente
module.exports.find = function(id){
    return News
        .findOne({_id: mongoose.Types.ObjectId(id)})
        .exec();
}

// Retorna as notícias com a String no titulo ou no conteudo, por data de modificação, de forma decrescente
module.exports.find_by_string = function(s){
    return News
        .find({$or : [{title: new RegExp(s, 'i')}, {content: new RegExp(s, 'i')}]})
        .sort({created: -1})
        .exec();
}

// Insere uma nova notícia na base de dados
module.exports.insert = function(n){
    var time = new Date();
    n.created = time.toISOString().substring(0, 19).replace("T"," ");
    n.last_modified = time.toISOString().substring(0, 19).replace("T"," ");

    var newNews = new News(n);
    return newNews.save();
}

// Remove a notícia correspondente 
module.exports.delete = function(id){
    return News
        .deleteOne({_id: mongoose.Types.ObjectId(id)})
        .exec();
}

// Altera as informações da notícia
module.exports.edit = function(id, n){
    return News
        .findByIdAndUpdate({_id: mongoose.Types.ObjectId(id)}, n, {new: true})
        .exec();
}
