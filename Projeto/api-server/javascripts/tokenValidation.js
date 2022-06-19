var jwt = require('jsonwebtoken')

var Review = require('../controllers/review');
var Sip = require('../controllers/sip');
var Folder = require('../controllers/folder');
var File = require('../controllers/file');

// Permite o acesso a qualquer user logged in se level=='user', ou apenas a admins se level=='admin'
const verifyToken = function(level){
    return async function(req, res, next){
      var myToken = req.query.token || req.body.token
      if(myToken){
        jwt.verify(myToken, 'RPCW2022', function(e, payload){
          if(e){
            console.log(e)
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

const verifyUser = function (req) {
  var myToken = req.query.token || req.body.token;
  var user = {username: undefined, level: undefined };
  if (myToken) {
    jwt.verify(myToken, 'RPCW2022', function(e, payload){
      if(!e){
          user.username = payload.username;
          user.level = payload.level;
      } else {
        console.log(e.message)
        return user;
      }
    });
  } 
  return user; 
}

// Permite o acesso a um sip ao utilizador que o criou, ao admin, ou a todos se este for visivel
const verifyTokenWatchSip =  function(){
  return async function(req, res, next) {
    Sip.find(req.params.sid).then(data => {
      var myToken = req.query.token || req.body.token;

      if(myToken){
        jwt.verify(myToken, 'RPCW2022', function(e, payload){
          if(e){
            res.status(401).jsonp({erro: e})
          } else {          
            if (data.user == payload.username || data.visibility == true || 'admin' == payload.level) {
              req.user = payload.username;
              next()
            } else {
              res.status(401).jsonp({erro: "Autorização Insuficiente"})
            }
          }
        });
      } else {
        if (data.visibility == false) {
          res.status(401).jsonp({erro: "Autorização Insuficiente"})
        } else {
          next();
        }
      }
    })
    .catch(e => console.log(e))
  }
}

// Permite o acesso a uma folder ao utilizador que a criou, ao admin, ou a todos se esta for visivel
const verifyTokenWatchFolder =  function(){
  return async function(req, res, next) {
    Folder.find(req.params.fid).then(data => {
      var myToken = req.query.token || req.body.token;
      console.log(data)

      let sip = data[0].sip[0];

      if(myToken){
        jwt.verify(myToken, 'RPCW2022', function(e, payload){
          if(e){
            res.status(401).jsonp({erro: e})
          } else {
            if (sip.user == payload.username || sip.visibility == true || 'admin' == payload.level) {
              req.user = payload.username;
              next()
            } else
              res.status(401).jsonp({erro: "Autorização Insuficiente"})
          }
        });
      } else {
        if (sip.visibility == false) {
          res.status(401).jsonp({erro: "Autorização Insuficiente"})
        } else {
          next();
        }     
      }
    })
  }
}

// Permite o acesso a uma file ao utilizador que a criou, ao admin, ou a todos se esta for visivel
const verifyTokenWatchFile =  function(){
  return async function(req, res, next) {
    File.find(req.params.rid).then(data => {
      var myToken = req.query.token || req.body.token;
      let sip = data[0].sip[0];

      if(myToken){
        jwt.verify(myToken, 'RPCW2022', function(e, payload){
          if(e){
            res.status(401).jsonp({erro: e})
          } else {
            if (sip.user == payload.username || sip.visibility == true || 'admin' == payload.level) {
              req.user = payload.username;
              next()
            } else {
              res.status(401).jsonp({erro: "Autorização Insuficiente"})}
          }
        });
      } else {
        console.log('no token')
        if (sip.visibility == false) {
          res.status(401).jsonp({erro: "Autorização Insuficiente"})
        } else {
          next();
        }
      }
    })
  }
}

// Permite o acesso a um sip ao utilizador que o criou ou ao admin
const verifyTokenSip = function(req, res, next){
  var myToken = req.query.token || req.body.token
  if(myToken){
    jwt.verify(myToken, 'RPCW2022', function(e, payload){
      if(e){
        res.status(401).jsonp({erro: e})
      }
      else{
        Sip.find(req.params.sid)
          .then(data => {
            if (data.user == payload.username || 'admin' == payload.level){
              req.user = payload.username;
              next()
            }
            else
              res.status(401).jsonp({erro: "Autorização Insuficiente"})
          })
          .catch(e => res.status(401).jsonp({erro: "Review Inexistente"}))
      }
    })
  }
  else{
    res.status(401).jsonp({erro: "Token Inexistente"})
  }
}

// Permite o acesso a uma file ao utilizador que a criou ou ao admin
const verifyTokenFile = function(req, res, next){
  var myToken = req.query.token || req.body.token
  if(myToken){
    jwt.verify(myToken, 'RPCW2022', function(e, payload){
      if(e){
        res.status(401).jsonp({erro: e})
      }
      else{
        File.find(req.params.rid)
          .then(data => {
            let sip = data[0].sip[0];
            if (sip.user == payload.username || 'admin' == payload.level){
              req.user = payload.username;
              next()
            }
            else
              res.status(401).jsonp({erro: "Autorização Insuficiente"})
          })
          .catch(e => {console.log(e);res.status(401).jsonp({erro: "Review Inexistente"})})
      }
    })
  }
  else{
    res.status(401).jsonp({erro: "Token Inexistente"})
  }
}

// Permite o acesso a um folder ao utilizador que a criou ou ao admin
const verifyTokenFolder = function(req, res, next){
  var myToken = req.query.token || req.body.token
  if(myToken){
    jwt.verify(myToken, 'RPCW2022', function(e, payload){
      if(e){
        res.status(401).jsonp({erro: e})
      }
      else{
        Folder.find(req.params.fid)
          .then(data => {
            console.log(req.params.fid)
            console.log(data)
            let sip = data[0].sip[0];
            if (sip.user == payload.username || 'admin' == payload.level){
              req.user = payload.username;
              next()
            }
            else
              res.status(401).jsonp({erro: "Autorização Insuficiente"})
          })
          .catch(e => {console.log(e);res.status(401).jsonp({erro: "Review Inexistente"})})
      }
    })
  }
  else{
    res.status(401).jsonp({erro: "Token Inexistente"})
  }
}


// Permite o acesso a uma review ao utilizador que a criou ou ao admin
const verifyTokenReview = function(req, res, next){
  var myToken = req.query.token || req.body.token
  if(myToken){
    jwt.verify(myToken, 'RPCW2022', function(e, payload){
      if(e){
        res.status(401).jsonp({erro: e})
      }
      else{
        Review.find(req.params.id)
          .then(data => {
            if (data.user == payload.username || 'admin' == payload.level){
              req.user = payload.username;
              next()
            }
            else
              res.status(401).jsonp({erro: "Autorização Insuficiente"})
          })
          .catch(e => res.status(401).jsonp({erro: "Review Inexistente"}))
      }
    })
  }
  else{
    res.status(401).jsonp({erro: "Token Inexistente"})
  }
}

module.exports.verifyToken = verifyToken;
module.exports.verifyUser = verifyUser;
module.exports.verifyTokenReview = verifyTokenReview;
module.exports.verifyTokenSip = verifyTokenSip;
module.exports.verifyTokenFile = verifyTokenFile;
module.exports.verifyTokenFolder = verifyTokenFolder;
module.exports.verifyTokenWatchSip = verifyTokenWatchSip;
module.exports.verifyTokenWatchFolder = verifyTokenWatchFolder;
module.exports.verifyTokenWatchFile = verifyTokenWatchFile;