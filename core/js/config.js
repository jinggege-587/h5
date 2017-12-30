/**
 * Created by dd on 12/26/15.
 */
(function () {
    angular
        .module('app.core')
        .factory('Config', ['Const', Config]);

    function Config(Const) {

        var Core = {
            LOG_LEVEL: Const.SYSTEM.LOG_LEVEL_DEBUG,

            DateFormatNoTime: 'Y.m.d',
            DateFormatNoYear: 'm-d H:i',

            ROUTE_LIST_GUEST_CAN_VISIT: ['hello', 'home#login', 'home#wx'],
            LOGIN_ROUTE: 'demo#login',

            isInDebug: isInDebug,

        };
        return Core;

        function isInDebug() {
            return Core.LOG_LEVEL == Const.SYSTEM.LOG_LEVEL_DEBUG;
        }

    }
})();