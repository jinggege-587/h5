(function () {
    angular
        .module('app')
        .controller('CarLinkListController', ['$scope', 'Core', CarLinkListController]);


    function CarLinkListController($scope, Core) {
        var vm = $scope;
        vm.deviceList = [];
        vm.isEmpty = false;

        var deviceMap = {};

        var processStatusList = [
            Core.Const.APP.CAR_LINK.UNLINK,
            Core.Const.APP.CAR_LINK.LINKING,
            Core.Const.APP.CAR_LINK.LINK,
        ];

        var onClickDevice;

        vm.connectDevice = connectDevice;
        vm.list = list;
        vm.getDeviceStatus = getDeviceStatus;
        vm.goBack = goBack;

        Core.on('link-again', function () {
            connectDevice(onClickDevice);
        });

        window.addEventListener('page-show', function () {
            var scanBack = Core.Data.get('scan-back');
            if (scanBack) {
                Core.Data.set('scan-back', false);
                return;
            }
            if (window.plus) {
                scanDevice();
                list();
            } else {
                document.addEventListener('plusready', function () {
                    scanDevice();
                    list();
                }, false);
            }
        });


        function scanDevice() {
            vm.isSearching = true;
            Core.$timeout(function () {
                vm.isSearching = false;
                if (!vm.deviceList || vm.deviceList.length == 0) {
                    vm.isEmpty = true;
                }
            }, 30000);
            Core.Native.BLE.scan([], 30, function (device) {
                if (device && device.name && device.name.length > 6) {
                    if (device && device.name && (device.name.substr(0, 3) == 'BD-' || device.name.substr(0, 6) == 'SEVEN-')) {
                        device.status = processStatusList[0];
                        addDevice(device);
                    }
                } else if (device && device.name && device.name.length > 3) {
                    if (device && device.name && device.name.substr(0, 3) == 'BD-') {
                        device.status = processStatusList[0];
                        addDevice(device);
                    }
                }
            });
        }

        function addDevice(device) {
            if (!device.hasOwnProperty('id')) {
                return;
            }
            var id = device.id;
            deviceMap[id] = device;
            getDeviceStatus(device);
            updateDeviceList();
        }

        function updateDeviceList() {
            var list = [];
            for (var i in deviceMap) {
                var device = deviceMap[i];
                list.push(device);
            }

            vm.deviceList = list;

            Core.$timeout(function () {
                $scope.$apply();
            });
        }

        function getDeviceStatus(device) {
            Core.Native.BLE.isConnected(device.id, function (success) {
                device.status = processStatusList[2];
                Core.Data.set(Core.Const.DATA.KEY_CURRENT_DEVICE_MAC_ADDRESS, device.id);
                Core.$timeout(function () {
                    vm.$apply();
                });
            }, function (error) {
                Core.$timeout(function () {
                    device.status = processStatusList[0];
                    Core.$timeout(function () {
                        vm.$apply();
                    });
                });
            });
        }

        function list() {
            Core.Native.BLE.list(function (deviceList) {
                for (var i in deviceList) {
                    var device = deviceList[i];
                    var id;
                    device.status = processStatusList[0];
                    if (device && device.name && device.name.length > 6) {
                        if (device && device.name && (device.name.substr(0, 3) == 'BD-' || device.name.substr(0, 6) == 'SEVEN-')) {
                            id = device.id;
                            deviceMap[id] = device;
                            getDeviceStatus(device);
                        }
                    } else if (device && device.name && device.name.length > 3) {
                        if (device && device.name && device.name.substr(0, 3) == 'BD-') {
                            id = device.id;
                            deviceMap[id] = device;
                            getDeviceStatus(device);
                        }
                    }
                }
                updateDeviceList();
            }, function () {
                console.log(arguments);
            });
        }

        function unConnectOther(device) {
            angular.forEach(vm.deviceList, function (item) {
                if (item.id != device.id && device.status == processStatusList[2]) {
                    Core.Native.BLE.disconnect(item.id, function (success) {
                        item.status = processStatusList[0];
                        Core.$timeout(function () {
                            vm.$apply();
                        })
                    }, function () {

                    })
                }
            });

        }

        function connectDevice(device) {
            if (device.status == processStatusList[2]) {
                Core.Util.showAlertDialog('车辆已连接');
                return;
            }
            onClickDevice = device;
            device.status = processStatusList[1];
            var deviceId = Core.Util.getDeviceId(device);
            Core.Api.Vehicle.checkBindUser(deviceId).then(function (responseData) {
                Core.Native.BLE.connect(device.id, function (success) {
                    if (success) {
                        Core.Data.set(Core.Const.DATA.KEY_CURRENT_DEVICE_MAC_ADDRESS, device.id);
                        Core.Data.set(Core.Const.DATA.KEY_CURRENT_DEVICE_ID, deviceId);
                        Core.Data.set(Core.Const.DATA.KEY_CAR_LINKED, true);
                        onClickDevice.status = processStatusList[2];
                        unConnectOther(onClickDevice);
                        Core.$timeout(function () {
                            Core.Util.goBack();
                        }, 100);

                    }
                }, function () {
                    device.status = processStatusList[0];
                    Core.$timeout(function () {
                        vm.$apply();
                    });
                    openModal();
                });

            }, function (err) {
                onClickDevice.status = processStatusList[0];
                if (err.code == 301) {
                    var uibModal = Core.Util.showConfirmModal('提示', '您未绑定该车辆,无权限连接', '去绑定');
                    uibModal.result.then(function () {
                        Core.Util.goToPage('barcode-scan', 'barcode.scan.html');
                    });
                } else if (err.code == 300) {
                    Core.Util.showAlertDialog('车辆被他人绑定');
                }
                else if (err.code == 5) {
                    Core.Util.showAlertDialog('无此车辆,请联系客服');
                }

            });

        }


        function openModal() {
            var uibModal = Core.$uibModal.open({
                templateUrl: 'car.dialog.car-fail-link.html',
                controller: 'DialogCarFailLinkController',
                backdrop: false,
            });

            uibModal.result.then(function () {
                //uibModal.hide();
            }, function () {
                Core.Log.d('Modal dismissed at: ' + new Date());
            });
        }

        function goBack() {
            Core.Util.goBack();
        }

        function scanResult(type, result, file) {
            if (result) {
                findVehicleAndBindUser(result);
            }
        }

        function findVehicleAndBindUser(result) {
            Core.Api.Vehicle.finVehicleByItemCode(result).then(function (responseData) {
                var vehicle = responseData.vehicle;
                var deviceId = vehicle.device_id;
                var deviceName = vehicle.device_name;
                if (deviceId.toLowerCase() == Core.Util.getDeviceId(onClickDevice).toLowerCase() && deviceName == onClickDevice.name) {
                    Core.Api.Vehicle.bindUser(deviceId).then(function (responseData) {
                        onClickDevice.status = processStatusList[1];
                        Core.Util.showAlertDialog("您成功绑定车辆");
                        Core.Native.BLE.connect(onClickDevice.id, function (success) {
                            if (success) {
                                Core.Data.set(Core.Const.DATA.KEY_CURRENT_DEVICE_MAC_ADDRESS, onClickDevice.id);
                                Core.Data.set(Core.Const.DATA.KEY_CURRENT_DEVICE_ID, deviceId);
                                Core.Data.set(Core.Const.DATA.KEY_CAR_LINKED, true);
                                onClickDevice.status = processStatusList[2];
                                Core.$timeout(function () {
                                    vm.$apply();
                                });
                                Core.$timeout(function () {
                                    Core.Util.goBack();
                                }, 100);
                            }
                        }, function () {
                            connectDeviceMax3Counts(onClickDevice.id, deviceId);
                        });
                        //Core.Api.Vehicle.linkVehicle(deviceName);
                    }, function (err) {
                        Core.Util.showAlertDialog(err.message);
                    });
                } else {
                    Core.Util.showAlertDialog("绑定失败,车辆不匹配");
                }

            }, function (err) {
                if (err.code == 5) {
                    Core.Util.showAlertDialog("无此车辆,请联系客服");
                } else if (err.code == 300) {
                    Core.Util.showAlertDialog("车辆已被绑定");
                }
            });
        }

        function connectDeviceMax3Counts(id, deviceId) {
            link(id, deviceId, 0);
            function link(id, deviceId, i) {
                i++;
                if (i == 4) {
                    return;
                }
                Core.Native.BLE.connect(id, function (success) {
                    if (success) {
                        Core.Data.set(Core.Const.DATA.KEY_CURRENT_DEVICE_MAC_ADDRESS, id);
                        Core.Data.set(Core.Const.DATA.KEY_CURRENT_DEVICE_ID, deviceId);
                        onClickDevice.status = processStatusList[2];
                        Core.$timeout(function () {
                            vm.$apply();
                        });
                        Core.$timeout(function () {
                            Core.Util.goBack();
                        }, 100);
                    }
                }, function () {
                    link(id, deviceId, i);
                });
            }

        }

        Core.$window.scanResult = scanResult;
    }
})();