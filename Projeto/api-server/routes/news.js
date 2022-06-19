var express = require('express');
var router = express.Router();

var tokenValidator = require('../javascripts/tokenValidation');

//--------------------Controllers---------------------

var News = require('../controllers/news');

//----------------------------------------------------

router.get('', function(req, res) {
  //GET /api/news?q=string
  if (req.query.q){
    News.find_by_string(req.query.q)
    .then(data => res.status(200).jsonp(data))
    .catch(e => res.status(523).jsonp({erro: e}))
  }
  //GET /api/news
  else {
    News.list()
    .then(data => res.status(200).jsonp(data))
    .catch(e => res.status(524).jsonp({erro: e}))
  }
});

router.get('/:id', tokenValidator.verifyToken('admin'), function(req, res) {
  News.find(req.params.id)
    .then(data => res.status(200).jsonp(data))
    .catch(e => res.status(525).jsonp({erro: e}))
});

router.post('', tokenValidator.verifyToken('admin'), function(req, res) {
  News.insert(req.body)
    .then(data => res.status(200).jsonp(data))
    .catch(e => res.status(526).jsonp({erro: e}))
});

router.delete('/:id', tokenValidator.verifyToken('admin'), function(req, res, next) {
  News.delete(req.params.id)
      .then(data => res.status(200).jsonp(data))
      .catch(e => res.status(527).jsonp({erro: e}))
});

router.put('/:id', tokenValidator.verifyToken('admin'), function(req, res, next) {
  News.find(req.params.id)
    .then(news => {
      var time = new Date();

      req.body.created = news.created;
      req.body.last_modified = time.toISOString().substring(0, 19).replace("T"," ");

      News.edit(req.params.id, req.body)
      .then(data => res.status(200).jsonp(data))
      .catch(e => res.status(528).jsonp({erro: e}))
    })
    .catch(e => res.status(529).jsonp({erro: e}))
});

module.exports = router;
