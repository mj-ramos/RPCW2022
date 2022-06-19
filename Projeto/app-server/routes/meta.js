var express = require('express');
var router = express.Router();
var axios = require('axios');

const api = 'http://localhost:3002/api'
const auth = 'http://localhost:3003'

router.post('/', function(req,res) {
    let nomes_ficheiros = req.body['ficheiros[]']
    res.render('meta',{sip:req.body.sip, ficheiros: nomes_ficheiros, login: req.cookies.login})
  });
  
router.post('/upload', function(req,res) {
  var ficheiros = JSON.parse(req.body.ficheiros)
  let i = 0
  let data_to_send = []

  while (i<ficheiros.length) {  
    data_to_send.push({
      title:req.body['title[]'][i], 
      desc:req.body['desc[]'][i],
      file_name: ficheiros[i], 
      date_creation: req.body['date_creation[]'][i],
      producer: req.body['producer[]'][i], 
      type: req.body['type[]'][i]})
    i++
  }
  console.log('Dados a enviar: ', data_to_send)

  axios.post(api + '/recursos/meta/upload?token=' + req.cookies.login.token, {ficheiros: data_to_send, sip: req.body.sip})
    .then(() => res.redirect('/repositorio'))
    .catch(e => res.render('error', {error: e, message: 'Error in POST api/recursos/meta', login: req.cookies.login}))
});

router.get('/cancelar', function(req,res) {
  axios.get(api + '/recursos/meta/cancelar?sip=' + req.query.sip + '&token=' + req.cookies.login.token)
    .then(() => res.redirect('/repositorio'))
    .catch(error => res.render({error:error, login: req.cookies.login}))
});

module.exports = router;
