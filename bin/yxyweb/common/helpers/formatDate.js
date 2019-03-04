"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
/*日期格式化*/
var Format = exports.Format = function Format(date, format) {
    var fmt = format ? format : "yyyy-MM-dd";
    var o = {
        "M+": date.getMonth() + 1, //月份 
        "d+": date.getDate(), //日 
        "h+": date.getHours(), //小时 
        "m+": date.getMinutes(), //分 
        "s+": date.getSeconds(), //秒 
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度 
        "S": date.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
    }return fmt;
};
/*获取日期为星期几*/
var getWeek = exports.getWeek = function getWeek(date) {
    var show_day = new Array('星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六');
    var dayIndex = date.getDay();
    return show_day[dayIndex];
};
/*格式化距离*/
var formatDistance = exports.formatDistance = function formatDistance(distance) {
    var unit = 'm',
        dist = 0;
    if (distance > 1000) {
        dist = Math.ceil(distance / 1000);
        unit = 'km';
    }
    return dist + unit;
};
/*获取前一天 后一天日期*/
var getDate_type = exports.getDate_type = function getDate_type(date, type) {
    var newDate = void 0,
        newDate_milliseconds = void 0;
    if (type == 'pre') {
        newDate_milliseconds = date.getTime() - 1000 * 60 * 60 * 24;
    } else {
        newDate_milliseconds = date.getTime() + 1000 * 60 * 60 * 24;
    }
    newDate = date.setTime(newDate_milliseconds);
    newDate = new Date(newDate);
    var strYear = newDate.getFullYear();
    var strDay = newDate.getDate();
    var strMonth = newDate.getMonth() + 1;
    if (strMonth < 10) {
        strMonth = "0" + strMonth;
    }
    if (strDay < 10) {
        strDay = "0" + strDay;
    }
    var strYesterday = strYear + "-" + strMonth + "-" + strDay;
    return strYesterday;
};
/*获取月份有几天*/
var getDays = exports.getDays = function getDays(year, month) {
    var d = new Date(year, month, 0);
    return d.getDate();
};
/*日期格式化*/
var dateFormat = exports.dateFormat = function dateFormat(dateObj, fmt) {
    var date = dateObj;

    var o = {
        "M+": date.getMonth() + 1, //月份         
        "d+": date.getDate(), //日     
        "D+": date.getDate(), //日  
        "h+": date.getHours() % 12 == 0 ? 12 : date.getHours() % 12, //小时         
        "H+": date.getHours(), //小时         
        "m+": date.getMinutes(), //分         
        "s+": date.getSeconds(), //秒         
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度         
        "S": date.getMilliseconds() //毫秒         
    };
    var week = {
        "0": "日",
        "1": "一",
        "2": "二",
        "3": "三",
        "4": "四",
        "5": "五",
        "6": "六"
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear().toString() + "").substr(4 - RegExp.$1.length));
    }
    if (/(Y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear().toString() + "").substr(4 - RegExp.$1.length));
    }
    if (/(E+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length > 1 ? RegExp.$1.length > 2 ? "星期" : "周" : "") + week[date.getDay().toString() + ""]);
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k].toString() : ("00" + o[k].toString()).substr(("" + o[k].toString()).length));
        }
    }
    return fmt;
};

/* 当前时间是否在时间段内 */
var timeRange = exports.timeRange = function timeRange(beginTime, endTime) {
    var bArr = beginTime.split(':'),
        bArrLength = bArr.length;
    if (bArrLength != 3) return;
    var eArr = endTime.split(':'),
        eArrLength = eArr.length;
    if (eArrLength != 3) return;

    var nowTime = new Date().getTime();
    var b = new Date(),
        e = new Date();
    b.setHours(bArr[0]);
    b.setMinutes(bArr[1]);
    b.setSeconds(bArr[2]);
    e.setHours(eArr[0]);
    e.setMinutes(eArr[1]);
    e.setSeconds(eArr[2]);
    var beginDate = b.getTime();
    var endDate = e.getTime();
    if (beginDate < nowTime && nowTime < endDate) {
        return true;
    } else {
        return false;
    }
};
/*根据当前时间 格式化时间*/
var formatByNowDate = exports.formatByNowDate = function formatByNowDate(date) {
    var nowDate = new Date();
    var now = {
        year: nowDate.getFullYear(),
        month: nowDate.getMonth() + 1,
        day: nowDate.getDate()
    };
    var val = {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate()
    };
    if (now.year > val.year) return dateFormat(date, 'YYYY-MM');
    if (now.month == val.month && now.day == val.day) return dateFormat(date, 'HH-mm');
    if (now.month == val.month && now.day == val.day + 1) return '昨天';
    if (now.month > val.month) return dateFormat(date, 'MM-dd');
    return dateFormat(date, 'YYYY-MM-dd');
};