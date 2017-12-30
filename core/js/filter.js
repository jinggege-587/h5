(function () {
    angular
        .module('app.core')
        .filter('digitLength', ['Core', DigitLength])
        .filter('timeFormat', ['Core', timeFormat])
        .filter('tripTime', ['Core', tripTime])
        .filter('rideTime', ['Core', rideTime])
        .filter('idFilter', ['Core', idFilter])
        .filter('rideHour', ['Core', rideHour])
        .filter('rideMinute', ['Core', rideMinute])
        .filter('tripFloat2', ['Core', tripFloat2])
    ;

    function tripFloat2(Core) {
        return function (data) {
            if (!data || isNaN(data)) {
                return 0;
            }
            return parseFloat(data) % 1 == 0 ? data : Core.Util.sprintf('%.2f', data);
        }
    }

    function DigitLength(Core) {
        return function (data, length) {
            return Core.Util.sprintf('%0' + length + 'd', data);
        }
    }

    function timeFormat(Core) {
        return function (timeStamp, format) {
            if (!parseInt(timeStamp)) return "";
            format = format ? format : 'Y/m/d  h:i:s';
            return Core.Util.date(format, timeStamp);
        };
    }

    function rideHour(Core) {
        return function (timeStamp) {
            if (!timeStamp) {
                return 0;
            }
            return parseInt(timeStamp / 1000 / 3600);
        };
    }

    function rideMinute(Core) {
        return function (timeStamp) {
            if (!timeStamp) {
                return 0;
            }
            return parseInt(timeStamp / 1000 % 3600 / 60);
        };
    }

    function tripTime(Core) {
        return function (timeStamp) {
            if (!timeStamp) {
                return 0 + "h’" + 0 + "m";
            }
            var hour = parseInt(timeStamp / 3600);
            var minute = parseInt(timeStamp % 3600 / 60);
            return hour + "h’" + minute + "m";
        };
    }

    function rideTime(Core) {
        return function (time) {
            var totalS = parseInt(time / 1000);
            var s, m, h;
            if (totalS < 60 * 100) {
                s = Core.Util.sprintf('%02d', totalS % 60);
                m = Core.Util.sprintf('%02d', parseInt(totalS / 60));
                return m + ":" + s;
            } else {
                m = Core.Util.sprintf('%02d', parseInt(totalS % 3600 / 60));
                h = Core.Util.sprintf('%02d', parseInt(totalS / 3600));
                return h + ":" + m;
            }


        };
    }

    function idFilter(Core) {
        return function (id) {
            if (id && id.indexOf("-") != -1) {
                var strArray = id.split("-");
                return strArray[strArray.length - 1];
            }
            return id;

        };
    }

})();