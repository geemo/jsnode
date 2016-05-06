var path = require('path');

module.exports = {
	mongo_url: 'mongodb://jsnode:Wmeiyoumima@localhost:27017/jsnode',
	redis_url: 'redis://:Wmeiyoumima@127.0.0.1:6379/0',
	redis_session_url: 'redis://:Wmeiyoumima@127.0.0.1:6379/1',
	pic_dir: path.join(__dirname, '/public/pictures'),
	img_dir: path.join(__dirname, '/public/images'),
	port: '80',
	secret: 'jsnode'
}
