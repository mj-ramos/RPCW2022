var express = require('express');
var router = express.Router();
var axios = require('axios');

const api = 'http://localhost:3002/api'

// --------------------------- Recursos ------------------------------------

router.get('/', function(req, res) {
  console.log('GET sips', req.cookies.login)

  var qstr = ''
  var title = 'Submissões Recursos Didáticos'
  
  if (req.cookies.login) {
    qstr += '&token=' + req.cookies.login.token
    if (req.query.mine) {
      qstr += '&mine=1' 
      title = 'As Minhas Submissões'
    }
  }
      
  if (req.query.name)
    qstr += '&name=' + req.query.name
  else if (req.query.user)
    qstr += '&user=' + req.query.user

  if (req.query.sort)
    qstr += '&sort=' + req.query.sort

  if (req.query.order)
    qstr += '&order=' + req.query.order

  axios.get(api + '/sips' + qstr.replace(qstr[0], '?'))
    .then(dados => {
      let sips = dados.data
      res.render('repositorio/repositorio-sips', { sips: sips, title: title, url: '/repositorio' + req.url.substring(1), login: req.cookies.login });
    })
    .catch(e => res.render('error', {error: e, message: 'Página Indisponível.', login: req.cookies.login}))  
});

router.get('/sips/:sid', function(req, res) {
  var url = api + '/sips/' + req.params.sid
  if (req.cookies.login) url += '?token=' + req.cookies.login.token
 
  console.log( req.cookies.login)

  axios.get(url)
    .then(dados => {
      let sip_content = dados.data
      res.render('repositorio/repositorio-pastas', { folder: sip_content, login: req.cookies.login });
    })
    .catch(e => res.render('error', {error: e, message: 'Página Indisponível.', login: req.cookies.login}))  
});

router.get('/pastas/:pid', function(req, res) {
  var url = api + '/folders/' + req.params.pid
  if (req.cookies.login) url += '?token=' + req.cookies.login.token

  axios.get(url)
    .then(dados => {
      let folder_content = dados.data
      console.log(folder_content)
      res.render('repositorio/repositorio-pastas', { folder: folder_content, login: req.cookies.login });
    })
    .catch(e => res.render('error', {error: e, message: 'Página Indisponível.', login: req.cookies.login}))  
});

router.get('/recursos', function(req, res) {

  if (req.cookies.login)
    token = '&token=' + req.cookies.login.token
  else token = ''

  if (req.query.sort)
    sort= '&sort=' + req.query.sort
  else sort=''

  if (req.query.order)
    order= '&order=' + req.query.order
  else order=''

  //GET /repositorio/recursos?titulo=XX
  if (req.query.title) {
    axios.get(api + '/recursos?q=' + req.query.title + sort + order + token)
    .then(dados => {
      console.log(dados.data)

      res.render('repositorio/repositorio-recursos', { recursos: dados.data, url: '/repositorio' + req.url, login: req.cookies.login });
    })
    .catch(e => res.render('error', {error: e, message: 'Página Indisponível.', login: req.cookies.login}))  

  //GET /repositorio/recursos?tipo=XX
  } else if (req.query.type) {
    axios.get(api + '/recursos?tipo=' + req.query.type + sort + order + token)
    .then(dados => {
      res.render('repositorio/repositorio-recursos', { recursos: dados.data, url: '/repositorio' + req.url, login: req.cookies.login });
    })
    .catch(e => res.render('error', {error: e, message: 'Página Indisponível.', login: req.cookies.login}))  

    //GET /repositorio/recursos?producer=XX
  } else if (req.query.producer) {
    axios.get(api + '/recursos?produtor=' + req.query.producer + sort + order + token)
    .then(dados => {
      res.render('repositorio/repositorio-recursos', { recursos: dados.data, url: '/repositorio' + req.url, login: req.cookies.login });
    })
    .catch(e => res.render('error', {error: e, message: 'Página Indisponível.', login: req.cookies.login}))  

  //GET /repositorio/recursos
  } else {
    if (sort!='') sort = '?sort=' + req.query.sort
    else if (order!='') order = '?order=' + req.query.order
    else if (token!='') token = '?token=' + req.cookies.login.token
    axios.get(api + '/recursos' + sort + order + token)
      .then(dados => {
        console.log(dados.data)
        res.render('repositorio/repositorio-recursos', {recursos: dados.data, url: '/repositorio' + req.url, login: req.cookies.login });
      })
      .catch(e => res.render('error', {error: e, message: 'Página Indisponível.', login: req.cookies.login}))  
  }
});

router.get('/recursos/:rid', function(req, res) {
  var url = api + '/recursos/' + req.params.rid
  if (req.cookies.login) url += '?token=' + req.cookies.login.token

  axios.get(url)
    .then(dados => {
      res.render('recurso', { recurso: dados.data, login: req.cookies.login});
    })
    .catch(e => res.render('error', {error: e, message: 'Página Indisponível.', login: req.cookies.login}))  
});


module.exports = router;