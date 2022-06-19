var { Sip,File,Folder,Review} = require('../models/schemas')

var mongoose = require('mongoose')

// Retorna um sip a partir do seu id, com os seus ficheiros e pastas
module.exports.find_contents = function(id){
    id =  mongoose.Types.ObjectId(id)
    return Sip.aggregate([{
        $match: { _id: id }
    }, {
        $lookup: {
            from: 'folders', 
            localField: '_id',
            foreignField: 'id_parent', 
            as: 'folders'
        }
    }, {
        $unwind: {
            path: '$folders',
            preserveNullAndEmptyArrays: true
        }
    }, {
        $lookup: {
            from: 'files',
            localField: '_id',
            foreignField: 'id_parent',
            as: 'files'
        }
    }, {
        $unwind: {
            path: '$files',
            preserveNullAndEmptyArrays: true
        }
    }, {
        $sort: { 'files.title': 1, 'folders.name': 1 }
    }, {
        $group:{
            _id: '$_id', 
            name : { $first: '$name' },
            user : { $first: '$user' },
            folders: {  // add folders to [] only if they exist
                $addToSet : {
                    $cond: [ 
                        { $ne: [ '$folders', [] ] }, 
                        '$folders',
                        '$$REMOVE'
                    ]
                }
            },
            files: { 
                $addToSet : {
                    $cond: [ 
                        { $ne: [ '$files', [] ] }, 
                        '$files',
                        '$$REMOVE'
                    ]
                }
             }   
        }   
    }]).exec()
}

module.exports.find = function(id) {
    id =  mongoose.Types.ObjectId(id);
    return Sip.findById(id).exec();
}

// auxiliar
function get_sort_type(sort, order){
    var sort_type = {}
    var ord = 1
    if (order=="desc") ord = -1

    if (sort=="date") sort_type = {date_submission: -ord}
    else if (sort=="name") sort_type = {name: ord}
    
    return sort_type
}

// auxiliar
function update_find(find, user, mine){
    if (user.username==undefined) 
        Object.assign(find, {visibility:true})
    else if (mine) 
        Object.assign(find, {'user': user.username})
    else if (user.level=='user')
        Object.assign(find, {$or: [{ 'user': user.username }, { 'visibility': true }]})
    return find
}

module.exports.list = function(user, mine, sort, order){
    var sort_type = {date_submission: -1}
    if (sort)
        sort_type = get_sort_type(sort,order)

    var find = update_find({}, user, mine)
    return Sip.find(find).sort(sort_type).exec();
}

module.exports.list_user_word = function(searchUser, user, mine, sort, order){
    var sort_type = {user:1}
    if (sort)
        sort_type = get_sort_type(sort,order)

    var find = update_find({user: { "$regex": searchUser, "$options": "i" }}, user, mine)
    return Sip.find(find).sort(sort_type).exec();
}

module.exports.list_name_word = function(searchName, user, mine, sort, order){
    var sort_type = {name:1}
    if (sort)
        sort_type = get_sort_type(sort,order)
    
    var find = update_find({name: { "$regex": searchName, "$options": "i" }}, user, mine)
    return Sip.find(find).sort(sort_type).exec();
}

// Lista todos os ficheiros de todos os sips, por ordem de submissão
module.exports.list_files = function(user,order){
    console.log(user)
    var ord = -1
    if (order=="desc") ord = 1

    var find = update_find({}, user)

    return Sip.aggregate([
        {
            $match: find
        },{
            $lookup: {
                from: 'files',
                localField: '_id',
                foreignField: 'id_sip',
                as: 'files'
        }
        }, { 
            $sort: { date_submission: ord } 
        }, { 
            $unwind: '$files' 
        }, { 
            $addFields: {'files.user':'$user', 'files.sip_name':'$name' } 
        }, {
            $group:{
                _id: null, 
                files: { $push : '$files' } 
            }
        }, {
            $project:{
                _id: 0, 
                files: '$files',
            }
        }]).exec();
}

module.exports.insert = function(sip){
    if (sip.visibility=='private') {
        sip.visibility = false;
    } else {
        sip.visibility = true;
    }
    var newSip = new Sip(sip)
    return newSip.save();
}

module.exports.delete = function(id) {
    id =  mongoose.Types.ObjectId(id);
    return Sip.findOneAndDelete({_id:id});
}

module.exports.edit = function(id,update) {
    if (update.visibility=='private') {
        update.visibility = false;
    } else {
        update.visibility = true;
    }
    id =  mongoose.Types.ObjectId(id);
    return Sip.findOneAndUpdate({_id:id}, update); //returns old SIP
}

