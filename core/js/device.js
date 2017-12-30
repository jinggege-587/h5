/**
 * Created by dd on 12/26/15.
 */
(function () {
    angular
        .module('app.core')
        .factory('Device', ['$rootScope', '$window', 'Log', 'Config', 'Const', 'Util', 'Data', Device]);

    function Device($rootScope, $window, Log, Config, Const, Util, Data) {
        init();
        // var wo;

        function init() {
            if (window.plus) {
                plusReady();
            } else {
                document.addEventListener('plusready', plusReady, false);
            }

        }

        function plusReady() {
            var ws = window.plus.webview.currentWebview();
            // wo = ws.opener();
        }

        function processFrame(frame) {

            var dataLength = parseInt(frame.substring(2, 4), 16);
            var dataValue = dataLength > 0 ? frame.substring(10, 10 + parseInt(dataLength, 16) * 2) : undefined;
            var dataType = frame.substring(4, 6);
            var dataCode = frame.substring(6, 10);
            //console.log('frame-------->', frame);
            //console.log(dataLength, dataValue, dataType, dataCode);
            // var eventType = "" ;
            switch (dataType) {
                case '01'://read response
                    switch (dataCode) {
                        case '0006'://电量
                            setData(Const.DATA.TYPE_READ_ELECTRICITY, dataValue);
                            publish(Const.EVENT.TYPE_READ_ELECTRICITY, dataValue);
                            break;

                        case '0106':
                            setData(Const.DATA.TYPE_READ_ELECTRIC_MOTOR, dataValue);
                            publish(Const.EVENT.TYPE_READ_ELECTRIC_MOTOR, dataValue);
                            break;

                        case '000C':
                            setData(Const.DATA.TYPE_READ_TOTAL_MILEAGE, dataValue);
                            publish(Const.EVENT.TYPE_READ_TOTAL_MILEAGE, dataValue);
                            break;

                        case '0014':
                            setData(Const.DATA.TYPE_READ_ONCE_MILEAGE, dataValue);
                            publish(Const.EVENT.TYPE_READ_ONCE_MILEAGE, dataValue);
                            break;
                        case '0010'://速度
                            //setData(Const.DATA.TYPE_READ_SPEED, dataValue);
                            publish(Const.EVENT.TYPE_READ_SPEED, dataValue);
                            break;
                        case '0111':
                            setData(Const.DATA.TYPE_READ_BMS, dataValue);
                            publish(Const.EVENT.TYPE_READ_BMS, dataValue);
                            break;
                        case '0005':
                            setData(Const.DATA.TYPE_READ_GEAR, dataValue);
                            publish(Const.EVENT.TYPE_READ_GEAR, dataValue);
                            break;
                        case '0105':
                            setData(Const.DATA.TYPE_READ_ID, dataValue);
                            publish(Const.EVENT.TYPE_READ_ID, dataValue);
                            break;
                        case '0018':
                            setData(Const.DATA.TYPE_READ_POWER_RECYCLE, dataValue);
                            publish(Const.EVENT.TYPE_READ_POWER_RECYCLE, dataValue);
                            break;
                        case '0000':
                            setData(Const.DATA.TYPE_READ_VERSION, dataValue);
                            publish(Const.EVENT.TYPE_READ_VERSION, dataValue);
                            break;
                    }
                    break;
                case '02': // read with data response
                    switch (dataCode) {
                        case '0104':
                            setData(Const.DATA.TYPE_WRITE_UPGRADE, dataValue);
                            publish(Const.EVENT.TYPE_WRITE_UPGRADE, dataValue);
                            break;
                        case '010A':
                            setData(Const.DATA.TYPE_READ_SELF_TEST, dataValue);
                            publish(Const.EVENT.TYPE_READ_SELF_TEST, dataValue);
                            break;
                        case '0107':
                            setData(Const.DATA.TYPE_WRITE_OS_READABLE, dataValue);
                            publish(Const.EVENT.TYPE_WRITE_OS_READABLE, dataValue);
                            break;
                    }
                    break;
                case '03':
                    switch (dataCode) {
                        case '000A':
                            setData(Const.DATA.TYPE_READ_LOCK, dataValue);
                            publish(Const.EVENT.TYPE_READ_LOCK, dataValue);
                            break;
                        case '0000':
                            setData(Const.DATA.TYPE_READ_GEAR, dataValue);
                            publish(Const.EVENT.TYPE_READ_GEAR, dataValue);
                            break;
                    }
                    break;
                case '04':// write response
                    switch (dataCode) {
                        case '0000':
                            setData(Const.DATA.TYPE_WRITE_GEAR, dataValue);
                            publish(Const.EVENT.TYPE_WRITE_GEAR, dataValue);
                            break;
                        case '000A':
                            setData(Const.DATA.TYPE_WRITE_LOCK, dataValue);
                            publish(Const.EVENT.TYPE_WRITE_LOCK, dataValue);
                            break;
                    }
                    break;

            }
        }

        function processUpgradeFrame(frame) {
            publish(Const.EVENT.TYPE_UPGRADE, frame);
        }

        function processUpgradeErrorFrame(frame){
            publish(Const.EVENT.TYPE_ERROR_UPGRADE, frame);
        }

        // key: device-power, value: time:14349038

        function getRealKey(deviceId, key) {
            return 'DEVICE:' + deviceId + ':' + key;
        }

        function getLatestData(key, maxSeconds, id) {
            var deviceId = id ? id : Data.get(Const.DATA.KEY_CURRENT_DEVICE_MAC_ADDRESS);
            if (!deviceId) {
                return null;
            }
            var realKey = getRealKey(deviceId, key);
            var data = Data.get(realKey);
            if (!data) {
                return null;
            }

            data = '' + data;

            var parts = data.split(':');
            if (parts.length != 2) {
                return null;
            }

            var time = parts[0];
            var realData = parts[1];
            var now = Util.time();
            maxSeconds = maxSeconds ? maxSeconds : 3;
            if (now - time > maxSeconds) {
                return null;
            }

            return realData;
        }

        function setData(key, value) {
            var deviceId = Data.get(Const.DATA.KEY_CURRENT_DEVICE_MAC_ADDRESS);
            if (!deviceId) {
                return null;
            }

            var time = Util.time();
            var realKey = getRealKey(deviceId, key);

            Data.set(realKey, time + ':' + value);
        }

        function publish(eventName, data) {
            return $rootScope.$broadcast(eventName, data);
        }

        function makeFrame(type, data) {
            var frameData = '0C01';
            var commandData = '';
            switch (type) {
                case Const.FRAME.TYPE_READ_ELECTRICITY:
                    commandData = '01 00 06 03';
                    break;
                case Const.FRAME.TYPE_READ_ELECTRIC_MOTOR:
                    commandData = '01 01 06 04';
                    break;
                case Const.FRAME.TYPE_READ_GEAR:
                    // commandData = '01 00 05 01';
                    commandData = '03 00 00 01';
                    break;
                    break;
                case Const.FRAME.TYPE_WRITE_GEAR:
                    commandData = '04 00 00 ' + data;
                    break;
                case Const.FRAME.TYPE_READ_TOTAL_MILEAGE:
                    commandData = '01 00 0C 04';
                    break;
                case Const.FRAME.TYPE_READ_ONCE_MILEAGE:
                    commandData = '01 00 14 04';
                    break;
                case Const.FRAME.TYPE_READ_SPEED:
                    commandData = '01 00 10 04';
                    break;
                case Const.FRAME.TYPE_READ_LOCK:
                    commandData = '03 00 0A 01';
                    break;
                case Const.FRAME.TYPE_WRITE_LOCK:
                    commandData = '04 00 0A ' + data;
                    break;
                case Const.FRAME.TYPE_WRITE_UPGRADE:
                    commandData = '02 01 04 ' + data;
                    break;
                case Const.FRAME.TYPE_READ_BMS:
                    commandData = '01 01 11 01';
                    break;
                case Const.FRAME.TYPE_READ_ID:
                    commandData = '01 01 05 12';
                    break;
                case Const.FRAME.TYPE_WRITE_OS_READABLE:
                    commandData = '02 01 07 01';
                    break;
                case Const.FRAME.TYPE_READ_POWER_RECYCLE:
                    commandData = '01 00 18 01';
                    break;
                case Const.FRAME.TYPE_READ_VERSION:
                    commandData = '01 00 00 04';
                    break;
            }
            if (!commandData) {
                return null;
            }

            commandData = commandData.replace(/\s/g, '');
            frameData += commandData;
            frameData = frameData + crc(frameData).toString(16);
            //if (type == Const.FRAME.TYPE_READ_ELECTRICITY) {
            //    console.log("frameData", frameData);
            //}
            return frameData.toUpperCase();
        }

        function crc(hexData) {
            var crc = 0xffff;

            for (var i = 0; i < parseInt(hexData.length / 2); i++) {
                var byte = parseInt(hexData.substring(i * 2, i * 2 + 2), 16);
                crc = crc ^ (byte & 0xff);
                for (var j = 0; j < 8; j++) {
                    if ((crc & 0x0001) != 0) {
                        crc = (crc >> 1) ^ 0xa001;
                    }
                    else {
                        crc = crc >> 1;
                    }
                }
            }

            return crc & 0xffff;
        }

        return {
            processFrame: processFrame,
            processUpgradeFrame: processUpgradeFrame,
            processUpgradeErrorFrame: processUpgradeErrorFrame,
            getLatestData: getLatestData,
            makeFrame: makeFrame,
        };
    }
})();