var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var mongoose = require('mongoose');
mongoose.connect(process.env.MONGOLAB_URI);

var channels = require('./models/channels');

var app = express();

app.locals = {
  appName: 'Robotklubben',
  basedir: path.join(__dirname, 'views')
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// I want to keep slides and and their static files on the same dir
// This will prevent slides from being served
app.use(function(req, res, next) {
    if (req.path.indexOf('.jade', req.path.length - 5) !== -1) {
        return res.send(404, "Not Found");
    }
    next();
});
app.use(express.static(path.join(__dirname, 'decks')));


// Configuring Passport
var passport = require('passport');
var expressSession = require('express-session');
//https: cookie: { secure: true }
app.use(expressSession({secret: '4Of88t1Du4k^YU3pQT', resave: false, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());

// Deploying connect-flash
var flash = require('connect-flash');
app.use(flash());

// Initialize Passport
var initPassport = require('./passport/init');
initPassport(passport);

var routes = require('./routes/index')(passport);
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
