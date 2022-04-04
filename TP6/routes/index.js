var express = require('express');
var jsonfile = require('jsonfile');
//Multer is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files. 
var multer = require('multer')
var upload = multer({dest: 'uploads'});
var router = express.Router();
var fs = require('fs')

/* GET home page. */
router.get('/', function(req, res) {
  var files = jsonfile.readFileSync('./dbFiles.json')
  res.render('index', { files: files.filter(file => !file.removed)});
});

router.get('/eliminar/:name', function(req, res) {
  var file = req.params.name
  var files = jsonfile.readFileSync('./dbFiles.json') 
  var i=0
  var found = false

  while (!found && i<files.length) {
    if (files[i].name==file) {
      files[i]['removed'] = true
      found=true
    }
    else i++
  }

  jsonfile.writeFileSync('./dbFiles.json',files)
  res.redirect('/')
});

router.post('/', upload.single('uploadedFile'), function(req, res) {
  console.log('Req.file.path: ' + req.file.path)
  let oldPath =  __dirname + '/../' + req.file.path
  let newPath =  __dirname + '/../fileStore/' + req.file.originalname
  
  fs.rename(oldPath, newPath, erro => {
    if (erro) throw erro
  })


  var d = new Date().toISOString().substring(0,16)
  var files = jsonfile.readFileSync('./dbFiles.json') 
  var description = null

  if (req.body && req.body.description) {
    description = req.body.description
  }

  files.push({
    date: d,
    name: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    description: description,
    removed: false
  })

  jsonfile.writeFileSync('./dbFiles.json',files)
  res.redirect('/')

});

module.exports = router;
