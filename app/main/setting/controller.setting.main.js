(function () {
    angular
        .module('app')
        .controller('SettingMainController', ['$scope', 'Core', SettingMainController]);


    function SettingMainController($scope, Core) {
        var vm = $scope;
        var dumpEnergy;
        vm.settoggle = true;
        vm.gear = 1;
        var linkedCarId = Core.Data.get(Core.Const.DATA.KEY_CURRENT_DEVICE_MAC_ADDRESS);
        vm.showMask = false;
        vm.electricMotorError = {value: false, dec: '电机正常'};
        vm.bmsError = {value: false, desc: '电池正常'};
        vm.electricMotorCheck = false;
        vm.bmsCheck = false;
        var hardwareVersion = -1, softwareVersion = [];

        vm.open = openModal;
        vm.toggleTitle = toggleTitle;
        vm.changeGear = changeGear;
        vm.upgrade = upgrade;
        vm.startDetect = startDetect;

        if (window.plus) {
            getCarBleInfo();
            getCarInitInfo();
        } else {
            document.addEventListener('plusready', function () {
                getCarBleInfo();
                getCarInitInfo();
            }, false);
        }

        window.addEventListener('page-show', function () {
            linkedCarId = Core.Data.get(Core.Const.DATA.KEY_CURRENT_DEVICE_MAC_ADDRESS);
        });


        function openModal() {
            var modalInstance = Core.$uibModal.open({
                templateUrl: 'sport.dialog.sport.stop.html',
                controller: 'DialogStopController'
            });

            modalInstance.result.then(function () {

            }, function () {
            });
        }

        function toggleTitle(flag) {
            vm.settoggle = flag;
        }

        function changeGear(gear) {
            Core.Util.showLoading();
            linkedCarId = Core.Data.get(Core.Const.DATA.KEY_CURRENT_DEVICE_MAC_ADDRESS);
            //vm.gear = gear;
            var data = '0' + gear;
            if (gear == 1) {
                Core.Native.BLE.write(linkedCarId, Core.Device.makeFrame(Core.Const.FRAME.TYPE_WRITE_LOCK, '00'));
                Core.$timeout(function () {
                    Core.Native.BLE.write(linkedCarId, Core.Device.makeFrame(Core.Const.FRAME.TYPE_READ_LOCK));
                }, 100);
                Core.$timeout(function () {
                    Core.Util.hideLoading();
                }, 1500);
                return;
            }
            Core.Native.BLE.write(linkedCarId, Core.Device.makeFrame(Core.Const.FRAME.TYPE_WRITE_LOCK, 'ff'));
            Core.Native.BLE.write(linkedCarId, Core.Device.makeFrame(Core.Const.FRAME.TYPE_WRITE_GEAR, data));
            Core.$timeout(function () {
                Core.Native.BLE.write(linkedCarId, Core.Device.makeFrame(Core.Const.FRAME.TYPE_READ_LOCK));
                Core.Native.BLE.write(linkedCarId, Core.Device.makeFrame(Core.Const.FRAME.TYPE_READ_GEAR));
            }, 100);

            Core.$timeout(function () {
                Core.Util.hideLoading();
            }, 1500);
        }

        function getCarBleInfo() {
            Core.Native.BLE.write(linkedCarId, Core.Device.makeFrame(Core.Const.FRAME.TYPE_READ_GEAR));
        }

        function getCarInitInfo() {
            var lock = Core.Data.get(Core.Const.CAR_INIT.LOCK);
            var gear = Core.Data.get(Core.Const.CAR_INIT.SPEED_GEAR);
            vm.gear = lock == '00' ? 1 : gear;
        }


        Core.on(Core.Const.EVENT.TYPE_READ_GEAR, function () {
            var data = Core.Device.getLatestData(Core.Const.DATA.TYPE_READ_GEAR);
            vm.gear = data.substring(1, 2);
            //console.log('速度档位', vm.gear);
            Core.Util.hideLoading();
            Core.Data.set(Core.Const.CAR_INIT.SPEED_GEAR, vm.gear);
            Core.$timeout(function () {
                vm.$apply();
            });
        });


        function upgrade() {
            linkedCarId = Core.Data.get(Core.Const.DATA.KEY_CURRENT_DEVICE_MAC_ADDRESS);
            Core.Native.BLE.isConnected(linkedCarId, function (success) {
                vm.showMask = true;
                Core.$timeout(function () {
                    vm.showMask = false;
                }, 2000);
                Core.Native.BLE.write(linkedCarId, Core.Device.makeFrame(Core.Const.FRAME.TYPE_READ_VERSION));
                //Core.Util.goToPage('setting-upgrade', 'setting.upgrade.html');
            }, function (err) {
                Core.Util.showAlertDialog('别急,请先连接车辆');
            });
        }

        function getNewestHardwareInfo() {
            console.log('hardwareVersion',hardwareVersion);
            Core.Api.App.getNewestHardWareInfo(parseInt(hardwareVersion)).then(function (responseData) {
                var data = responseData.upgrade;
                var version1 = data.software_version1;
                var version2 = data.software_version2;
                var version3 = data.software_version3;
                var downLoadUrl = data.down_load_url;
                if (!compareVersion(version1, version2, version3, softwareVersion[0], softwareVersion[1], softwareVersion[2])) {
                    vm.showMask = false;
                    Core.Util.showAlertDialog('暂无检测到最新固件');
                } else {
                    Core.Util.goToPage("setting-upgrade", "setting.upgrade.html", null, {
                        software_version: version1 + "." + version2 + "." + version3,
                        down_load_url: downLoadUrl
                    });
                }
            }, function (err) {
                vm.showMask = false;
                Core.Util.showAlertDialog('暂无检测到最新固件');
            });
        }

        function compareVersion(version1, version2, version3, oldVersion1, oldVersion2, oldVersion3) {
            if (version1 > oldVersion1) {
                return true;
            } else if (version1 == oldVersion1) {
                if (version2 > oldVersion2) {
                    return true;
                } else if (version2 == oldVersion2) {
                    return version3 > oldVersion3
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }


        function startDetect() {
            vm.showMask = true;
            Core.Native.BLE.write(linkedCarId, Core.Device.makeFrame(Core.Const.FRAME.TYPE_WRITE_OS_READABLE));
            selfTest();
            Core.$timeout(function () {
                vm.showMask = false;
            }, 2000);
        }

        function selfTest() {
            //vm.electricMotorCheck = false;
            //vm.bmsCheck = false;
            var connectStatus = Core.Data.get("connect_status");
            if (connectStatus != Core.Const.CONNECT_STATUS.CONNECTED) {
                vm.bmsCheck = false;
                vm.electricMotorCheck = false;
                Core.Util.showAlertDialog("检测失败,连接已断开");
                return;
            }
            linkedCarId = Core.Data.get(Core.Const.DATA.KEY_CURRENT_DEVICE_MAC_ADDRESS);
            var data = Core.Device.getLatestData(Core.Const.DATA.TYPE_READ_ELECTRICITY, 60);
            dumpEnergy = data ? parseInt(data.substring(0, 2), 16) + "%" : "0%";
            //console.log('电量', dumpEnergy);
            Core.Native.BLE.write(linkedCarId, Core.Device.makeFrame(Core.Const.FRAME.TYPE_READ_ELECTRIC_MOTOR));
            Core.Native.BLE.write(linkedCarId, Core.Device.makeFrame(Core.Const.FRAME.TYPE_READ_BMS));
        }

        Core.on(Core.Const.EVENT.TYPE_READ_VERSION, function () {
            var data = Core.Device.getLatestData(Core.Const.DATA.TYPE_READ_VERSION);
            hardwareVersion = data.substring(0, 2);
            softwareVersion = [data.substring(2, 4), data.substring(4, 6), data.substring(6, 8)];
            getNewestHardwareInfo();
        });

        Core.on(Core.Const.EVENT.TYPE_READ_LOCK, function () {
            var data = Core.Device.getLatestData(Core.Const.DATA.TYPE_READ_LOCK);
            vm.gear = data == '00' ? 1 : vm.gear;
            //console.log('当前锁', data);
            Core.Util.hideLoading();
            Core.Data.set(Core.Const.CAR_INIT.LOCK, data);
            Core.$timeout(function () {
                vm.$apply();
            })
        });

        Core.on(Core.Const.EVENT.TYPE_READ_ELECTRIC_MOTOR, function () {
            var data = Core.Device.getLatestData(Core.Const.DATA.TYPE_READ_ELECTRIC_MOTOR);
            //console.log('电机info', data);
            if (data == undefined) {
                return;
            }
            var error1 = data.substring(0, 2);
            var error2 = data.substring(2, 4);
            var error3 = data.substring(4, 6);
            var error4 = data.substring(6, 8);
            var errorStr1 = Core.Util.electricMotorErrorCheck(error1) ? Core.Util.electricMotorErrorCheck(error1) + "," : "";
            var errorStr2 = Core.Util.electricMotorErrorCheck(error2) ? Core.Util.electricMotorErrorCheck(error2) + "," : "";
            var errorStr3 = Core.Util.electricMotorErrorCheck(error3) ? Core.Util.electricMotorErrorCheck(error3) + "," : "";
            var errorStr4 = Core.Util.electricMotorErrorCheck(error4) ? Core.Util.electricMotorErrorCheck(error4) + "," : "";
            var errorStr = errorStr1 + errorStr2 + errorStr3 + errorStr4;
            vm.electricMotorCheck = true;
            Core.$timeout(function () {
                if (data == '00000000') {
                    vm.electricMotorError = {value: false, dec: '电机正常'};
                } else {
                    vm.electricMotorError = {value: true, dec: errorStr.substring(0, errorStr.length - 1)};
                }
                if (vm.bmsCheck) {
                    vm.showMask = false;
                }
                console.log('showMask', vm.showMask);
                vm.$apply();
            }, 2000);
        });

        Core.on(Core.Const.EVENT.TYPE_READ_BMS, function () {

            var data = Core.Device.getLatestData(Core.Const.DATA.TYPE_READ_BMS);
            //console.log('电池info', data);

            if (data == 'undefined') {
                vm.bmsError = {value: false, dec: '电池电量剩余' + dumpEnergy};
                vm.bmsCheck = true;
                Core.$timeout(function () {
                    if (vm.electricMotorCheck) {
                        vm.showMask = false;
                    }
                    vm.$apply();
                }, 2000);
            } else {
                var errorStr = Core.Util.bmsErrorCheck(data);
                vm.bmsCheck = true;
                Core.$timeout(function () {
                    if (data == '00') {
                        vm.bmsError = {value: false, dec: '电池电量剩余' + dumpEnergy};
                    } else {
                        vm.bmsError = {value: true, dec: errorStr.substring(0, errorStr.length)};
                    }
                    if (vm.electricMotorCheck) {
                        vm.showMask = false;
                    }
                    vm.$apply();
                }, 2000);
            }
        });

    }
})();