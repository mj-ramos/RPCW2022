var express = require('express');
var axios = require('axios');
var router = express.Router();

/* GET home page. */

router.get('/', function(req, res, next) {
  axios.get('http://localhost:3000/musicas')
    .then(response => {
      let data = response.data
      res.render('index', { title: 'Músicas', musicas: data });
    })
    .catch(function(erro) {
      res.render('error', { error: erro })
    })
});

router.get('/musicas', function(req, res, next) {
  axios.get('http://localhost:3000/musicas')
    .then(response => {
      let data = response.data
      res.render('index', { title: 'Músicas', musicas: data });
    })
    .catch(function(erro) {
      res.render('error', { error: erro })
    })
});

router.get('/musicas/inserir', function(req,res,next) {
  res.render('formulario_musica')  
});

router.get('/musicas/:id', function(req,res,next) {
  axios.get(`http://localhost:3000/musicas/${req.params.id}`)
    .then(response => {
      data = response.data
      res.render('musica', {musica: data})
    })
    .catch(function(erro) {
      res.render('error', { error: erro })
    })
});

router.get('/musicas/prov/:id', function(req,res,next) {
  axios.get(`http://localhost:3000/musicas?prov=${req.params.id}`)
    .then(response => {
      data = response.data
      res.render('provincias', {provincia: req.params.id, musicas: data})
    })
    .catch(function(erro) {
      res.render('error', { error: erro })
    })
});

router.post('/musicas', function(req,res,next) {
  if ('file' in req.body) {
    req.body['fileType'] = req.body['file'].split('.')[1]
  }

  axios.post("http://localhost:3000/musicas",req.body)
    .then(resp => {
      res.send(`<a href="http://localhost:3022/musicas">Voltar</a>`) 
    })
    .catch(function(erro) {
      res.render('error', { error: erro })
    })

});



module.exports = router;

