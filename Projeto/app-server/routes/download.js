var express = require('express');
var router = express.Router();
var axios = require('axios');
const fs = require('fs')

const api = 'http://localhost:3002/api'

router.get('/recurso/:rid', function(req, res) {
  var url = api + '/recursos/download/' + req.params.rid
  if (req.cookies.login) url += '?token=' + req.cookies.login.token

  axios({
    method: 'get',
    url: url,
    responseType: 'stream'
  })
  .then(resData => {
    let file = fs.createWriteStream(__dirname + '/../storage/' + req.query.name);
    let stream = resData.data.pipe(file);
    stream.on('finish', () =>{
      res.download(__dirname + '/../storage/' + req.query.name);
      res.on('finish', () => {
        fs.unlink(__dirname + '/../storage/' + req.query.name, (err) => {if (err) console.log(err)})
      });
    });
  })
  .catch(e => res.render('error',{error:e,  login: req.cookies.login}));
});

router.get('/ver/recurso/:rid', function(req, res) {
  var url = api + '/recursos/download/' + req.params.rid
  if (req.cookies.login) url += '?token=' + req.cookies.login.token

  axios({
    method: 'get',
    url: url,
    responseType: 'stream'
  })
  .then(resData => {
    let file = fs.createWriteStream(__dirname + '/../storage/' + req.query.name);
    let stream = resData.data.pipe(file);
    stream.on('finish', () =>{
      res.status(200).send('ok')
    });
  })
  .catch(e => res.render('error',{error:e,  login: req.cookies.login}));
});

  
router.get('/sip/:sid', function(req, res) {
  var url =  api + '/sips/download/' + req.params.sid
  if (req.cookies.login) url += '?token=' + req.cookies.login.token

  axios({
    method: 'get',
    url: url,
    responseType: 'stream'
  })
  .then(resData => {
    let file = fs.createWriteStream(__dirname + '/../storage/' + req.query.name);
    let stream = resData.data.pipe(file);
    stream.on('finish', () =>{
      res.download(__dirname + '/../storage/' + req.query.name);
      res.on('finish', () => {
        fs.unlink(__dirname + '/../storage/' + req.query.name, (err) => {if (err) console.log(err)});
      });
    });
  })
  .catch(e => res.render('error',{error:e,  login: req.cookies.login}));
});

router.get('/folder/:fid', function(req, res) {
  var url =  api + '/folders/download/' + req.params.fid
  if (req.cookies.login) url += '?token=' + req.cookies.login.token

  axios({
    method: 'get',
    url: url,
    responseType: 'stream'
  })
  .then(resData => {
    let file = fs.createWriteStream(__dirname + '/../storage/' + req.query.name);
    let stream = resData.data.pipe(file);
    stream.on('finish', () =>{
      res.download(__dirname + '/../storage/' + req.query.name );
      res.on('finish', () => {
        fs.unlink(__dirname + '/../storage/' + req.query.name, (err) => {if (err) console.log(err)});
      });
    });
  })
  .catch(e => res.render('error',{error:e,  login: req.cookies.login}));
});

module.exports = router;
  