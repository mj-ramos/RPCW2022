var express = require('express');
var router = express.Router();

var operations = require('../javascripts/operations');
var tokenValidator = require('../javascripts/tokenValidation');

var fs = require('fs');
var path = require('path')
var zip = require('adm-zip');

//--------------------Controllers---------------------

var Folder = require('../controllers/folder');
var Sip = require('../controllers/sip');

//----------------------------------------------------

async function manifestFromFolder(folderId,folderPath) {
  folderPath = folderPath.substring(1);
  let folderChildren = await Folder.find_children(folderId);

  let manifest = await (async() => {
    let pManifest = []
    for (const subfolder of folderChildren[0].subfolders) {
        let subfolderManifest = await manifestFromFolder(subfolder._id,folderPath);
        pManifest = pManifest.concat(subfolderManifest);
    }
    return pManifest;
  })();

  for (const file of folderChildren[0].files) {
    let newPath = ((file.path).split(folderPath)[1]).substring(1);

    manifest.push({
      "checksum" : file.checksum,
      "path": newPath
    })
  }
  console.log(manifest)

  return manifest;
}

router.get('/download/:fid', tokenValidator.verifyTokenWatchFolder(), async function (req, res) {
  try {    
      let data = await Folder.find(req.params.fid);
    
      console.log(data)
      const folder = data[0]
      const sipInfo = folder.sip[0]
      
      var sipZip = new zip(operations.obtainPath(['..','storage','SIPstore',sipInfo.user,sipInfo.name]));

      let random = Math.random();
      let newDir = operations.obtainPath(['..','storage','download',random]);
      let dirFolder = operations.obtainPath(['..','storage','download',random,folder.path]);
      const folderPath = operations.obtainPath(['..','storage','download',random,folder.name + '.zip']);

      fs.mkdirSync(newDir);
      sipZip.extractAllTo(newDir);

      //write manifest
      let manifest = await  manifestFromFolder(req.params.fid,(data[0].path).substring(1));
      manifest = JSON.stringify(manifest,undefined,4);
      fs.writeFileSync(dirFolder + '/RRD-SIP.json', manifest);

      let newZip = new zip();
      newZip.addLocalFolder(dirFolder,'');
      newZip.writeZip(folderPath);

  

      res.sendFile(path.resolve(folderPath));

      res.on('finish', () =>{
        fs.rm(newDir, { recursive: true, force: true }, () => {
          fs.rm(newDir,() => {})
        })
      })

    } catch(e) {
        console.log(e);
        res.status(508).jsonp({error: e})
    }
});


router.get('/:fid', tokenValidator.verifyTokenWatchFolder(), function(req, res) {
    Folder.find_contents(req.params.fid)
      .then(data => res.status(200).jsonp(data[0]))
      .catch(e => res.status(506).jsonp({erro: e}))
});

router.put('/:fid', tokenValidator.verifyTokenFolder, function(req, res) {
  Folder.edit(req.params.fid, req.body)
      .then(data => res.status(200).jsonp(data))
      .catch(e => res.status(504).jsonp({erro: e}))
});

router.delete('/:fid', tokenValidator.verifyTokenFolder, async function(req, res) {
  try {
    var folderDeleted = await Folder.delete(req.params.fid);
    var sip = await Sip.find(folderDeleted.id_sip);

    let sipPath = operations.obtainPath(['..','storage','SIPstore',sip.user,sip.name]);
    let sipZip = new zip(path.resolve(sipPath)); 

    let random = Math.random();
    let newDir = operations.obtainPath(['..','storage','SIPstore',random]);
    let dirFolder = operations.obtainPath(['..','storage','SIPstore',random,folderDeleted.path]);

    fs.mkdirSync(newDir);
    sipZip.extractAllTo(newDir);

    fs.rm(dirFolder, { recursive: true, force: true }, () => {
      fs.rm(dirFolder,() => {
        let newZip = new zip();
        newZip.addLocalFolder(newDir,'');
        newZip.writeZip(sipPath);

        fs.rm(newDir, { recursive: true, force: true }, () => {
          fs.rm(newDir,() => {})
        })

        res.status(200).jsonp(folderDeleted); 
      });
    });
      

  } catch (error) {
    console.log(error);
    res.status(500).jsonp({error: error});
  }
});

module.exports = router;
  