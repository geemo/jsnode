var DateFormat = require('./date_format.js');
//首页文档排序
module.exports = function(db, done) {
    db.collection('topics').find({}, {
        title: 1,
        upDate: 1
    }).sort({
        upDate: -1
    }).limit(10).toArray(function(err, docs) {
        done('o0', docs);
    });
    db.collection('topics').find({}, {
        title: 1,
        dateStr: 1,
        timeStr: 1
    }).sort({
        timeStmp: -1
    }).limit(10).toArray(function(err, docs) {
        done('o1', docs);
    });
    db.collection('topics').find({}, {
        title: 1,
        zanNum: 1
    }).sort({
        zanNum: -1
    }).limit(10).toArray(function(err, docs) {
        done('o2', docs);
    });
    db.collection('topics').find({}, {
        title: 1,
        readNum: 1
    }).sort({
        readNum: -1
    }).limit(10).toArray(function(err, docs) {
        done('o3', docs);
    });


    var dateStr = (new DateFormat()).getDateStr();
    //首页各板块数量
    db.collection('topics').find({
        type_id: '0'
    }).count(function(err, count) {
        done('c0', count);
    });
    db.collection('topics').find({
        type_id: '0',
        dateStr: dateStr
    }).count(function(err, count) {
        done('c0t', count);
    });

    db.collection('topics').find({
        type_id: '1'
    }).count(function(err, count) {
        done('c1', count);
    });
    db.collection('topics').find({
        type_id: '1',
        dateStr: dateStr
    }).count(function(err, count) {
        done('c1t', count);
    });

    db.collection('topics').find({
        type_id: '2'
    }).count(function(err, count) {
        done('c2', count);
    });
    db.collection('topics').find({
        type_id: '2',
        dateStr: dateStr
    }).count(function(err, count) {
        done('c2t', count);
    });

    db.collection('topics').find({
        type_id: '3'
    }).count(function(err, count) {
        done('c3', count);
    });
    db.collection('topics').find({
        type_id: '3',
        dateStr: dateStr
    }).count(function(err, count) {
        done('c3t', count);
    });

    db.collection('topics').find({
        type_id: '4'
    }).count(function(err, count) {
        done('c4', count);
    });
    db.collection('topics').find({
        type_id: '4',
        dateStr: dateStr
    }).count(function(err, count) {
        done('c4t', count);
    });

    db.collection('topics').find({
        type_id: '5'
    }).count(function(err, count) {
        done('c5', count);
    });
    db.collection('topics').find({
        type_id: '5',
        dateStr: dateStr
    }).count(function(err, count) {
        done('c5t', count);
    });
};
