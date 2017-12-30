/**
 * Created by dd on 12/26/15.
 */
(function(){
    angular
        .module('app.core')
        .factory('Log', ['Config', 'Const', Log]);

    function Log(Config, Const) {
        const LevelMap = {
            error: Const.SYSTEM.LOG_LEVEL_ERROR,
            warn: Const.SYSTEM.LOG_LEVEL_WARN,
            info: Const.SYSTEM.LOG_LEVEL_INFO,
            trace: Const.SYSTEM.LOG_LEVEL_TRACE,
            debug: Const.SYSTEM.LOG_LEVEL_DEBUG
        };

        return {
            debug: debug,
            d: debug,

            info: info,
            i: info,

            warn: warn,
            w: warn,

            error: error,
            e: error,

            trace: trace,
            t: trace
        };

        function getLevelName(level)
        {
            for (var i in LevelMap)
            {
                if (LevelMap.hasOwnProperty(i))
                {
                    var l = LevelMap[i];
                    if (l == level)
                    {
                        return i;
                    }
                }
            }

            return '';
        }

        function rawLog()
        {
            var args = Array.prototype.slice.call(arguments);
            var level = args.shift();
            var levelName = getLevelName(level);

            if (level > Config.LOG_LEVEL)
            {
                return;
            }

            args.unshift('[' + levelName.toUpperCase() + ']');
            args.unshift(new Date().toString());
            console.log.apply(console, args);
        }

        function debug(){
            var args = Array.prototype.slice.call(arguments);
            args.unshift(Const.SYSTEM.LOG_LEVEL_DEBUG);
            rawLog.apply(null, args);
        }

        function trace(){
            var args = Array.prototype.slice.call(arguments);
            args.unshift(Const.SYSTEM.LOG_LEVEL_TRACE);
            rawLog.apply(null, args);
        }

        function info(){
            var args = Array.prototype.slice.call(arguments);
            args.unshift(Const.SYSTEM.LOG_LEVEL_INFO);
            rawLog.apply(null, args);
        }

        function warn(){
            var args = Array.prototype.slice.call(arguments);
            args.unshift(Const.SYSTEM.LOG_LEVEL_WARN);
            rawLog.apply(null, args);
        }

        function error(){
            var args = Array.prototype.slice.call(arguments);
            args.unshift(Const.SYSTEM.LOG_LEVEL_ERROR);
            rawLog.apply(null, args);
        }
    }

})();