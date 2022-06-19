var User = require('../models/user')

// Devolve a lista de utilizadores
module.exports.list = function(){
    return User.find().sort({username:1}).exec()
}

module.exports.list_user = function(uname){
    return User.find({username: { "$regex": uname, "$options": "i" }}).sort({username:1}).exec()
}

module.exports.find = function(uname){
    return User.findOne({username: uname}).exec()
}

module.exports.insert = function(u){
    var newUser = new User(u)
    return newUser.save()
}

module.exports.delete = function(id){
    return User.findOneAndUpdate({_id: id}, {deleted: true}).exec()
}

module.exports.edit = function(id, u){
    return User.findOneAndUpdate({_id: id}, u).exec()
}
