/**
 * Created by dd on 12/26/15.
 */
(function () {
    angular
        .module('app.core')
        .factory('Core', ['$rootScope', '$window', '$document', '$q', '$timeout', '$interval', '$filter', 'Config', 'Const', 'Log', 'Util', 'Data', 'Api', '$uibModal', 'Native', 'Device', 'Map', Core]);

    function Core($rootScope, $window, $document, $q, $timeout, $interval, $filter, Config, Const, Log, Util, Data, Api, $uibModal, Native, Device, Map) {
        var Core = {
            init: init,
            on: on,
            publish: publish,

            $window: $window,
            $document: $document,
            $q: $q,
            $timeout: $timeout,
            $interval: $interval,
            $filter: $filter,

            Config: Config,
            Const: Const,
            Log: Log,
            Util: Util,
            Data: Data,
            Api: Api,
            $uibModal: $uibModal,
            Native: Native,
            Device: Device,
            Map: Map
        };

        $window.Core = Core;

        return Core;

        function init() {
            // if (Data.isGuest() && !Util.canGuestVisit())
            // {
            //     Util.goToRoute(Config.LOGIN_ROUTE);
            // }
        }

        function on(eventName, callback) {
            return $rootScope.$on(eventName, callback);
        }

        function publish(eventName, data) {
            return $rootScope.$broadcast(eventName, data);
        }

    }
})();