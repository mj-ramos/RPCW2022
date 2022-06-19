const mongoose = require('mongoose')

var newsSchema = new mongoose.Schema({
    title: String,
    content: String,
    created: String,
    last_modified: String,
    visibility: Boolean
})

var reviewSchema = new mongoose.Schema({
    id_parent: mongoose.Schema.Types.ObjectId,
    user: String,
    time: String,
    rating: Number,
    comment: String,
    edited: Boolean
})

var fileSchema = new mongoose.Schema({
    id_sip: mongoose.Schema.Types.ObjectId,
    id_parent: mongoose.Schema.Types.ObjectId,
    mimetype: String,
    title: String,
    file_name: String,
    path: String,
    checksum: String,
    date_creation: String,
    type: String,
    producer: String,
    desc: String
})

var folderSchema = new mongoose.Schema({ 
    id_sip: mongoose.Schema.Types.ObjectId,
    id_parent: mongoose.Schema.Types.ObjectId,
    path: String,
    name: String
});

var sipSchema = new mongoose.Schema({
    name: String,
    description: String,
    visibility: Boolean,
    date_submission: String,
    user: String
});

//------------------------------------Mongoose Middleware------------------------------------------

sipSchema.pre('findOneAndDelete', async function() {
    let id = this.getQuery()["_id"];
    const File = mongoose.model('file');
    await File.deleteMany({id_parent : id});
    const Folder = mongoose.model('folder');
    await Folder.deleteMany({id_parent : id});
});

folderSchema.pre('deleteMany', async function() {
    let sipId = this._conditions['id_parent'];
    const Folder = mongoose.model('folder');
    let folders = await Folder.find({id_parent : sipId});
    (async() => {
        for(var i= 0; i<folders.length; i++) {
            await Folder.findOneAndDelete({_id : folders[i]._id});
        }
    })();
 });

folderSchema.pre('findOneAndDelete', async function() {
    let id = this._conditions['_id'];
    const File = mongoose.model('file');
    await File.deleteMany({id_parent : id});
    const Folder = mongoose.model('folder');
    await Folder.deleteMany({id_parent : id});
});

fileSchema.pre('deleteMany', async function() {
    let parendId = this._conditions['id_parent'];
    const File = mongoose.model('file');
    const Review = mongoose.model('review');
    let files = await File.find({id_parent : parendId});
    (async() => {
        for(var i= 0; i<files.length; i++) {
            await Review.deleteMany({id_parent : files[i]._id});
        }
    })();
});

fileSchema.pre('findOneAndDelete', async function () {
    let id = this._conditions['_id'];
    console.log('delete',id);
    const Review = mongoose.model('review');
    await Review.deleteMany({id_parent : id })
})

//----------------------------------------------------------------------------------------


module.exports = {
    Sip : mongoose.model('sip', sipSchema),
    Folder : mongoose.model('folder', folderSchema),
    File : mongoose.model('file', fileSchema),
    Review : mongoose.model('review', reviewSchema),
    News : mongoose.model('news', newsSchema)
}

