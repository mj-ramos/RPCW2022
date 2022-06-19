var { File } = require('../models/schemas')
var mongoose = require('mongoose')

// Retorna um recurso e as suas reviews, a partir do seu id
module.exports.find_contents = function(id){
    id =  mongoose.Types.ObjectId(id)
    return File.aggregate([{
        $match: { _id: id }
    }, {
        $lookup: {
            from: 'reviews', 
            localField: '_id',
            foreignField: 'id_parent', 
            as: 'reviews'
        }
    },{
        $lookup: {
            from: 'sips', 
            localField: 'id_sip',
            foreignField: '_id', 
            as: 'sip'
        }
    },{
        $unwind: {
            path: '$reviews',
            preserveNullAndEmptyArrays: true
        }
    }, {
        $sort: { 'reviews.time': -1 }
    }, {
        $group:{
            _id: '$_id',
            _root: { $first: '$$ROOT' },
            sip : { $first: '$sip'},
            reviews: {
                $push : {
                    $cond: [ 
                        { $ne: [ '$reviews', [] ] }, 
                        '$reviews',
                        '$$REMOVE'
                    ]
                }
            },
            global_rating: { $avg: '$reviews.rating' }
        }   
    }, {
        $replaceRoot: { 
            newRoot: {
              $mergeObjects: [ '$_root', { 
                  reviews: '$reviews',
                  global_rating : //arrendonda à primeira casa decimal
                    { $round: ['$global_rating', 1] } 
                }]
            }
          }
    }]).exec()
}

module.exports.find = function (id) {
    id =  mongoose.Types.ObjectId(id)
    return File.aggregate([{
        $match: { _id: id }
    }, {
        $lookup: {
            from: 'sips', 
            localField: 'id_sip',
            foreignField: '_id', 
            as: 'sip'
        }   
    }]).exec();
}

// auxiliar
function get_sort_type(sort, order){
    var sort_type = {}
    var ord = 1
    if (order=="desc") ord = -1

    if (sort=="title") sort_type = {title: ord}
    else if (sort=="date") sort_type = {date_creation: -ord}
    else if (sort=="producer") sort_type = {producer: ord}
    else if (sort=="type") sort_type = {type: ord}
    
    return sort_type
}

// auxiliar
function update_find(find, user){
    if (user.username==undefined) 
        Object.assign(find, { 'sip.0.visibility': true })
    else if (user.level=='user')
        Object.assign(find, { $or:[ {'sip.0.user': user.username}, {'sip.0.visibility': true} ] })
    return find
}

// Retorna os recursos
module.exports.list = function(user,sort,order){
    var sort_type = {title:1}
    if (sort)
        sort_type = get_sort_type(sort,order)

    var find = update_find({}, user)
    return File.aggregate([
        {
            $lookup: {
                from: 'sips', 
                localField: 'id_sip',
                foreignField: '_id', 
                as: 'sip'
            }   
        }, {
            $match: find
        }]).sort(sort_type).exec(); 
}

// Retorna os recursos de um dado tipo, alfabeticamente
module.exports.list_type = function(t,user,sort,order){
    var sort_type = {title:1}
    if (sort)
        sort_type = get_sort_type(sort,order)

    var find = update_find({type: t}, user)
    return File.aggregate([
        {
            $lookup: {
                from: 'sips', 
                localField: 'id_sip',
                foreignField: '_id', 
                as: 'sip'
            }   
        }, {
            $match: find
        }]).sort(sort_type).exec();
}

// Retorna os recursos que incluem dada palavra no seu titulo, alfabeticamente
module.exports.list_title_word = function(w,user,sort,order){
    var sort_type = {title:1}
    if (sort)
        sort_type = get_sort_type(sort,order)

    var find = update_find({title: { "$regex": w, "$options": "i" }}, user)
    return File.aggregate([
        {
            $lookup: {
                from: 'sips', 
                localField: 'id_sip',
                foreignField: '_id', 
                as: 'sip'
            }   
        }, {
            $match: find
        }]).sort(sort_type).exec();
}

// Retorna os recursos que incluem dada palavra no seu produtor, alfabeticamente
module.exports.list_producer_word = function(w,user,sort,order){
    var sort_type = {producer:1}
    if (sort)
        sort_type = get_sort_type(sort,order)

    var find = update_find({producer: { "$regex": w, "$options": "i" }}, user)
    return File.aggregate([
        {
            $lookup: {
                from: 'sips', 
                localField: 'id_sip',
                foreignField: '_id', 
                as: 'sip'
            }   
        }, {
            $match: find
        }]).sort(sort_type).exec();
}

module.exports.findFromSip = function(idSip){
    return File.find({id_sip:idSip}).exec()
}

module.exports.insert = function(file){
    var newFile = new File(file)
    return newFile.save()
}

module.exports.delete = function(id) {
    id =  mongoose.Types.ObjectId(id);
    return File.findOneAndDelete({_id:id});
}

module.exports.edit = function(id,update) {
    id =  mongoose.Types.ObjectId(id);
    return File.findOneAndUpdate({_id:id}, update); //returns old SIP
}
