var { Folder } = require('../models/schemas')
var mongoose = require('mongoose')

// Retorna uma pasta a partir do seu id, com os seus ficheiros e subpastas
module.exports.find_contents = function(id){
    id =  mongoose.Types.ObjectId(id)
    return Folder.aggregate([{
        $match: { _id: id }
    },{
        $lookup: {
            from: 'folders', 
            localField: '_id',
            foreignField: 'id_parent', 
            as: 'subfolders'
        }
    },{
        $unwind: {
            path: '$subfolders',
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
    } ,{
        $lookup: {
            from: 'sips', 
            localField: 'id_sip',
            foreignField: '_id', 
            as: 'sip'
        }
    },{
        $sort: { 'files.title': 1, 'subfolders.name': 1 }
    }, {
        $group:{
            _id: '$_id', 
            sip:{$first: {$first: '$sip'}},
            id_parent:{$first:'$id_parent'},
            subfolders: {  // add subfolders to [] only if they exist
                $addToSet : {
                    $cond: [ 
                        { $ne: [ '$subfolders', [] ] }, 
                        '$subfolders',
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
};

module.exports.find = function(id) {
    id =  mongoose.Types.ObjectId(id)
    return Folder.aggregate([{
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

module.exports.find_children = function(id) {
    id =  mongoose.Types.ObjectId(id);
    return Folder.aggregate([ 
        {
            $match: { _id : id } 
        } , {
            $lookup: {
                from:'folders',
                localField:'_id',
                foreignField:'id_parent',
                as:'subfolders'
            } 
        } , {
            $lookup: {
                from: 'files',
                localField: '_id',
                foreignField: 'id_parent',
                as: 'files'
            } 
        } , {
            $project: {
                'subfolders._id': 1, 'files.path': 1, 'files.checksum': 1
            }
        } 
    ]).exec(); 
}

module.exports.insert =  function(folder){
    var newFolder = new Folder(folder)
    return newFolder.save()
}

module.exports.delete = function(id) {
    id =  mongoose.Types.ObjectId(id);
    return Folder.findOneAndDelete({_id:id});
}

module.exports.edit = function(id,update) {
    id =  mongoose.Types.ObjectId(id);
    return Folder.findOneAndUpdate({_id:id}, update); //returns old SIP
}


