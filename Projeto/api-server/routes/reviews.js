var express = require('express');
var router = express.Router();

var tokenValidator = require('../javascripts/tokenValidation');

//--------------------Controllers---------------------

var Review = require('../controllers/review');

//----------------------------------------------------

router.post('/', tokenValidator.verifyToken('user'), function(req, res) {
    Review.insert(req.body)
      .then(data => res.status(200).jsonp(data))
      .catch(e => res.status(508).jsonp({erro: e}))
  });
  
router.delete('/:id', tokenValidator.verifyTokenReview, function(req, res, next) {
  Review.delete(req.params.id)
      .then(data => res.status(200).jsonp(data))
      .catch(e => res.status(509).jsonp({erro: e}))
});

router.put('/:id', tokenValidator.verifyTokenReview, function(req, res, next) {
  console.log(req.body)
  Review.edit(req.params.id, req.body)
      .then(data => res.status(200).jsonp(data))
      .catch(e => res.status(510).jsonp({erro: e}))
});

module.exports = router;
  