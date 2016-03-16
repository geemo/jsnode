var DateFormat   = require('../libs/date_format.js');
var banNames = [
    '默认板块',
    '笑话段子',
    'Node交流',
    'Web设计交流',
    'MongoDB交流',
    'Nginx交流'
];
var orders = [
    {upDate: -1},
    {timeStmp: -1},
    {zanNum: -1},
    {readNum: -1}
];

var after = function(times, callback){
    var count = 0, results = {};
    return function(key, value){
        if(key != undefined){
            results[key] = value;
        }
        count++;
        if(count == times){
            callback(results);
        }
    };
};

module.exports = function(router, db, redis, ObjectId) {

    router.get('/', function(req, res) {


        var type_id = parseInt(req.query.type_id);
        var queryObj = (type_id >= 0 && type_id <= 5) ? {type_id: req.query.type_id} : {};

        if(req.query.key){
            queryObj['title'] = {'$regex': req.query.key, '$options': 'ix'};
        }

        var order_idx = parseInt(req.query.order);
        order_idx = (order_idx > 0 && order_idx < 4) ? order_idx : 0;

        var page = parseInt(req.query.page);
        page = page > 1 ? page : 1;

        var cursor = db.collection('topics').find(queryObj, {type_id: 1, title: 1, nickname: 1, readNum: 1, cmtNum: 1, dateStr: 1, timeStr: 1})
        cursor.count(function(err, count){

            cursor.sort(orders[order_idx])
            .skip((page - 1) * 10)
            .limit(10)
            .toArray(function(err, docs) {
                var totalPage = parseInt(count / 10) + 1;
                page = page > totalPage ? totalPage : page; 
                res.render('topics', {
                    sessUser: req.session.user,
                    banName: banNames[type_id],
                    type_id: type_id,
                    order: order_idx,
                    topics: docs,
                    totalPage: totalPage,
                    page: page,
                    key: req.query.key
                });
            });
        });    
           
    });

    router.post('/', function(req, res) {
        if (req.session.user) {
            var dateFormat = new DateFormat();
            
            db.collection('topics').insertOne({
                type_id: req.body.type_id,
                title: req.body.title,
                content: req.body.content,
                username: req.session.user.username,
                nickname: req.session.user.nickname,
                readNum: 0,
                cmtNum: 0,
                zanNum: 0,
                favorNum:0,
                timeStmp: dateFormat.getTimeStmp(),
                dateStr: dateFormat.getDateStr(),
                timeStr: dateFormat.getTimeStr(),
                upDate: dateFormat.getFullDate(),
                mdfDate: ''
            }, function(err, result) {
                if (!err) {
                    res.json({
                        url: '/topics?type_id=' + req.body.type_id,
                        info: '发表成功!'
                    });
                }
            });
        }
    });

    router.get('/addition', function(req, res) {
        if (req.session.user) {
            var type_id = parseInt(req.query.type_id);
            type_id = (type_id > 0 && type_id < 6) ? type_id : 0;

            res.render('topic_add', {
                sessUser: req.session.user,
                type_id: type_id,
                banName: banNames[type_id]
            });
        } else {
            res.redirect('/signin');
        }

    });

    router.get('/search', function(req, res) {
        if (req.query._id && req.query._id.length == 24) {
            var done = after(4, function(results){
                res.render('topic_show', {
                    sessUser: req.session.user,
                    cmts: results['cmts'],
                    user: results['user'],
                    topic: results['topic'],
                    banName: banNames[results['topic'].type_id],
                    isFavor: results.isFavor
                });
            });


            db.collection('comments')
                .find({topic_id: req.query._id})
                .toArray(function(err, cmts){
                    done('cmts', cmts);
                });

            if(req.session.user){
                db.collection('users').find({_id: req.session.user.username, favors: req.query._id}).count(function(err, count){
                    if(count){
                        done('isFavor', true);
                    }else{
                        done();
                    }
                });
            }else{
                done();
            }        

            db.collection('topics')
                .findOneAndUpdate({_id: ObjectId(req.query._id)}, {'$inc': {'readNum': 1}}, function(err, result){
                
                    if (result && result.value) {
                        done('topic', result.value);

                        db.collection('users')
                            .find({_id: result.value.username}, {_id: 0, imgUrl: 1, sign: 1}, {limit: 1})
                            .toArray(function(err, users){
                               done('user', users[0]);
                            });
                    } else {
                        res.render('404', {
                            sessUser: req.session.user
                        });
                    }
                });

        } else {
            res.render('404', {
                sessUser: req.session.user
            });
        }
    });

    return router;
};
