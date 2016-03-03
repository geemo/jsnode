function DateFormat() {
    this.date = new Date();
}

DateFormat.prototype.getDateStr = function() {

    var month = this.date.getMonth() + 1;
    month = (month / 10) >= 1 ? month : ('0' + month);
    var day = this.date.getDate();
    day = (day / 10) >= 1 ? day : ('0' + day);

    var dateStr = this.date.getFullYear() + '-' + month + '-' + day;

    return dateStr;
};

DateFormat.prototype.getTimeStr = function() {

    var hour = this.date.getHours();
    hour = (hour / 10) >= 1 ? hour : ('0' + hour);
    var minute = this.date.getMinutes();
    minute = (minute / 10) >= 1 ? minute : ('0' + minute);

    var timeStr = hour + ':' + minute;

    return timeStr;
};

DateFormat.prototype.getFullDate = function(){
	var fullDate = this.getDateStr() + ' ' + this.getTimeStr();

	return fullDate;
};

DateFormat.prototype.getTimeStmp = function(){
	return this.date.getTime();
};

module.exports = DateFormat;
