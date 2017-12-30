(function () {
    angular
        .module('app')
        .controller('CarMainController', ['$scope', 'Core', '$q', CarMainController]);


    function CarMainController($scope, Core, $q) {
        var vm = $scope;
        var firstPageLoad = true;
        vm.isEmpty = false;
        vm.isShowTip = false;

        vm.linkDevice = linkDevice;
        vm.openScanPage = openScanPage;
        vm.openListPage = openListPage;
        //Confirm
        vm.delete = disConnect;
        //Alert
        vm.cancelTip = cancelTip;

        vm.totalMeilage = 0;
        vm.totalHour = 0;
        vm.totalMinute = 0;
        vm.totalTime = 0;
        vm.powerLabel = "";
        vm.power = "0%";
        vm.selectedModel = "";

        var stopScan = false;
        var deviceList = [];
        var deviceMap = {};
        var getElectricityInterval;
        var linkedDeviceBleId;
        var bindDevice, bindDeviceId, bindDeviceName, bindVehicle;

        var processStatusList = [
            {value: Core.Const.APP.CAR_LINK.UNLINK, name: '连接车辆'},
            {value: Core.Const.APP.CAR_LINK.LINKING, name: '车辆连接中...'},
            {value: Core.Const.APP.CAR_LINK.LINK, name: '车辆已连接'}
        ];

        vm.processStatus = processStatusList[0];


        Core.on('link-again', function () {
            linkDevice();
        });


        setSlideListener();
        scanIsLinked();

        window.addEventListener('page-show', function () {
            vm.isShowTip = false;
            if (window.plus) {
                scanDevice();
            } else {
                document.addEventListener('plusready', function () {
                    scanDevice();
                });
            }
            linkedDeviceBleId = Core.Data.get(Core.Const.DATA.KEY_CURRENT_DEVICE_MAC_ADDRESS);
            getBinderVehicle().then(function () {
                checkDeviceIsConnected();
                firstAutoLink();
            });
        });

        function firstAutoLink() {
            if (firstPageLoad) {
                Core.Util.showLoading();
                firstPageLoad = false;
                if (!vm.binderVehicleList || vm.binderVehicleList.length == 0) {
                    Core.Util.hideLoading();
                    //var uibModal = Core.Util.showConfirmModal('提示', '您还未绑定过车辆,请先去绑定', '去绑定');
                    //uibModal.result.then(function () {
                    //    Core.Util.goToPage('barcode-scan', 'barcode.scan.html');
                    //});
                    return;
                }
                Core.$timeout(function () {
                    connectDeviceMaxSixCounts(0);
                }, 1000);
            }
        }

        function connectDeviceMaxSixCounts(i) {
            if (i > 5) {
                Core.Util.hideLoading();
                var uibModal = Core.Util.showConfirmModal("提示", "未扫描到车辆,去连接列表看看吧", "去看看");
                uibModal.result.then(function () {
                    openListPage();
                });
                return;
            }
            for (var k in vm.binderVehicleList) {
                for (var j in deviceList) {
                    if (deviceList[j].name == vm.binderVehicleList[k].device_name) {
                        connect(vm.binderVehicleList[k]);
                        Core.Util.hideLoading();
                        return;
                    }
                }
            }
            i++;
            Core.$timeout(function () {
                connectDeviceMaxSixCounts(i);
            }, 1000);
        }

        function linkDevice() {
            if (vm.processStatus.value == processStatusList[0].value) {
                Core.Util.showLoading();
                checkBindUser();
            } else if (vm.processStatus.value == processStatusList[2].value) {
                openDisConnectDeviceModal();
            }
        }

        function scanDevice() {
            deviceList = [];
            Core.Native.BLE.scan([], 10, function (device) {
                if (device && device.name && device.name.length > 6) {
                    if (device && device.name && (device.name.substr(0, 3) == 'BD-' || device.name.substr(0, 6) == 'SEVEN-')) {
                        addDevice(device);
                    }
                } else if (device && device.name && device.name.length > 3) {
                    if (device && device.name && device.name.substr(0, 3) == 'BD-') {
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
            updateDeviceList();
        }

        function updateDeviceList() {
            var list = [];
            for (var i in deviceMap) {
                var device = deviceMap[i];
                list.push(device);
            }
            deviceList = list;
        }

        function openListPage() {
            Core.Util.goToPage('car-link-list', 'car.link.list.html');
        }

        function checkDeviceIsConnected() {
            linkedDeviceBleId = Core.Data.get(Core.Const.DATA.KEY_CURRENT_DEVICE_MAC_ADDRESS);
            var deviceId = Core.Data.get(Core.Const.DATA.KEY_CURRENT_DEVICE_ID);
            if (linkedDeviceBleId && linkedDeviceBleId != "null") {
                Core.Native.BLE.isConnected(linkedDeviceBleId, function (success) {
                    Core.$timeout(function () {
                        getElectricity();
                        getDeviceGearAndLock();
                    }, 500);
                    if (!getElectricityInterval) {
                        getElectricityInterval = Core.$interval(getElectricity, 10000);
                    }
                    vm.binderVehicleList.map(function (item) {
                        if (deviceId && item.device_id == deviceId) {
                            vm.selectedModel = item;
                        }
                    });
                    vm.processStatus = processStatusList[2];
                    Core.$timeout(function () {
                        vm.$apply();
                    });
                }, function () {
                    vm.processStatus = processStatusList[0];
                    vm.selectedModel = vm.binderVehicleList[0];
                    Core.$timeout(function () {
                        vm.$apply();
                    });
                });
            }
        }

        function getElectricity() {
            Core.Native.BLE.write(linkedDeviceBleId, Core.Device.makeFrame(Core.Const.FRAME.TYPE_READ_ELECTRICITY));
        }

        function openDisConnectDeviceModal() {
            var uibModal = Core.Util.showConfirmModal('提示', '确定要断开连接吗?', '断开');
            uibModal.result.then(function () {
                Core.Data.set(Core.Const.KEY_CAR_LINKED, false);
                Core.Data.set(Core.Const.DATA.KEY_CURRENT_DEVICE_MAC_ADDRESS, "");
                Core.Data.set(Core.Const.DATA.KEY_CURRENT_DEVICE_ID, "");
                disConnect();
            });
        }

        function disConnect() {
            Core.Native.BLE.disconnect(linkedDeviceBleId, function (success) {
                getBinderVehicle();
                vm.processStatus = processStatusList[0];
                vm.powerLabel = "";
                vm.power = "0%";
                Core.$timeout(function () {
                    vm.$apply();
                });
                if (getElectricityInterval) {
                    Core.$interval.cancel(getElectricityInterval);
                }
            }, function () {
                Core.$timeout(function () {
                    vm.$apply();
                });
            })
        }

        function checkBindUser() {
            if (!vm.selectedModel) {
                Core.Util.hideLoading();
                var uibModal = Core.Util.showConfirmModal('提示', '您还未绑定过车辆,请先去绑定', '去绑定');
                uibModal.result.then(function () {
                    Core.Util.goToPage('barcode-scan', 'barcode.scan.html');
                });
                return;
            }
            Core.Api.Vehicle.checkBindUser(vm.selectedModel.device_id).then(function () {
                connect(vm.selectedModel);
            }, function (err) {
                Core.Util.hideLoading();
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

        function cancelTip() {
            vm.isShowTip = false;
            Core.Data.set('firstTip', false);
        }

        function setSlideListener() {
            document.querySelector('.mui-slider').addEventListener('slide', function (event) {
                vm.selectedModel = vm.binderVehicleList[event.detail.slideNumber];
                Core.$timeout(function () {
                    vm.$apply();
                });
            });
        }

        function openScanPage() {
            Core.Util.goToPage('barcode-scan', 'barcode.scan.html');
        }

        //接收扫描后回调的结果进行处理
        function scanResult(type, result, file) {
            Core.Data.set('scan-back', false);
            stopScan = true;
            Core.$timeout(function () {
                stopScan = false;
            }, 5000);
            if (result) {
                findVehicleAndBindUser(result);
            } else {
                Core.Util.showAlertDialog("无效的二维码");
            }
        }

        function connect(vehicle) {
            var uuid;
            if (vehicle) {
                for (var i in deviceList) {
                    if (deviceList[i].name == vehicle.device_name) {
                        uuid = deviceList[i].id;
                    }
                }
                if (!uuid) {
                    Core.Util.hideLoading();
                    var uibModal = Core.Util.showConfirmModal("提示", "未扫描到车辆,去连接列表看看吧", "去看看");
                    uibModal.result.then(function () {
                        openListPage();
                    });
                    return;
                }
            }
            connectVehicle(uuid, vehicle.device_id, function () {
                //选中其中一行
                Core.Util.hideLoading();
                vm.binderVehicleList.map(function (item) {
                    if (vehicle.device_id && item.device_id == vehicle.device_id) {
                        vm.selectedModel = item;
                    }
                });
                Core.$timeout(function () {
                    vm.$apply();
                });
                Core.Api.Vehicle.linkVehicle(vehicle.device_name);
            }, function () {
                Core.Util.hideLoading();
            });
        }

        function connectVehicle(uuid, deviceId, successCallback, failCallback) {
            Core.Native.BLE.connect(uuid, function (success) {
                if (success) {
                    if (successCallback && typeof successCallback == "function") {
                        successCallback();
                    }
                    Core.Data.set(Core.Const.DATA.KEY_CAR_LINKED, true);
                    Core.Data.set(Core.Const.DATA.KEY_CURRENT_DEVICE_MAC_ADDRESS, uuid);
                    Core.Data.set(Core.Const.DATA.KEY_CURRENT_DEVICE_ID, deviceId);
                    linkedDeviceBleId = uuid;
                    vm.processStatus = processStatusList[2];
                    Core.$timeout(function () {
                        getElectricity();
                        getDeviceGearAndLock();
                    }, 500);
                    if (!getElectricityInterval) {
                        getElectricityInterval = Core.$interval(getElectricity, 10000);
                    }
                    Core.$timeout(function () {
                        vm.$apply();
                    });
                }

            }, function (error) {
                if (failCallback && typeof failCallback == "function") {
                    failCallback();
                }
                vm.processStatus = processStatusList[0];
                openModal();
                Core.$timeout(function () {
                    vm.$apply();
                });

            })
        }

        function openModal() {
            var uibModal = Core.$uibModal.open({
                templateUrl: 'car.dialog.car-fail-link.html',
                controller: 'DialogCarFailLinkController',
                backdrop: false,
            });

            uibModal.result.then(function () {

            }, function () {
                Core.Log.d('Modal dismissed at: ' + new Date());
            });
        }


        function getBinderVehicle() {
            return Core.Api.Vehicle.getBinderVehicle().then(function (responseData) {
                vm.binderVehicleList = responseData.vehicle_list;
                if (!vm.binderVehicleList || vm.binderVehicleList.length == 0) {
                    vm.isEmpty = true;
                    vm.isShowTip = Core.Data.get('firstTip');
                } else {
                    vm.isEmpty = false;
                    vm.isShowTip = false;
                }
                if (!vm.selectedModel && vm.binderVehicleList.length > 0) {
                    vm.selectedModel = vm.binderVehicleList[0];
                }
                return $q.resolve();
            }, function () {
                return $q.resolve();
            });
        }

        function findVehicleAndBindUser(result) {
            Core.Util.showLoading();
            Core.Api.Vehicle.finVehicleByItemCode(result).then(function (responseData) {
                bindVehicle = responseData.vehicle;
                bindDeviceId = bindVehicle.device_id;
                bindDeviceName = bindVehicle.device_name;

                if (!bindDeviceId || !bindDeviceName) {
                    Core.Util.hideLoading();
                    Core.Util.showAlertDialog("服务端数据异常车辆");
                    return;
                }

                bindDevice = findDeviceFromScanListByDeviceName(bindDeviceName);
                if (!bindDevice) {
                    Core.Util.hideLoading();
                    Core.Util.showAlertDialog("未扫描到将绑定的车辆");
                    return;
                }
                var deviceId = Core.Util.getDeviceId(bindDevice);
                if (bindDeviceId.toLowerCase() == deviceId.toLowerCase()) {
                    Core.Api.Vehicle.bindUser(deviceId).then(function (responseData) {
                        if (!vm.processStatus || vm.processStatus == processStatusList[0]) {
                            Core.Native.BLE.connect(bindDevice.id, function (success) {
                                if (success) {
                                    Core.Util.hideLoading();
                                    Core.Util.showAlertDialog("您成功绑定车辆");
                                    Core.Data.set(Core.Const.DATA.KEY_CURRENT_DEVICE_MAC_ADDRESS, bindDevice.id);
                                    vm.processStatus = processStatusList[2];
                                    vm.selectedModel = bindVehicle;
                                    Core.Data.set(Core.Const.DATA.KEY_CAR_LINKED, true);
                                    linkedDeviceBleId = bindDevice.id;
                                    Core.$timeout(function () {
                                        getElectricity();
                                        getDeviceGearAndLock();
                                    }, 500);
                                    if (!getElectricityInterval) {
                                        getElectricityInterval = Core.$interval(getElectricity, 10000);
                                    }
                                    Core.$timeout(function () {
                                        vm.$apply();
                                    });
                                }
                            }, function (error) {
                                Core.Util.hideLoading();
                                Core.Util.showAlertDialog("您成功绑定车辆,连接失败");
                            });
                        } else {
                            Core.Util.hideLoading();
                            Core.Util.showAlertDialog("您成功绑定车辆");
                        }
                    }, function (err) {
                        Core.Util.hideLoading();
                        Core.Util.showAlertDialog("绑定失败," + err.message);
                    });

                } else {
                    Core.Util.hideLoading();
                    Core.Util.showAlertDialog("绑定失败,车辆不匹配");
                }
            }, function (err) {
                Core.Util.hideLoading();
                if (err.code == 5) {
                    Core.Util.showAlertDialog("无此车辆,请联系客服");
                } else if (err.code == 300) {
                    Core.Util.showAlertDialog("车辆已被绑定");
                }

            });

        }

        function findDeviceFromScanListByDeviceName(deviceName) {
            for (var i in deviceList) {
                if (deviceList[i].name == deviceName) {
                    return deviceList[i];
                }
            }
        }


        function getDeviceGearAndLock() {
            Core.Native.BLE.write(linkedDeviceBleId, Core.Device.makeFrame(Core.Const.FRAME.TYPE_READ_GEAR));
            Core.Native.BLE.write(linkedDeviceBleId, Core.Device.makeFrame(Core.Const.FRAME.TYPE_READ_LOCK));
        }


        Core.on(Core.Const.EVENT.TYPE_READ_ELECTRICITY, function (event, response) {
            var data = response;//Core.Device.getLatestData(Core.Const.DATA.TYPE_READ_ELECTRICITY);
            //console.log('read electricity', data);
            if (data != undefined) {
                vm.power = parseInt(data.substring(0, 2), 16) + "%";
                vm.powerLabel = vm.power;
                //console.log('vm.powerLabel', vm.powerLabel);
                Core.$timeout(function () {
                    vm.$apply();
                })
            }
        });

        Core.on(Core.Const.EVENT.TYPE_READ_GEAR, function () {
            var data = Core.Device.getLatestData(Core.Const.DATA.TYPE_READ_GEAR);
            var gear = data.substring(1, 2);
            Core.Data.set(Core.Const.CAR_INIT.SPEED_GEAR, gear);
        });

        Core.on(Core.Const.EVENT.TYPE_READ_LOCK, function () {
            var data = Core.Device.getLatestData(Core.Const.DATA.TYPE_READ_LOCK);
            Core.Data.set(Core.Const.CAR_INIT.LOCK, data);
        });

        function scanIsLinked() {
            Core.$interval(function () {
                var isLinked = Core.Data.get(Core.Const.DATA.KEY_CAR_LINKED);
                if (isLinked) {
                    linkedDeviceBleId = Core.Data.get(Core.Const.DATA.KEY_CURRENT_DEVICE_MAC_ADDRESS);

                    if (!linkedDeviceBleId) {
                        //console.log('无重连车辆id');
                        return;
                    }
                    if (stopScan) {
                        return;
                    }
                    var isOnUpgrade = Core.Data.get(Core.Const.EVENT.ON_UPGRADE);
                    if (isOnUpgrade) {
                        return;
                    }
                    //return;
                    Core.Native.BLE.isConnected(linkedDeviceBleId, function (success) {
                        //console.log('检测连接中...');
                        Core.Data.set("connect_status", Core.Const.CONNECT_STATUS.CONNECTED);
                    }, function () {
                        Core.Data.set("connect_status", Core.Const.CONNECT_STATUS.DISCONNECTED);
                        vm.processStatus = processStatusList[0];
                        Core.$timeout(function () {
                            vm.$apply();
                        });
                        //console.log('断线重连中...', linkedCarId);
                        Core.$timeout(function () {
                            var deviceId = Core.Data.get(Core.Const.DATA.KEY_CURRENT_DEVICE_ID);
                            Core.Native.BLE.connect(linkedDeviceBleId, function (success) {
                                if (success) {
                                    vm.binderVehicleList.map(function (item) {
                                        if (deviceId && item.device_id == deviceId) {
                                            vm.selectedModel = item;
                                        }
                                    });
                                    vm.processStatus = processStatusList[2];
                                    Core.$timeout(function () {
                                        getElectricity();
                                    }, 500);
                                    getDeviceGearAndLock();
                                    if (!getElectricityInterval) {
                                        getElectricityInterval = Core.$interval(getElectricity, 10000);
                                    }
                                    Core.$timeout(function () {
                                        vm.$apply();
                                    });
                                }
                            });
                        }, 200);
                    });
                }
            }, 5000);
        }

        Core.$window.scanResult = scanResult;
    }
})();