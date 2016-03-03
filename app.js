var express     = require('express');
var compression = require('compression');
var mongodb     = require('mongodb');
var Redis       = require('ioredis');
var bodyParser  = require('body-parser');
var session     = require('express-session');
var RedisStore  = require('connect-redis')(session);

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
	app.set('view cache', true);

	app.use(compression({level: 1}));
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
	app.get('*', function(req, res){
		res.render('404',{
			sessUser: req.session.user
		});
	});

	app.listen(settings.port, function(){
		console.log('server start on port: ' + settings.port);
	});
});