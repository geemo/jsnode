var express     = require('express');
var compression = require('compression');
var mongodb     = require('mongodb');
var Redis       = require('ioredis');
var bodyParser  = require('body-parser');
var session     = require('express-session');
var RedisStore  = require('connect-redis')(session);
var morgan		= require('morgan');
var path 		= require('path');

var settings    = require('./settings.js');
var home        = require('./routes/home.js');
var users       = require('./routes/users.js');
var topics      = require('./routes/topics.js');
var comments    = require('./routes/comments.js');

var MongoClient = mongodb.MongoClient;
var ObjectId    = mongodb.ObjectId;

var redis       = new Redis(settings.redis_url);
var app         = express();

MongoClient.connect(settings.mongo_url, function(err, db){
	app.set('views', './views');
	app.set('view engine', 'ejs');
	app.set('view cache', false);
	app.disable('x-powered-by');

	app.use(morgan('dev'));
	app.use(compression({level: 1}));
	app.use(express.static(path.join(__dirname, 'public')));
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(session({
		secret: settings.secret,
		cookie: {maxAge: 3600000},
		store: new RedisStore({client: new Redis(settings.redis_session_url), ttl: 3600}),
        resave: true,
        saveUninitialized: false
	}));

	app.use('/', home(express.Router(), db, redis, ObjectId));
	app.use('/users', users(express.Router(), db, redis, ObjectId));
	app.use('/topics', topics(express.Router(), db, redis, ObjectId));
	app.use('/comments', comments(express.Router(), db, redis, ObjectId));
	app.use(function(req, res){
		res.status(404).render('404',{
			sessUser: req.session.user
		});
	});
	app.use(function(err, req, res, next){
		if(res.headersSent) next(err);
		else res.status(500).render(500, {
			sessUser: req.session.user,
			err: err.stack
		});
	});

	app.listen(settings.port, function(){
		console.log('server start on port: ' + settings.port);
	});
});