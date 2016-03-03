var IncomingForm = require('formidable').IncomingForm;
var DateFormat   = require('../ctrls/date_format.js');
var settings     = require('../settings.js');

module.exports = function(router, db, redis, ObjectId){

	router.post('/', function(req, res){
		if(req.session.user){
			var form = new IncomingForm();
            form.uploadDir = settings.pic_dir;
            form.keepExtensions = true;

            form.on('progress', function(receivedBytes, totalBytes) {
                if (receivedBytes > 100 * 1024) {
                    res.end();
                }
            });

            form.parse(req, function(request, fileds, files) {
                var dateFormat = new DateFormat();

				var fullDate = dateFormat.getFullDate();

            	var fileName = files.img ? files.img.path.substr(form.uploadDir.length) : null;

            	db.collection('users')
            	.find({_id: req.session.user.username}, {_id: 0, imgUrl: 1}, {limit: 1})
            	.toArray(function(err, docs){

            		db.collection('comments')
					.insertOne({
						topic_id: fileds.topic_id,
						content: fileds.msg,
						username: req.session.user.username,
						nickname: req.session.user.nickname,
						date: fullDate,
						timeStmp: dateFormat.getTimeStmp(),
						imgUrl: fileName,
						headImgUrl: docs[0].imgUrl
					});

					db.collection('topics').updateOne({_id: ObjectId(fileds.topic_id)}, {'$inc': {cmtNum: 1}, '$set': {upDate: fullDate}});

					res.json({
            			status: 1,
            			imgUrl: fileName,
            			headImgUrl: docs[0].imgUrl,
            			username: req.session.user.username,
            			nickname: req.session.user.nickname,
            			fullDate: fullDate
            		});

            	});

			});
		}
	});

	return router;
};