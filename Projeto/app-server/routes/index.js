var express = require('express');
var router = express.Router();
var axios = require('axios');
const FormData = require('form-data');

var multer = require('multer')({
  fileFilter: (req,file,cb) => {
    if (file.mimetype == 'application/x-zip-compressed' || file.mimetype == 'application/zip') {
      cb(null,true)
    } else {
      req.fileValidationError = "Extensão inválida";
      return cb(null, false, req.fileValidationError);
    }
  }
})

const api = 'http://localhost:3002/api'
const auth = 'http://localhost:3003'

router.get('/', function(req, res) {
  axios.get(api + '/news')
    .then(data => {console.log(data);res.render('index', { news: data.data, login: req.cookies.login })})
    .catch(error => res.render('error', { error: error, login: req.cookies.login }))
});

router.get('/sobre', function(req, res) {
  res.render('sobre', { login: req.cookies.login })
});


//---------------------------- Gestão Users ------------------------------------

router.get('/users', function(req, res) {
  
  if (req.cookies.login) 
    token = '?token=' + req.cookies.login.token
  else token = ''

  if (req.query.user) 
    if (token!='')
      query = '&user=' + req.query.user
    else 
      query = '?user=' + req.query.user
  else
    query = ''

  axios.get(auth + '/' + token + query)
    .then(dados => {
      res.render('gestao-users', { users: dados.data, login: req.cookies.login});
    })
    .catch(e => res.render('error', {error: e, message: 'Página Indisponível.'}))  
});

router.get('/users/delete/:id', function(req, res) {
  axios.delete(auth + '/' + req.params.id + '?token=' + req.cookies.login.token)
    .then(dados => {
      res.redirect('back')
    })
    .catch(e => res.render('error', {error: e, message: 'Erro ao apagar utilizador.',  login: req.cookies.login}))
});

router.post('/users/edit/:id', function(req, res) {
  var user = {
    name: req.body.name,
    level: req.body.level
  }
  axios.put(auth + '/' + req.params.id + '?token=' + req.cookies.login.token, user)
    .then(dados => {
      res.redirect('back')
    })
    .catch(e => res.render('error', {error: e, message: 'Erro ao editar utilizador.',  login: req.cookies.login}))
});

//---------------------------- News ------------------------------------

router.get('/noticias', function(req, res) {
    //GET /noticias?q=XX
  if (req.query.q) {
    axios.get(api + '/news?q=' + req.query.q)
    .then(dados => {
      res.render('news', { news: dados.data, login: req.cookies.login, query: req.query.q });
    })
    .catch(e => res.render('error', {error: e, message: 'Página Indisponível.'}));
  }
    //GET /noticias
  else {
    axios.get(api + '/news')
    .then(dados => {
      res.render('news', { news: dados.data, login: req.cookies.login, query: '' });
    })
    .catch(e => res.render('error', {error: e, message: 'Página Indisponível.'}));
  }
});

router.get('/noticias/eliminar/:id', function(req, res) {
  axios.delete(api + '/news/' + req.params.id + '?token=' + req.cookies.login.token)
  .then(dados => {
    res.redirect('/noticias');
  })
  .catch(e => res.render('error', {error: e, message: 'Serviço Indisponível.'}));
});

router.post('/noticias', function(req, res) {
  var news = {
    title: req.body.title,
    content: req.body.content,
    visibility: Boolean(req.body.visibility)
  }
  axios.post(api + '/news?token=' + req.cookies.login.token, news)
  .then(dados => {
    res.redirect('/noticias');
  })
  .catch(e => res.render('error', {error: e, message: 'Serviço Indisponível.'}));
});

router.post('/noticias/:id', function(req, res) {
  var news = {
    title: req.body.title,
    content: req.body.content,
    visibility: Boolean(req.body.visibility)
  }
  axios.put(api + '/news/' + req.params.id + '?token=' + req.cookies.login.token, news)
  .then(dados => {
    res.redirect('/noticias');
  })
  .catch(e => res.render('error', {error: e, message: 'Serviço Indisponível.'}));
});

//---------------------------- Reviews ------------------------------------

router.post('/reviews/:pid', function(req, res) {
  var review = {
    id_parent: req.params.pid,
    user: req.cookies.login.username,
    time: new Date().toISOString().substring(0, 19).replace("T"," "),
    rating: req.body.rating,
    comment: req.body.comment,
    edited: false
  }
  axios.post(api + '/reviews?token=' + req.cookies.login.token, review)
      .then(resp => {
        res.redirect('back')
      })
      .catch(e => res.render('error', {error: e, message: 'Erro na publicação do comentário.',  login: req.cookies.login}))
});

router.get('/reviews/delete/:id', function(req, res) {
  axios.delete(api + '/reviews/' + req.params.id + '?token=' + req.cookies.login.token)
    .then(dados => {
      res.redirect('back')
    })
    .catch(e => res.render('error', {error: e, message: 'Erro ao apagar comentário.',  login: req.cookies.login}))
});

router.post('/reviews/edit/:id', function(req, res) {
  var review = {
    time: new Date().toISOString().substring(0, 19).replace("T"," "),
    rating: req.body.edit_rating,
    comment: req.body.edit_comment,
    edited: true
  }
  axios.put(api + '/reviews/' + req.params.id + '?token=' + req.cookies.login.token, review)
    .then(dados => {
      res.redirect('back')
    })
    .catch(e => res.render('error', {error: e, message: 'Erro ao editar comentário.',  login: req.cookies.login}))
});

//---------------------------- User Authentication ------------------------------------

router.get('/registar', function(req, res) {
  res.render('registar', {  });
});

router.get('/login', function(req, res) {
  res.render('login', {  });
});

router.get('/logout', function(req, res) {
  res.clearCookie('login');
  res.redirect('/');
});

router.post('/registar', function(req, res) {
  var user = {
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    level: (req.body.level || 'user'),
    deleted: false
  }

  axios.post(auth + '/registar', user)
      .then(resp => {
          res.status(resp.status).end()
      })
      .catch(e => {
        res.statusMessage = 'Credenciais já em uso.'
        res.status(409).end()
      })
});

router.post('/login', function(req, res) {
  var user = {
    username: req.body.username,
    password: req.body.password
  }
  axios.post(auth + '/login', user)
      .then(resp => {
        res.cookie('login', resp.data, {
          expires: new Date(Date.now() + '1d'),
          secure: false, // set to true if using https
          httpOnly: true
        });
        res.status(resp.status).end()
      })
      .catch(e => {
        res.statusMessage = 'Credenciais Inválidas.'
        res.status(401).end()
      })
});

//------------------------------- File Upload -----------------------------------

router.post('/upload', multer.single('SIP') ,function(req, res) {
  console.log(req.file)

  if (req.fileValidationError) {
    res.statusMessage = 'Extensão inválida. Por favor, faça upload de um zip.'
    res.status(415).end()
  
  } else {

    //Creates a form to send to the api-server
    const form = new FormData()
    form.append('SIP', req.file.buffer, req.file.originalname);
    form.append('visibility',req.body.visibility);
    form.append('description',req.body.description);

    axios.post(api + '/recursos?token=' + req.cookies.login.token, form, {
      headers: {
        'Content-Type': `multipart/form-data; boundary=${form.getBoundary()}`
      }
    })
    .then(resultado => {
      console.log(resultado.status)
      console.log(resultado.data)
      res.status(resultado.status).jsonp(resultado.data)
    })
    .catch(e => {
      res.statusMessage = e.response.data.erro
      console.log(e.response.data.erro)
      res.status(e.response.status).end()
    })
  }
});


//----------------------------------- Edit/Delete Sip ---------------------------------------

router.get('/sips/:sid/eliminar', function(req, res) {
  let url = api + '/sips/' + req.params.sid
  if (req.cookies.login) url += '?token=' + req.cookies.login.token

  axios.delete(url)
    .then(data => res.status(200).end('SIP removido.'))
    .catch(e => res.status(500).end('Erro'))
});

router.post('/sips/:sid/editar', function(req, res) {
  let url = api + '/sips/' + req.params.sid
  if (req.cookies.login) url += '?token=' + req.cookies.login.token

  axios.put(url, req.body)  
    .then(() => res.redirect('back'))
    .catch(error => res.render('error',{error:error,  login: req.cookies.login}))
});

//----------------------------------- Edit/Delete Folder ---------------------------------------

router.get('/folders/:fid/eliminar', function(req, res) {
  let url = api + '/folders/' + req.params.fid
  if (req.cookies.login) url += '?token=' + req.cookies.login.token

  axios.delete(url)
    .then(data => res.status(200).end('Pasta removida.'))
    .catch(e => res.end('Erro'))
});

router.post('/folders/:fid/editar', function(req, res) {
  let url = api + '/folders/' + req.params.fid
  if (req.cookies.login) url += '?token=' + req.cookies.login.token

  axios.put(url, req.body)  
    .then(() => res.redirect('back'))
    .catch(error => res.render('error',{error:error,  login: req.cookies.login}))
});

//----------------------------------- Edit/Delete File ---------------------------------------

router.get('/recursos/:rid/eliminar', function(req, res) {
  let url = api + '/recursos/' + req.params.rid;
  if (req.cookies.login) url += '?token=' + req.cookies.login.token

  axios.delete(url)
    .then(data => res.status(200).end('Recurso removido.'))
    .catch(e => res.status(500).end('Erro'))
});

router.post('/recursos/:rid/editar', function(req, res) {
  let url = api + '/recursos/' + req.params.rid
  if (req.cookies.login) url += '?token=' + req.cookies.login.token

  let filePath = (req.body.path).split('/');
  filePath.pop();
  if (filePath.length >= 1) filePath = filePath.join('/') + '/'
  else filePath = '';
  req.body.path = filePath + req.body.file_name;

  axios.put(url, req.body)  
    .then(() => res.redirect('back'))
    .catch(error => {res.render('error',{error:error, login: req.cookies.login})})
});


module.exports = router;
