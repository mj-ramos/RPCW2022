var express = require('express');
var router = express.Router();
var Paragrafo = require('../controllers/paragrafo')

/* GET home page. */
router.get('/paragrafos', function(req, res, next) {
  console.log(JSON.stringify(req.body))
  Paragrafo.listar()
    .then(dados => {
      console.log(dados)
      res.status(200).jsonp(dados)
    })
    .catch(e => {
      res.status(500).jsonp({erro:e})
    })
});

router.post('/paragrafos', function(req, res) {
  Paragrafo.inserir(req.body)
    .then(dados => {
      res.status(200).jsonp(dados)
    })
    .catch(e => {
      res.status(501).jsonp({erro:e})
    })
});

router.delete('/paragrafos/:id', function(req, res) {
  Paragrafo.remover(req.params.id)
    .then(dados => {
      res.status(200).jsonp(dados)
    })
    .catch(e => {
      res.status(502).jsonp({erro:e})
    })
  
});

router.put('/paragrafos/:id', function(req, res) {
  console.log('editar')
  Paragrafo.editar(req.params.id,req.body)
    .then(dados => {
      res.status(200).jsonp(dados)
    })
    .catch(e => {
      res.status(503).jsonp({erro:e})
    })
  
});


module.exports = router;