/**
 * Created by dd on 12/26/15.
 */
(function () {
    angular
        .module('app.core')
        .factory('Native.Core', ['$rootScope', '$window', 'Log', 'Config', 'Const', 'Util', 'Data', 'Device', Core]);

    function Core($rootScope, $window, Log, Config, Const, Util, Data, Device) {
        init();

        function init() {
            if (window.plus) {
                plusReady();
            } else {
                document.addEventListener('plusready', plusReady, false);
            }
        }

        function plusReady() {
        }

        function execute(args, success, fail) {
            var Bridge = window.plus.bridge;
            var callbackID = Bridge.callbackId(success, fail);
            return Bridge.exec('DIX.Core', "execute", [callbackID, args]);
        }

        function fs(path, success, fail) {
            if (!path) {
                path = "";
            }
            execute(['fs', path], success, fail);
        }

        function startTouchScreen() {
            execute(['startTouchScreen'], function () {
            }, function () {
            });
        }

        function cancelTouchScreen() {
            console.log('cancel');
            execute(['cancelTouchScreen'], function () {
            }, function () {
            });
        }

        return {
            init: init,
            fs: fs,
            startTouchScreen: startTouchScreen,
            cancelTouchScreen: cancelTouchScreen,
        };
    }
})();