/**
 * Created by dd on 12/26/15.
 */
(function () {
    angular
        .module('app.core')
        .factory('Native.BLE', ['$rootScope', '$window', 'Log', 'Config', 'Const', 'Util', 'Data', 'Device', BLE]);

    function BLE($rootScope, $window, Log, Config, Const, Util, Data, Device) {
        init();


        function init() {
            if (window.plus) {
                plusReady();
            } else {
                document.addEventListener('plusready', plusReady, false);
            }
        }

        function plusReady() {
            // addResponseListener();
        }

        function execute(args, success, fail) {
            var Bridge = window.plus.bridge;
            var callbackID = Bridge.callbackId(success, fail);
            return Bridge.exec('DIX.BLE', "execute", [callbackID, args]);
        }

        function capture(success, fail) {
            execute(['capture'], success, fail);
        }

        function scan(service, second, success, fail) {
            execute(['scan', service, second], success, fail);
        }

        function startScan(service, success, fail) {
            execute(['startScan', service], success, fail);
        }

        function startScanWithOptions(service, option, success, fail) {
            execute(['startScanWithOptions', service, option], success, fail);
        }

        function stopScan(success, fail) {
            execute(['stopScan'], success, fail);
        }

        function list(success, fail) {
            execute(['list'], success, fail);
        }

        function connect(deviceId, success, fail) {
            execute(['connect', deviceId], success, fail);
        }

        function disconnect(deviceId, success, fail) {
            execute(['disconnect', deviceId], success, fail);
        }

        function isEnabled(success, fail) {
            execute(['isEnabled'], success, fail);
        }

        function isConnected(deviceId, success, fail) {
            execute(['isConnected', deviceId], success, fail);
        }

        function enable(success, fail) {
            execute(['enable',], success, fail);
        }

        function write(deviceId, data, success, fail, isCanWrite) {
            if (!isCanWrite) {
                var isOnUpgrade = Data.get(Const.EVENT.ON_UPGRADE);
                if (isOnUpgrade) {
                    return;
                }
            }
            Log.d("write==>: " + deviceId, data);
            execute(['write', deviceId, "ffe5", "ffe9", data], function () {
                if (typeof success == "function") {
                    success();
                }

                //Log.i('write success');
            }, function () {
                if (typeof fail == "function") {
                    fail();
                }
                Log.e('write fail');
            });
        }

        function writeForUpgrade(deviceId, data, success, fail) {
            write(deviceId, data, success, fail, true);
        }

        function read(deviceId, success, fail) {
            execute(['read', deviceId, "180a", "2a23"], success, fail);
        }

        function startNotification(deviceId, success, fail) {
            execute(['startNotification', deviceId, "180f", "2a19"], success, fail);
        }

        function addResponseListener() {
            //Log.d('addResponseListener');
            execute(['addResponseListener'], writeResponseDataHandler, function () {
                //Log.e('addResponseListener fail');
            });
        }

        function writeResponseDataHandler(data) {
            Log.i('writeResponseDataHandler', data);
            Log.i(arguments);
            if (data && parseInt(data.length / 2) < 2) {
                Device.processUpgradeFrame(data);
            } else if (data && data.substring(0, 2) == '18') {
                Device.processUpgradeErrorFrame(data);
            } else {
                Device.processFrame(data);
            }
        }

        window.addEventListener('page-show', function () {
            addResponseListener();
        }, false);

        window.addEventListener('show', function () {
            addResponseListener();
        }, false);


        return {
            init: init,
            capture: capture,
            scan: scan,
            startScan: startScan,
            startScanWithOptions: startScanWithOptions,
            stopScan: stopScan,
            list: list,
            connect: connect,
            disconnect: disconnect,
            isEnabled: isEnabled,
            isConnected: isConnected,
            enable: enable,
            write: write,
            writeForUpgrade: writeForUpgrade,
            read: read,
            startNotification: startNotification,
            addResponseListener: addResponseListener,
        };
    }
})();