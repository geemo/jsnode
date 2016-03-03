var minute = 1000 * 60;
var hour = minute * 60;
var day = hour * 24;
var month = day * 30;

module.exports = function(dateTimeStamp){
	var now = new Date().getTime();
	var diffValue = now - dateTimeStamp;

	if(diffValue < 0){
		throw new Error('Wrong value');
	}

	var yearC = diffValue / (7 * month);
	var monthC = diffValue / month;
	var weekC = diffValue / (7 * day);
	var dayC = diffValue / day;
	var hourC = diffValue / hour;
	var minC = diffValue / minute;

	if(yearC >= 1){
		return parseInt(yearC) + "年前";
	}else if(monthC >= 1){
		return parseInt(monthC) + "个月前";
	}else if(weekC >= 1){
		return parseInt(weekC) + "周前";
	}else if(dayC >= 1){
		return parseInt(dayC) + "天前";
	}else if(hourC >= 1){
		return parseInt(hourC) + "小时前";
	}else if(minC >= 1){
		return parseInt(minC) + "分钟前";
	}else{
		return "刚刚";
	}
}