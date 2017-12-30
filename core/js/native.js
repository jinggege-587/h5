/**
 * Created by dd on 12/26/15.
 */
(function () {
    angular
        .module('app.core')
        .factory('Native', ['$window', 'Log', 'Config', 'Const', 'Native.BLE', 'Native.Core', Native]);

    function Native($window, Log, Config, Const, BLE, Core)
    {
        return {
            BLE: BLE,
            Core: Core
        }
    }
})();