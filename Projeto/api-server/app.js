var createError = require('http-errors');
var express = require('express');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var sipsRouter = require('./routes/sips');
var foldersRouter = require('./routes/folders');
var reviewsRouter = require('./routes/reviews');
var newsRouter = require('./routes/news');

//--------------------------Conexão ao MongoDB----------------------------------------

var mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/Repositorio', 
      { useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000}
);
  
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Erro de conexão ao MongoDB...'));
db.once('open', function() {
  console.log("Conexão ao MongoDB realizada com sucesso...")
});

//----------------------------------------------------------------------------------

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api', indexRouter);
app.use('/api/sips', sipsRouter);
app.use('/api/folders', foldersRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/news', newsRouter);

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
  res.status(err.status || 500).jsonp({error: err.message});
});

module.exports = app;
