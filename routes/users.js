var IncomingForm = require('formidable').IncomingForm;
var fs           = require('fs');
var DateFormat   = require('../libs/date_format.js');
var settings     = require('../settings.js');

module.exports = function(router, db, redis, ObjectId) {

    //用户资料页
    router.get('/:username', function(req, res) {
        if(req.session.user){
            db.collection('users')
                .find({_id: req.params.username}, {limit: 1})
                .toArray(function(err, docs) {
                    if (docs.length) {
                        res.render('users', {
                            sessUser: req.session.user,
                            user: docs[0]
                        });
                    } else {
                        res.render('404', {
                            sessUser: req.session.user
                        });
                    }
                });
        }else{
            res.redirect('/signin');
        }      
    });

    //账户注册
    router.post('/', function(req, res) {

        redis.get(req.body.time, function(err, result) {

            if ((req.body.captcha).toLowerCase() == result) {
                //注意 username == _id
                var uname = req.body.username.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                db.collection('users')
                    .find({_id: uname}, {limit: 1})
                    .toArray(function(err, docs) {
                        if (docs.length == 0) {
                            var dateFormat = new DateFormat();
                            
                            db.collection('users').insertOne({
                                _id: uname,
                                password: req.body.password,
                                nickname: 'JSNode' + uname,
                                imgUrl: null,
                                sign: '这位朋友很懒,什么也没留下!',
                                levelName: '小白',
                                exprNum: 0,
                                goldNum: 0,
                                sex: '未知',
                                tel: '',
                                email: '',
                                state: '正常',
                                regDate: dateFormat.getFullDate(),
                                favors: [],
                                friends: []
                            }, function(err, result) {
                                if (!err) {
                                    res.json({
                                        url: '/signin',
                                        info: '注册成功,正在跳转...'
                                    });
                                } else {
                                    res.json({
                                        info: '未知错误'
                                    });
                                }
                            });

                        } else if (docs.length) {
                            res.json({
                                info: '账号已被注册'
                            });
                        } else {
                            res.json({
                                info: '未知错误'
                            });
                        }

                    });
            } else {
                res.json({
                    info: '验证码错误'
                });
            }

        });


    });

    //上传头像
    router.post('/:username/uploadImg', function(req, res) {
        if (req.session.user) {

            var form = new IncomingForm();
            form.uploadDir = settings.img_dir;
            form.keepExtensions = true;

            form.on('progress', function(receivedBytes, totalBytes) {
                if (receivedBytes > 100 * 1024) {
                    res.end();
                }
            });
            
            form.parse(req, function(request, fileds, files) {
                db.collection('users')
                    .find({_id: req.params.username}, { imgUrl: 1}, {limit: 1})
                    .toArray(function(err, docs) {
                        var uploadDir = form.uploadDir;
                        //上传成功后删除之前的图片
                        fs.exists(uploadDir + docs[0].imgUrl, function(isExists) {  
                            var fileName = files.img.path.substr(uploadDir.length);

                            if (isExists) {
                                fs.unlink(uploadDir + docs[0].imgUrl, function() {
                                    //更新用户imgUrl
                                    db.collection('users').update({_id: docs[0]._id}, {'$set': {imgUrl: fileName}});
                                    db.collection('comments').update({username: req.params.username}, {'$set': {headImgUrl: fileName}}, {multi: true});
                                });
                            } else {
                                 db.collection('users').update({_id: docs[0]._id}, {'$set': {imgUrl: fileName}});
                                 db.collection('comments').update({username: req.params.username}, {'$set': {headImgUrl: fileName}}, {multi: true});
                            }

                        });
                    });

                res.end();
            });
        }

    });

    router.get('/:username/signout', function(req, res) {
        if(req.session.user && req.session.user.username == req.params.username){
            req.session.user = undefined;
            res.redirect('/signin');
        }else{
            res.render('404', {
                sessUser: req.session.user
            });
        }
    });

    router.get('/:username/topics', function(req, res){
        if(req.session.user){
            var page = parseInt(req.query.page);
            page = page > 1 ? page : 1;

            var cursor = db.collection('topics').find({username: req.params.username}, {type_id: 1, title: 1, nickname: 1, readNum: 1, cmtNum: 1, dateStr: 1, timeStr: 1})
            cursor.count(function(err, count){
                cursor.skip((page - 1) * 10)
                .limit(10)
                .toArray(function(err, docs){


                    var totalPage = parseInt(count / 10) + 1;
                    page = page > totalPage ? totalPage : page; 

                    res.render('user_tpcs_favs', {
                        sessUser: req.session.user,
                        topics: docs,
                        username: req.params.username,
                        url: '/topics',
                        page: page,
                        totalPage: totalPage,
                        pathName: '话题'
                    });
                });
            });
        }else{
            res.redirect('/signin');
        }        
    });

    router.get('/:username/favors', function(req, res){
        if(req.session.user){
            db.collection('users')
            .find({_id: req.params.username}, {_id: 0, favors: 1}, {limit: 1})
            .toArray(function(err, docs){
                if(docs.length){

                    if(docs[0].favors.length){
                        var page = parseInt(req.query.page);
                        page = page > 1 ? page : 1;

                        var favors = docs[0].favors;
                        var ids = [];
                        for(var i = 0; i < favors.length; ++i){
                            ids.push(ObjectId(favors[i]));
                        }

                        var totalPage = parseInt(favors.length / 10) + 1;
                        page = page > totalPage ? totalPage : page; 

                        db.collection('topics')
                        .find({_id: {'$in': ids}}, {type_id: 1, title: 1, nickname: 1, readNum: 1, cmtNum: 1, dateStr: 1, timeStr: 1})
                        .skip((page - 1) * 10)
                        .limit(10)                       
                        .toArray(function(err, docs){
                            res.render('user_tpcs_favs', {
                                sessUser: req.session.user,
                                topics: docs,
                                username: req.params.username,
                                url: '/favors',
                                page: page,
                                totalPage: totalPage,
                                pathName: '收藏'
                            });
                        });
                    }else{
                        res.render('user_tpcs_favs', {
                            sessUser: req.session.user,
                            topics: [],
                            username: req.params.username,
                            url: '/favors',
                            page: 1,
                            totalPage: 1,
                            pathName: '收藏'
                        });
                    }
                }else{
                    res.render('404', {
                        sessUser: req.session.user
                    });
                }

            });
        }else{
            res.redirect('/signin');
        }

    });

    router.get('/:username/comments', function(req, res){
        if(req.session.user){
            var page = parseInt(req.query.page);
            page = page > 1 ? page : 1;

            var cursor = db.collection('comments').find({username: req.params.username}, {_id: 0, topic_id: 1, content: 1, date: 1});
            cursor.count(function(err, count){
                var totalPage = parseInt(count / 20) + 1;
                page = page > totalPage ? totalPage : page;  

                cursor.skip((page - 1) * 20)
                .limit(20)
                .toArray(function(err, cmts){
                    res.render('user_cmts', {
                        sessUser: req.session.user,
                        cmts: cmts,
                        username: req.params.username,
                        url: '/comments',
                        page: page,
                        totalPage: totalPage
                    });
                });
            });

        }else{
            res.redirect('/signin');
        }
    });

    return router;
};
