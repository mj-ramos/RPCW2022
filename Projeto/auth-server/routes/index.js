var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken')
var passport = require('passport')

var User = require('../controllers/user')

const verifyToken = function(level){
  return async function(req, res, next){
    var myToken = req.query.token || req.body.token
    if(myToken){
      jwt.verify(myToken, 'RPCW2022', function(e, payload){
        if(e){
          res.status(401).jsonp({erro: e})
        }
        else{
          if( level=='user' || payload.level==level ) {
            req.user = payload.username;
            next()
          }
          else
            res.status(401).jsonp({erro: "Autorização Insuficiente"})
        }
      })
    }
    else{
      res.status(401).jsonp({erro: "Token Inexistente"})
    }
  }
}

router.get('/', verifyToken('admin'), function(req, res){
  if (req.query.user){
    User.list_user(req.query.user)
      .then(data => res.status(200).jsonp(data))
      .catch(e => res.status(500).jsonp({error: e}))
  }
  else{
    User.list()
      .then(data => res.status(200).jsonp(data))
      .catch(e => res.status(500).jsonp({error: e}))
  }
})

router.post('/registar', function(req, res){
  User.insert(req.body)
    .then(data => res.status(200).jsonp(data))
    .catch(e => {console.log(e);res.status(501).jsonp({error: e})})
})
  
router.post('/login', passport.authenticate('local'), function(req, res){
  jwt.sign({
      username: req.user.username,
      level: req.user.level,
      sub: req.user.username
    }, 
    'RPCW2022',
    {expiresIn: 3600},
    function(e, token) {
      if(e) 
        res.status(502).jsonp({error: "Erro na geração do token: " + e}) 
      else 
        res.status(200).jsonp({
          token: token,
          username: req.user.username,
          name: req.user.name, 
          level: req.user.level,
          email: req.user.email
        })
  });
})

router.delete('/:id', verifyToken('admin'), function(req, res, next) {
  User.delete(req.params.id)
      .then(data => res.status(200).jsonp(data))
      .catch(e => res.status(503).jsonp({erro: e}))
});

router.put('/:id', verifyToken('admin'), function(req, res, next) {
  console.log(req.body)
  User.edit(req.params.id, req.body)
      .then(data => res.status(200).jsonp(data))
      .catch(e => res.status(504).jsonp({erro: e}))
});

module.exports = router;
