var express = require('express');
var router = express.Router();
var axios = require('axios')
var fs = require('fs')

const key = fs.readFileSync('key.txt')


/* GET home page. */
router.get('/', function(req, res, next) {
  axios.get(`http://clav-api.di.uminho.pt/v2/classes?nivel=1&apikey=${key}`)
    .then(response => {
      res.render('index', {classe1: response.data});
    })
    .catch(erro => {
      res.render('error',{error: erro})
    })
  
});

//Na página de cada classe, deve ser mostrada a informação base da classe, uma lista dos seus descendentes caso existam e, se a classe for de nível 3 uma lista dos processos relacionados (cada um destes deve ser um link para o respetivo processo), apenas deves contemplar as relações: 
// eCruzadoCom, eComplementarDe, eSuplementoDe e eSuplementoPara;
router.get('/:codigo', function(req, res, next) {
  axios.get(`http://clav-api.di.uminho.pt/v2/classes/c${req.params.codigo}?apikey=${key}`)
    .then(response => {
      var dados = response.data

      if (dados.nivel == 3) {
        axios.get(`http://clav-api.di.uminho.pt/v2/classes/c${dados.codigo}/procRel/?apikey=${key}`)
          .then(response1 => {
            var relacionados = (response1.data).filter(rel => rel.idRel=='eCruzadoCom' || rel.idRel=='eComplementarDe' || rel.idRel=='eSuplementoDe' || rel.idRel=='eSuplementoPara')
            res.render('codigo', {codigo: dados.codigo, titulo: dados.titulo, descricao: dados.descricao, nivel: dados.nivel, descendentes: dados.filhos, relacionados: relacionados})
          })
          .catch(erro => {
            res.render('error',{error: erro})
          })
      
      } else {
        res.render('codigo', {codigo: dados.codigo, titulo: dados.titulo, descricao: dados.descricao, nivel: dados.nivel, descendentes: dados.filhos, relacionados: undefined});
      }
    })
    .catch(erro => {
      res.render('error',{error: erro})
    })
  
});

module.exports = router;
