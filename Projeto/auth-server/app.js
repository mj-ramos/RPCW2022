var createError = require('http-errors');
var express = require('express');
var logger = require('morgan');

var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy

var indexRouter = require('./routes/index');

var mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/Repositorio', 
      { useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000});
  
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Erro de conexão ao MongoDB...'));
db.once('open', function() {
  console.log("Conexão ao MongoDB realizada com sucesso...")
});

var User = require('./controllers/user')

// Configuração da estratégia local
passport.use(new LocalStrategy(
  {usernameField: 'username'}, (username, password, done) => {
    User.find(username)
      .then(user => {
        //const user = data
        if(!user) { 
          return done(null, false, {message: 'Utilizador Inexistente!\n'})
        }
        if(password != user.password || user.deleted) { 
          return done(null, false, {message: 'Credenciais Inválidas!\n'})
        }
        return done(null, user)
      })
      .catch(e => done(e))
    })
)

// Indica-se ao passport como serializar o utilizador
passport.serializeUser((user,done) => {
  console.log('Serialização, username: ' + user.username)
  done(null, user.username)
})
  
// Desserialização: a partir do id obtem-se a informação do utilizador
passport.deserializeUser((username, done) => {
  console.log('Desserialização, username: ' + username)
  User.find(username)
    .then(data => done(null, data))
    .catch(erro => done(erro, false))
})

var app = express();
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(require("express-session")({
  secret:"RPCW2022",
  resave: false,
  saveUninitialized: false
}));
app.use(logger('dev'));

// depois de configurar as sessoes, antes dos routers!
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
