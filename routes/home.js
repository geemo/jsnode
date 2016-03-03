var EventEmitter = require('events').EventEmitter;
var db_query     = require('../ctrls/db_query.js');
var gen_cap      = require('../ctrls/gen_cap.js');

var proxy = new EventEmitter();
proxy.setMaxListeners(0);
var state = 'ready';
var after = function(times){
    var count = 0, results = {};
    return function(key, value){
        results[key] = value;
        count++;
        if(count == times){
            proxy.emit('selected', results);
            state = 'ready';
        }
    };
};

var select = function(db, callback){
    proxy.once('selected', callback);
    if(state == 'ready'){
        state = 'pending';
        db_query(db, after(16));
    }
};


module.exports = function(router, db, redis, ObjectId) {

    router.get('/', function(req, res) {

        select(db, function(results){
            res.render('home', {
                sessUser: req.session.user,
                results: results
            });
        });

    });

    //登录页面
    router.get('/signin', function(req, res) {

        res.render('signin', {
            sessUser: req.session.user
        });
    });

    router.post('/signin', function(req, res) {

        db.collection('users')
            .find({_id: req.body.username}, {_id: 0, password: 1, nickname: 1}, {limit: 1})
            .toArray(function(err, docs) {
                if (docs.length && docs[0].password == req.body.password) {
                    req.session.user = {
                        username: req.body.username,
                        nickname: docs[0].nickname
                    };
                    res.json({
                        url: '/users/' + req.body.username,
                        info: '登录成功,正在跳转...'
                    });
                } else {
                    res.json({
                        info: '账号或密码错误'
                    });
                }
            });
    });

    //注册页面
    router.get('/signup', function(req, res) {
        res.render('signup', {
            sessUser: req.session.user,
            time: (new Date()).getTime()
        });
    });

    //忘记密码页面
    router.get('/forget_pass', function(req, res) {
        res.render('forget_pass', {
            sessUser: req.session.user,
            time: (new Date()).getTime()
        });
    });

    //获取验证码
    router.get('/captcha', function(req, res) {
        //生成验证码
        var captchaArr = gen_cap.get();
        //将验证码文本加入数据库
        redis.set(req.query.time, captchaArr[0].toLowerCase());
        redis.expire(req.query.time, 60);

        //响应验证码图片
        res.writeHead(200, {
            'Content-Type': 'image/jpeg'
        });
        res.end(captchaArr[1]);
    });

    router.get('/action', function(req, res){
        // 'z'代表赞   'f'代表收藏
        if(req.session.user){
            if(req.query.a == 'z'){

                db.collection('topics')
                .updateOne({_id: ObjectId(req.query.topic_id)}, {'$inc': {zanNum: 1}}, function(err, result){
                    if(result){
                        res.json({status: 1});
                    }else{
                        res.json({status: 0});
                    }
                });

            }else if(req.query.a == 'f'){
                db.collection('users')
                .find({_id: req.session.user.username, favors: req.query.topic_id}, {limit: 1})
                .count(function(err, count){
                    if(count){
                        res.json({status: 0});
                    }else{
                        db.collection('users').updateOne({_id: req.session.user.username}, {'$push': {favors: req.query.topic_id}});
                        db.collection('topics').updateOne({_id: ObjectId(req.query.topic_id)}, {'$inc': {favorNum: 1}});
                        res.json({status: 1});
                    }
                });
            }
        }else{
            res.end();
        }
    });

    return router;
};
