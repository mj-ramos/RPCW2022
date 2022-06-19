var express = require('express');
var router = express.Router();

var operations = require('../javascripts/operations');
var tokenValidator = require('../javascripts/tokenValidation');

//---------------------------Para upload e download de ficheiros--------------------

var Mime = require('mime');
var fs = require('fs');
var os = require('os');
var zip = require('adm-zip');
var js2xmlparser = require("js2xmlparser");
var parseXml = require('xml2js').parseString;
var path = require('path');
var multer = require('multer');
var upload = multer({dest: 'storage/upload'});
var SIPValidator = require('../javascripts/SIPvalidation');


var sipsWaitingMeta = []

//------------------------------------Controllers----------------------------------

var Sip = require('../controllers/sip');
var Folder = require('../controllers/folder');
var File = require('../controllers/file');

//------------------------------------------------------

router.get('/', function(req, res) {
  res.redirect('/api/recursos')
});

router.get('/recursos', function(req, res) {
  let user = tokenValidator.verifyUser(req);
  //GET /api/recursos?tipo=X
  if (req.query.tipo){
    File.list_type(req.query.tipo,user,req.query.sort,req.query.order)
    .then(data => res.status(200).jsonp(data))
    .catch(e => res.status(501).jsonp({erro: e}))
  }
  //GET /api/recursos?q=pal
  else if (req.query.q){
    File.list_title_word(req.query.q,user,req.query.sort,req.query.order)
    .then(data => res.status(200).jsonp(data))
    .catch(e => res.status(502).jsonp({erro: e}))
  }
  //GET /api/recursos?produtor=X
  else if (req.query.produtor){
    File.list_producer_word(req.query.produtor,user,req.query.sort,req.query.order)
    .then(data => res.status(200).jsonp(data))
    .catch(e => res.status(503).jsonp({erro: e}))
  }
  //GET /api/recursos?sort=X
  else if (req.query.sort){
    File.list(user, req.query.sort,req.query.order)
      .then(data => res.status(200).jsonp(data))
      .catch(e => res.status(504).jsonp({erro: e}))
  }
  //GET /api/recursos
  else {
    Sip.list_files(user,req.query.order)
      .then(data => {res.status(200).jsonp( (data[0]?.files || []) )})
      .catch(e => res.status(500).jsonp({erro: e}))
  }
});


router.get('/recursos/:rid', tokenValidator.verifyTokenWatchFile(), function(req, res) {
  File.find_contents(req.params.rid)
    .then(data => {res.status(200).jsonp(data[0])})
    .catch(e => res.status(513).jsonp({error: e}))
});

router.post('/recursos', [upload.single('SIP'), tokenValidator.verifyToken('user')], async function(req, res) {
  console.log(req.file);
  let oldPath = undefined;
  let newPath = undefined;
  let filePath = undefined;
  let userPath = operations.obtainPath(['..','storage','SIPstore',req.user])
  if (os.type() == 'Windows_NT') filePath= req.user  + '\\' + req.file.originalname
  else filePath= req.user  + '/' + req.file.originalname

  var sip = {
    name: req.file.originalname,
    date_submission: new Date().toISOString().substring(0, 16),
    user: req.user,
    description: req.body.description,
    visibility: req.body.visibility
  }

  if (!fs.existsSync(userPath)) {
    fs.mkdirSync(userPath);
  }

  oldPath = operations.obtainPath(['..',req.file.path]);
  newPath = operations.obtainPath(['..','storage','SIPstore',req.user,req.file.originalname]);
  console.log('New path: ' + newPath)

  //If a SIP with the same name was already uploaded by user, throws error
  if (fs.existsSync(newPath)) {
    fs.unlinkSync(oldPath)
    res.status(400).jsonp({erro: 'Já existe um SIP no seu repositório com o mesmo nome!'})
  } else {

    fs.rename(oldPath, newPath, erro => {
      if (erro) {
        console.log(erro)
        fs.unlinkSync(oldPath)
        res.status(516).jsonp({erro: 'Erro interno ao guardar o SIP...'})

        return
      } else {

        try {
          let filesMeta = SIPValidator.validateSIP(filePath)
          //Get meta from xml
          let zipPath = new zip(newPath);
          let xmlFilesMeta = []
          for (const file of filesMeta.xmlFiles) {
            xmlFilesMeta.push(SIPValidator.metaFromXml(file,zipPath))
          }
    
          if (filesMeta.filesNeedMeta.length == 0) {
            saveSIP(sip,xmlFilesMeta)
              .then(res.status(201).jsonp({resultado: 'Upload realizado com sucesso!'}))
              .catch(e => console.log(e))
    
          } else {
            sip.xmlsMeta = xmlFilesMeta; 
            sipsWaitingMeta.push(sip); //Depois enviar também utilizador
            res.status(202).jsonp({resultado: 'É necessária mais informação.', sip: req.file.originalname, ficheiros: filesMeta.filesNeedMeta})
          }

        } catch(e)  {
            console.log(e.message)
            if (fs.existsSync(newPath)) fs.unlinkSync(newPath)
            res.status(400).jsonp({erro: e.message})
            return
          }    
        }
        
    })

  }
})

  

router.put('/recursos/:rid', tokenValidator.verifyTokenFile, async function(req, res) {
    console.log(req.body)

    if (req.body.mimetype=='application/xml') {
      let file = await File.find(req.params.rid);
      file = file[0];
      let sip = file.sip[0];
      let sipPath = operations.obtainPath(['..','storage','SIPstore',sip.user,sip.name]);
      let sipZip = new zip(path.resolve(sipPath)); 
      let fileEntry = sipZip.getEntry(file.path);

      let xml = fileEntry.getData().toString('utf8');

      parseXml(xml, function (err, result) {
        if(err) {console.log(e); res.status(500).jsonp(err)}
        else {
          result.RRD.meta[0].titulo = req.body.title;
          result.RRD.meta[0].descricao = req.body.desc;
          result.RRD.meta[0].produtor = req.body.producer;
          result.RRD.meta[0].tipo = req.body.type;
          result.RRD.meta[0].data_criacao = req.body.date_creation;

          let obj = {"meta" : result.RRD.meta[0], "corpo" : result.RRD.corpo[0]};
          let newData = js2xmlparser.parse("RRD",obj);

          sipZip.addFile(req.body.path, Buffer.from(newData, "utf-8"));
          sipZip.deleteFile(file.path);
          sipZip.writeZip(sipPath);

          let newChecksum = SIPValidator.calculateChecksum(newData);

          let update = req.body;
          update.checksum = newChecksum;

          File.edit(req.params.rid, update)
            .then(data => res.status(200).jsonp(data))
            .catch(e =>  res.status(500).jsonp(e))

        }

      })

    } else {
      var data = await File.edit(req.params.rid, req.body);
  
      if (data.file_name != req.body.file_name) { //if the name changed
        let sip = await Sip.find(data.id_sip);
        let sipPath = operations.obtainPath(['..','storage','SIPstore',sip.user,sip.name]);
        let sipZip = new zip(path.resolve(sipPath)); 
        let fileEntry = sipZip.getEntry(data.path);
        var decompressedData = sipZip.readFile(fileEntry);
        var newPath = (data.path).split('/'); newPath.pop(); 
        newPath = newPath.join([separador = '/']);
        if (newPath!='') newPath += '/';
        sipZip.addFile(newPath + req.body.file_name, decompressedData);
        sipZip.deleteFile(fileEntry);
        sipZip.writeZip(sipPath);
      }
      res.status(200).jsonp(data);   
    }
});


router.delete('/recursos/:rid',  tokenValidator.verifyTokenFile, async function(req, res) {
  try {
    var fileDeleted = await File.delete(req.params.rid);
    console.log(fileDeleted)
    var sip = await Sip.find(fileDeleted.id_sip);
    console.log(sip)

    let sipPath = operations.obtainPath(['..','storage','SIPstore',sip.user,sip.name]);
    let sipZip = new zip(path.resolve(sipPath)); 
    sipZip.deleteFile(fileDeleted.path);
    sipZip.writeZip(sipPath);

    res.status(200).jsonp(fileDeleted);   
  } catch (error) {
    console.log(error);
    res.status(500).jsonp({error: error});
  }
});
  

//------------------------------------------Meta---------------------------------------------

router.post('/recursos/meta/upload', tokenValidator.verifyToken('user'), function(req, res) {
  var sipName = req.body.sip
  var sipFiles = req.body.ficheiros
  var sip = undefined
  var user = req.user

  for(var pendingSip of sipsWaitingMeta) {
    if (pendingSip.name == sipName && pendingSip.user==user) {
      sip = pendingSip
      console.log(sip)
      break
    }
  }

  saveSIP(sip,sipFiles)
    .then(resSaveSip => {
      operations.removeElem(pendingSip,sipsWaitingMeta);
      res.status(200).jsonp(resSaveSip)} )
    .catch(e => console.log(e))
});


router.get('/recursos/meta/cancelar', tokenValidator.verifyToken('user'), function(req,res) {
  var sipName = req.query.sip;
  var user = req.user;
  var sip = undefined;

  for(var pendingSip of sipsWaitingMeta) {
    if (pendingSip.name == sipName && pendingSip.user==user) {
      sip = pendingSip
      break
    }
  }

  operations.removeElem(sip,sipsWaitingMeta);
  var sipPath = operations.obtainPath(['..','storage','SIPstore',user,sipName])

  try {
    if (fs.existsSync(sipPath)) {
      fs.unlinkSync(sipPath)
    }
    res.status(200).end()

  } catch(error) {
      console.log(error)
      res.status(500).jsonp({error: error})
  }
});


//----------------------------------Download---------------------------------------------

router.get('/recursos/download/:rid', tokenValidator.verifyTokenWatchFile(), function(req, res) {
  File.find_contents(req.params.rid)
    .then(data => {
      const file = data[0]
      const sipInfo = file.sip[0]
      console.log(sipInfo,file.path)
      var sip = new zip(operations.obtainPath(['..','storage','SIPstore',sipInfo.user,sipInfo.name]));
      sip.extractEntryTo(file.path, __dirname + '/../storage/download', false, true);

      const filePath = operations.obtainPath(['..','storage','download',file.file_name]);
      res.sendFile(path.resolve(filePath));

      res.on('finish', () =>{
        fs.unlinkSync(filePath);
      })

    })
    .catch(e => {console.log(e);res.status(508).jsonp({error: e})})
});


//----------------------------------------Aux------------------------------------------

async function saveContent (folders,fileMeta,id,checksums) {
  var filePath = fileMeta.file_name;
  var filePathParts = filePath.split('/');
  var parentDirectory = '';
  console.log(filePathParts);

  for (var i = 0;i<filePathParts.length;i++) {
    let name = filePathParts[i];
    let path = parentDirectory + '/' + name;

    //If it's not a file and it's not a folder already created
    if (i!=filePathParts.length-1 && folders[path]==undefined) {
      var insertedFolder = await Folder.insert({id_sip:id, id_parent:folders[parentDirectory], path:path, name:name});
      console.log('Folder added: ',insertedFolder,folders[parentDirectory],path);
      folders[path] = insertedFolder._id;

    } else if (i==filePathParts.length-1) { //it's a file
        fileMeta.mimetype = Mime.getType((fileMeta.file_name).split('.')[1])
        fileMeta.checksum = checksums[fileMeta.file_name]
        fileMeta.path = fileMeta.file_name;
        fileMeta.file_name = name;
        fileMeta.id_sip = id;
        fileMeta.id_parent = folders[parentDirectory];
        var insertedFile = await File.insert(fileMeta);
        console.log('File added: ',insertedFile,folders[parentDirectory],parentDirectory);
    }
      parentDirectory += '/' + filePathParts[i];
  }
  return folders;
}

async function saveSIP(sip,filesMeta) {
  if (sip.xmlsMeta != undefined) {
    filesMeta = filesMeta.concat(sip.xmlsMeta);
    delete sip.xmlsMeta;
  }
  console.log(filesMeta);
  let sipPath = operations.obtainPath(['..','storage','SIPstore',sip.user,sip.name]);
  var sipZip = zip(sipPath);
  var manifestEntry = sipZip.getEntry('RRD-SIP.json');
  var manifest = JSON.parse(manifestEntry.getData().toString('utf8'));
  var checksums = {};

  manifest.forEach(reg => {
    checksums[reg.path] = reg.checksum
  });

  //remove manifest
  sipZip.deleteFile(manifestEntry);
  sipZip.writeZip(sipPath);

  var resInsertSip = await Sip.insert(sip);
  console.log('Inserted sip: ', resInsertSip);
  var folders = {};
  folders[''] = resInsertSip._id;

  (async() => {
    for(var j= 0; j<filesMeta.length; j++) {
      folders = await saveContent(folders,filesMeta[j],resInsertSip._id,checksums);
      console.log(folders);
    }
  })();

}



module.exports = router;
