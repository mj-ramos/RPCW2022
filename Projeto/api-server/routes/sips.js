var express = require('express');
var router = express.Router();

var operations = require('../javascripts/operations');
var tokenValidator = require('../javascripts/tokenValidation');

var fs = require('fs');
var zip = require('adm-zip');
var path = require('path')

//--------------------Controllers---------------------

var Sip = require('../controllers/sip');
var File = require('../controllers/file');
var Folder = require('../controllers/folder');

//----------------------------------------------------

router.get('/', function(req, res) {
  let user = tokenValidator.verifyUser(req);
  console.log('User asking sips:',user)

  if (req.query.name) {
    Sip.list_name_word(req.query.name, user, req.query.mine, req.query.sort, req.query.order)
    .then(data => {console.log(data);res.status(200).jsonp(data)})
    .catch(e => {console.log(e);res.status(504).jsonp({erro: e})})

  } 
  else if (req.query.user) {
    Sip.list_user_word(req.query.user, user, req.query.mine, req.query.sort, req.query.order)
    .then(data => {console.log(data);res.status(200).jsonp(data)})
    .catch(e => {console.log(e);res.status(504).jsonp({erro: e})})

  } 
  else {
    Sip.list(user, req.query.mine, req.query.sort, req.query.order)
      .then(data => {console.log(data);res.status(200).jsonp(data)})
      .catch(e => {console.log(e);res.status(504).jsonp({erro: e})})
  }
});

router.get('/download/:sid', tokenValidator.verifyTokenWatchSip(), async function(req, res) {
  try {
    let sip = await Sip.find(req.params.sid);
    let filesData = await File.findFromSip(req.params.sid);

    let manifest = [];
    for(let file of filesData) {
      manifest.push({'checksum': file.checksum, 'path' : file.path})
    };

    let content = JSON.stringify(manifest,undefined,4);
    let sipPath = operations.obtainPath(['..','storage','SIPstore',sip.user,sip.name]);
    let sipZip = zip(sipPath);

    let random = Math.random();
    let newDir = operations.obtainPath(['..','storage','download',random]);

    fs.mkdirSync(newDir);

    sipZip.extractAllTo(newDir);
    fs.writeFileSync(newDir + '/RRD-SIP.json', content);

    var newZip = new zip();
    newZip.addLocalFolder(newDir,'')
    newZip.writeZip(newDir + '.zip');
    fs.rm(newDir, { recursive: true, force: true }, () => {
      fs.rm(newDir,() => {});
    });

    res.sendFile(path.resolve(newDir + '.zip'));
    res.on('finish', () =>{
      fs.unlink(newDir + '.zip',() => {});
    })

  } catch (e) {
    console.log(e);
    res.status(500).end('Algo correu mal no envio do ficheiro.')
  }
});

  
router.get('/:sid', tokenValidator.verifyTokenWatchSip(), function(req, res) {
  Sip.find_contents(req.params.sid)
    .then(data => res.status(200).jsonp(data[0]))
    .catch(e => res.status(505).jsonp({erro: e}))
});


router.put('/:sid', tokenValidator.verifyTokenSip, function(req, res) {
    console.log(req.body)
    Sip.edit(req.params.sid, req.body)
        .then(data => {
          if (data.name != req.body.name) { //if the name changed
              let oldSipPath = operations.obtainPath(['..','storage','SIPstore',data.user,data.name])
              let newSipPath = operations.obtainPath(['..','storage','SIPstore',data.user,req.body.name])
  
              if (fs.existsSync(oldSipPath)) {
                  fs.rename(oldSipPath, newSipPath, function(err) {
                    if (err) console.log('ERROR: ' + err);
                  });
              }
          }
          res.status(200).jsonp(data);
        })
        .catch(e => res.status(504).jsonp({erro: e}))
  });
  
router.delete('/:sid', tokenValidator.verifyTokenSip, function(req, res) {
  Sip.delete(req.params.sid)
      .then(data => {
        console.log('SIP removido: ' + data)
        
        let sipPath = operations.obtainPath(['..','storage','SIPstore',data.user,data.name]);
        if (fs.existsSync(sipPath)) {
          fs.unlinkSync(sipPath)
        }

        res.status(200).jsonp(data)
      })
      .catch(e => {console.log(e);res.status(503).jsonp({erro: e})})
});



module.exports = router;