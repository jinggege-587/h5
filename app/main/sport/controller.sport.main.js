(function () {
    angular
        .module('app')
        .controller('SportMainController', ['$scope', 'Core', SportMainController]);


    function SportMainController($scope, Core) {
        var vm = $scope;

        vm.dumpEnergy = '0%';
        vm.isConnected = true;

        vm.mapModel = false;                                //是否为地图模式, false: 仪表盘  true: 地图
        vm.showShareMask = false;
        vm.showLoadMask = false;
        vm.showFinishBtn = true;
        vm.runMileage = 0.00;
        vm.speed = 0.00;
        vm.rideTime = 0; //秒
        vm.currentTripStatus = 0;
        vm.aveSpeed = 0.00;
        vm.maxSpeed = 0.00;
        vm.kcal = 0.00;
        var count = 0;
        var startLocation, endLocation, startTime, endTime;
        var map, startMark, endMark;
        var rideInterval;
        var speedInterval;
        var calculateKcalInterval;
        var kcalRidePerTime = 0;
        var kcalRidePerDistance = 0;
        var kcalNum = 0.00;

        var lastMileage;
        var runMileageNum = 0;
        var speedNum = 0;
        var maxSpeedNum = 0;

        var map_model = Core.Data.get('mapModel');
        var linkedDeviceBleId = Core.Data.get(Core.Const.DATA.KEY_CURRENT_DEVICE_MAC_ADDRESS);
        var tripId, lng, lat;
        var shares = null;
        var dataList = [];
        var os;


        if (map_model != null || map_model != undefined) {
            vm.mapModel = map_model;
        } else {
            Core.Data.set('mapModel', vm.mapModel);
        }

        vm.start = start;
        vm.stop = stop;
        vm.switchModel = switchModel;

        //继续 结束
        vm.next = next;
        vm.end = end;

        //分享
        vm.share = share;
        vm.onShareQQ = onShareQQ;
        vm.onShareMoments = onShareMoments;
        vm.onShareWeibo = onShareWeibo;
        vm.onShareWechatFriend = onShareWechatFriend;
        //取消分享
        vm.cancelShare = cancelShare;
        //完成骑行
        vm.finishRide = finishRide;
        //删除骑行
        vm.deleteRide = deleteRide;
        //返回
        vm.back = back;

        vm.changeGear = changeGear;
        vm.isRecycle = false;


        mui.back = function () {
            exitRide();
        };

        if (window.plus) {
            plusReady();
        } else {
            document.addEventListener('plusready', plusReady, false);
        }

        checkIsConnected();

        window.addEventListener('page-show', function () {
            linkedDeviceBleId = Core.Data.get(Core.Const.DATA.KEY_CURRENT_DEVICE_MAC_ADDRESS);
            vm.rideType = Core.Const.RIDE_TYPE.WALKING;
            Core.Native.BLE.isConnected(linkedDeviceBleId, function (success) {
                vm.rideType = Core.Const.RIDE_TYPE.RIDING;
                vm.isLoaded = true;
                getElectric();
                getMileage();
                Core.$interval(getElectric, 10000);
                Core.$interval(getSpeed, 500);
                Core.$interval(getMileage, 1000);
                Core.$interval(getPowerRecycle, 1000);
                //if (vm.rideType == Core.Const.RIDE_TYPE.RIDING) {
                getCarInitInfo();
                setBleReadListener();
                //显示电量,首页读取过
                var data = Core.Device.getLatestData(Core.Const.DATA.TYPE_READ_ELECTRICITY);
                if (data != undefined) {
                    vm.dumpEnergy = data ? parseInt(data.substring(0, 2), 16) + "%" : "0%";
                }
                Core.$timeout(function () {
                    vm.$apply();
                });
            }, function (err) {
                vm.rideType = Core.Const.RIDE_TYPE.WALKING;
                Core.$timeout(function () {
                    Core.Util.showAlertDialog("非骑行状态,请手动打开GPS");
                }, 500);
                //Core.Map.startGeoLocation();
                startSpeedInterval();
                vm.isLoaded = true;
                Core.$timeout(function () {
                    vm.$apply();
                });
            });

            startRideInterval();

            //end
            //vm.currentTripStatus = Core.Const.SPORT_STATUS.READY;
            plus.device.setWakelock(true);
            //share();
        });

        function plusReady() {
            vm.currentTripStatus = Core.Const.SPORT_STATUS.READY;
            os = plus.os.name;

            Core.Map.startNativeLocation();
            collectData();
            plus.device.setWakelock(true);
            Core.$timeout(function () {
                drawSport();
            }, 1000);
        }

        function getCarInitInfo() {
            var lock = Core.Data.get(Core.Const.CAR_INIT.LOCK);
            var gear = Core.Data.get(Core.Const.CAR_INIT.SPEED_GEAR);
            vm.gear = lock == '00' ? 1 : gear;
        }


        function start() {
            startLocation = Core.Map.getLocation();
            startTime = Core.Util.time();
            vm.currentTripStatus = Core.Const.SPORT_STATUS.RUNNING;
            if (startLocation.lng == 0 && startLocation.lat == 0) {
                Core.$timeout(function () {
                    start();
                }, 500);
                return;
            }
            collectOnceData();
            startCalculateKcalInterval();
            startRideInterval();
        }

        function stop() {
            stopCalculateKcalInterval();
            stopRideInterval();
            vm.aveSpeed = Core.Util.sprintf('%.2f', runMileageNum / parseInt(vm.rideTime / 1000) * 3600);
            vm.currentTripStatus = Core.Const.SPORT_STATUS.STOP;
        }

        function switchModel() {
            vm.mapModel = !vm.mapModel;
            Core.Data.set('mapModel', vm.mapModel);
        }

        function next() {
            startCalculateKcalInterval();
            startRideInterval();
            vm.currentTripStatus = Core.Const.SPORT_STATUS.RUNNING;
        }

        function end() {
            vm.showFinishBtn = false;
            endLocation = Core.Map.getLocation();
            endTime = Core.Util.time();
            collectOnceData();
            Core.$timeout(function () {
                showEndMap();
            }, 100);

            vm.mapModel = true;
            vm.currentTripStatus = Core.Const.SPORT_STATUS.FINISH;
            stopCalculateKcalInterval();
            stopRideInterval();
            stopSpeedInterval();
            if (vm.rideType == Core.Const.RIDE_TYPE.RIDING) {
                updateVehicleInfo();
            }
            Core.$timeout(function () {
                captureWebview();
            }, 2000);

        }

        function share() {
            vm.showShareMask = true;
            plus.share.getServices(function (s) {
                shares = s;
            }, function (e) {
                alert("获取分享服务列表失败：" + e.message);
            });
        }

        function cancelShare() {
            vm.showShareMask = false;
        }

        function finishRide() {
            Core.Util.goBack();
        }

        function deleteRide() {

            var modalInstance = Core.Util.showConfirmModal("删除骑行", "骑行不易,您确定要退出吗?", "删除");

            modalInstance.result.then(function () {
                deleteModal();
            }, function () {

            });

        }

        function deleteModal() {
            if (!tripId) {
                Core.Util.goBack();
                return;
            }
            Core.Api.Trip.deleteTrip(tripId).then(function (responseData) {
                Core.Util.goBack();
            }, function (err) {
            });
        }

        function exitRide() {
            if (vm.currentTripStatus != Core.Const.SPORT_STATUS.READY && vm.currentTripStatus != Core.Const.SPORT_STATUS.FINISH) {
                var modalInstance = Core.Util.showConfirmModal("退出骑行", "车辆还在骑行中您确定要退出吗?", "退出");
                modalInstance.result.then(function () {
                    //createTrip("");
                    Core.Util.goBack();
                }, function () {

                });
            } else {
                Core.Util.goBack();
            }

        }


        function back() {
            //如果在结束界面,则返回骑行界面
            if (vm.currentTripStatus == Core.Const.SPORT_STATUS.FINISH) {
                //vm.currentTripStatus = Core.Const.SPORT_STATUS.READY;
                Core.Util.goBack();
            } else {
                exitRide();
            }
        }

        function changeGear(gear) {
            Core.Util.showLoading();
            calculateKcal();

            if (gear == 1) {
                Core.Native.BLE.write(linkedDeviceBleId, Core.Device.makeFrame(Core.Const.FRAME.TYPE_WRITE_LOCK, '00'));
                Core.$timeout(function () {
                    Core.Native.BLE.write(linkedDeviceBleId, Core.Device.makeFrame(Core.Const.FRAME.TYPE_READ_LOCK));
                }, 100);
                Core.$timeout(function () {
                    Core.Util.hideLoading();
                }, 1500);
                return;
            }

            var data = '0' + gear;
            Core.Native.BLE.write(linkedDeviceBleId, Core.Device.makeFrame(Core.Const.FRAME.TYPE_WRITE_LOCK, 'ff'));
            Core.Native.BLE.write(linkedDeviceBleId, Core.Device.makeFrame(Core.Const.FRAME.TYPE_WRITE_GEAR, data));
            Core.$timeout(function () {
                Core.Native.BLE.write(linkedDeviceBleId, Core.Device.makeFrame(Core.Const.FRAME.TYPE_READ_LOCK));
                Core.Native.BLE.write(linkedDeviceBleId, Core.Device.makeFrame(Core.Const.FRAME.TYPE_READ_GEAR));
            }, 100);

            Core.$timeout(function () {
                Core.Util.hideLoading();
            }, 1500);

        }


        function getElectric() {
            Core.Native.BLE.write(linkedDeviceBleId, Core.Device.makeFrame(Core.Const.FRAME.TYPE_READ_ELECTRICITY));
        }

        function getSpeed() {
            Core.Native.BLE.write(linkedDeviceBleId, Core.Device.makeFrame(Core.Const.FRAME.TYPE_READ_SPEED));
        }

        function setBleReadListener() {
            Core.on(Core.Const.EVENT.TYPE_READ_POWER_RECYCLE, function () {
                var data = Core.Device.getLatestData(Core.Const.DATA.TYPE_READ_POWER_RECYCLE);
                vm.isRecycle = data == "01";
                Core.$timeout(function () {
                    vm.$apply();
                });
            });

            Core.on(Core.Const.EVENT.TYPE_READ_SPEED, function (event, response) {
                var speed = response;//Core.Device.getLatestData(Core.Const.DATA.TYPE_READ_SPEED);
                speedNum = speed ? Core.Util.luoBoCarHexToSingleBatch(speed) : 0.00;
                if (vm.currentTripStatus == Core.Const.SPORT_STATUS.RUNNING) {
                    maxSpeedNum = maxSpeedNum > parseFloat(speedNum) ? maxSpeedNum : parseFloat(speedNum);
                    vm.maxSpeed = Core.Util.sprintf("%.2f", maxSpeedNum);
                }
                vm.speed = Core.Util.toDecimal2(speedNum);
                Core.$timeout(function () {
                    vm.$apply();
                });
                //console.log('当前速度', speed);

            });

            Core.on(Core.Const.EVENT.TYPE_READ_LOCK, function () {
                var data = Core.Device.getLatestData(Core.Const.DATA.TYPE_READ_LOCK);
                //console.log('当前锁', data);
                Core.Data.set(Core.Const.CAR_INIT.LOCK, data);
                Core.Util.hideLoading();
                vm.gear = data == '00' ? 1 : vm.gear;
                Core.$timeout(function () {
                    vm.$apply();
                })
            });

            Core.on(Core.Const.EVENT.TYPE_READ_TOTAL_MILEAGE, function () {
                var data = Core.Device.getLatestData(Core.Const.DATA.TYPE_READ_TOTAL_MILEAGE);
                if (count == 0) {
                    lastMileage = Core.Util.luoBoCarHexToSingleBatch(data);
                }
                count++;
                //console.log('总距离', data);
                if (vm.currentTripStatus == Core.Const.SPORT_STATUS.RUNNING) {
                    runMileageNum += Math.abs(parseFloat(Core.Util.luoBoCarHexToSingleBatch(data)) - parseFloat(lastMileage));
                    vm.runMileage = Core.Util.sprintf("%.2f", runMileageNum);
                    Core.$timeout(function () {
                        vm.$apply();
                    })
                }
                lastMileage = Core.Util.luoBoCarHexToSingleBatch(data);

            });

            Core.on(Core.Const.EVENT.TYPE_READ_ELECTRICITY, function (event, response) {
                var data = response;//Core.Device.getLatestData(Core.Const.DATA.TYPE_READ_ELECTRICITY);
                //console.log('当前电量', data);
                vm.dumpEnergy = data ? parseInt(data.substring(0, 2), 16) + "%" : "0%";
                Core.$timeout(function () {
                    vm.$apply();
                });
            });

            Core.on(Core.Const.EVENT.TYPE_READ_GEAR, function () {
                var data = Core.Device.getLatestData(Core.Const.DATA.TYPE_READ_GEAR);
                //console.log('速度档位', vm.gear);
                Core.Util.hideLoading();
                Core.Data.set(Core.Const.CAR_INIT.SPEED_GEAR, vm.gear);
                vm.gear = data.substring(1, 2);
                Core.$timeout(function () {
                    vm.$apply();
                });
            });

        }


        function createTrip(compressedFilePath) {
            var deviceId = Core.Data.get(Core.Const.DATA.KEY_CURRENT_DEVICE_ID);
            if (vm.rideType == Core.Const.RIDE_TYPE.WALKING) {
                deviceId = "";
            }
            Core.Api.Trip.createTrip(deviceId, vm.currentTripStatus, startTime, endTime, JSON.stringify(dataList),
                startLocation.lat, startLocation.lng, endLocation.lat, endLocation.lng, vm.runMileage, vm.rideTime / 1000, vm.kcal, vm.maxSpeed).then(function (responseData) {
                tripId = responseData.id;
                Core.Data.set("isNeedRefresh", true);
                if (compressedFilePath) {
                    Core.Util.upLoad(Core.Const.NET.IMG_UPLOAD_END_POINT, compressedFilePath, 5, function (fileName) {
                        addTripImg(responseData.id, fileName, compressedFilePath, 1);
                    }, function () {
                        var uuid = plus.device.uuid;
                        Core.Api.App.addFailTask(uuid, compressedFilePath, tripId, Core.Const.TASK_FAIL_TYPE.TRIP);
                        addTripImg(responseData.id, "", compressedFilePath, -1);
                    });
                }

            }, function (err) {
                vm.showLoadMask = false;
                Core.Util.showAlertDialog("创建行程失败");
            });
        }

        function addTripImg(tripId, fileName, compressedFilePath, type) {
            var imgPath = type == 1 ? fileName : "local:" + compressedFilePath;
            Core.Api.Trip.addTripImg(tripId, imgPath).then(function () {
                Core.Data.set(imgPath, compressedFilePath);
                Core.$timeout(function () {
                    vm.showLoadMask = false;
                }, 1000);
            }, function () {
                Core.$timeout(function () {
                    vm.showLoadMask = false;
                }, 1000);
            });
        }

        function getMileage() {
            Core.Native.BLE.write(linkedDeviceBleId, Core.Device.makeFrame(Core.Const.FRAME.TYPE_READ_TOTAL_MILEAGE));
        }

        function getPowerRecycle() {
            Core.Native.BLE.write(linkedDeviceBleId, Core.Device.makeFrame(Core.Const.FRAME.TYPE_READ_POWER_RECYCLE));
        }


        function collectData() {
            Core.$interval(function () {
                collectOnceData();
            }, 5000);
        }

        function collectOnceData() {
            if (vm.currentTripStatus == Core.Const.SPORT_STATUS.RUNNING) {
                var location = Core.Map.getLocation();
                var speed = vm.speed;
                var data = {latitude: location.lat, longitude: location.lng, speed: speed};
                if (location.lat == 0 && location.lng == 0) {
                    return;
                }
                dataList.push(data);
            }
        }

        function drawSport() {
            var location = Core.Map.getLocation();
            if (location.lng == 0 && location.lat == 0) {
                Core.$timeout(function () {
                    drawSport();
                }, 500);
                return;
            }
            map = new AMap.Map("container", {
                resizeEnable: true,
                center: [location.lng, location.lat],
                zoom: 13
            });

            startMark = new AMap.Marker({
                map: map,
                position: [location.lng, location.lat],
                icon: new AMap.Icon({
                    size: new AMap.Size(30, 30),  //图标大小
                    image: "main/img/icon-start.png",
                })
            });

            var positionList = [];
            var count = 0;

            var line = new AMap.Polyline({
                map: map,
                path: positionList,
                strokeColor: "#FE7101",  //线颜色
                strokeOpacity: 1,     //线透明度
                strokeWeight: 3,      //线宽
                strokeStyle: "solid"  //线样式
            });

            Core.$interval(function () {
                count++;
                var location = Core.Map.getLocation();
                if (vm.currentTripStatus != Core.Const.SPORT_STATUS.FINISH) {
                    startMark.setPosition(new AMap.LngLat(location.lng, location.lat));
                }
                if (count >= 10) {
                    map.panTo(new AMap.LngLat(location.lng, location.lat));
                    count = 0;
                }

                if (vm.currentTripStatus == Core.Const.SPORT_STATUS.RUNNING) {
                    positionList.push(new AMap.LngLat(location.lng, location.lat));
                    line.setPath(positionList);
                    line.show();
                }
            }, 3000);
        }

        function captureWebview() {
            var time = Core.Util.time();
            var iosSrcPath = '_doc/sport_' + time + '.jpg';
            var iosOutPath = '_doc/' + time + '.jpg';
            var androidSrcPath = '_doc/sport_' + time + '.png';
            var androidOutPath = '_doc/' + time + '.png';
            if (plus.os.name == 'iOS') {
                var bitmap = new plus.nativeObj.Bitmap("capture");
                var ws = plus.webview.currentWebview();

                ws.draw(bitmap,
                    function () {
                        vm.showFinishBtn = true;
                        vm.showLoadMask = true;
                        bitmap.save(iosSrcPath, {overwrite: true, format: "jpg"}, function (e) {
                                plus.zip.compressImage({
                                        src: e.target,
                                        dst: iosOutPath,
                                        clip: {top: 45, left: 0, width: "100%", height: window.screen.height - 250 - 45 - 20}		// 裁剪图片中心区域
                                    },
                                    function () {
                                        createTrip(iosOutPath);
                                    },
                                    function () {
                                        createTrip();
                                    });
                            },
                            function () {
                                createTrip();
                            });
                    },
                    function () {
                        createTrip();
                    });

            } else {
                vm.showFinishBtn = true;
                vm.showLoadMask = true;
                var ele = document.querySelector("#container");
                html2canvas(ele, {
                    allowTaint: true,
                    taintTest: false,
                    onrendered: function (canvas) {
                        var dataUrl = canvas.toDataURL();
                        var b = new plus.nativeObj.Bitmap();
                        b.loadBase64Data(dataUrl,
                            function () {
                                b.save(androidSrcPath, {overwrite: true},
                                    function (e) {
                                        plus.zip.compressImage({
                                                src: e.target,
                                                dst: androidOutPath,
                                                clip: {top: "0", left: "0", width: "100%", height: "100%"}		// 裁剪图片中心区域
                                            },
                                            function () {
                                                Core.Util.fileRemove(e.target);
                                                createTrip(androidOutPath);
                                            }, function (error) {
                                                Core.Util.fileRemove(e.target);
                                                createTrip();
                                            });
                                    },
                                    function () {
                                        createTrip();
                                    });
                            },
                            function () {
                                createTrip();
                            });

                    }

                });
            }
        }

        //计算卡路里
        function calculateKcal() {
            if (vm.rideType == Core.Const.RIDE_TYPE.RIDING) {
                var dis = runMileageNum - kcalRidePerDistance;
                var t = parseInt((vm.rideTime - kcalRidePerTime) / 1000) / 3600;//t单位小时
                var v = ((dis / t) == 'Infinity' || isNaN(dis / t)) ? 0 : (dis / t);
                var speed = Core.Device.getLatestData(Core.Const.DATA.TYPE_READ_SPEED);
                speed = speed ? Core.Util.luoBoCarHexToSingleBatch(speed) : 0.00;
                switch (parseInt(vm.gear)) {
                    case 1:
                        var value1 = (27 + (v - 9) / 15) * v * t;
                        value1 = (value1 == 'Infinity' || isNaN(value1)) ? 0 : value1;
                        kcalNum = kcalNum + value1;
                        break;
                    case 2:

                        if (parseFloat(speed) <= 12) {
                            var value21 = (13.5 + (v - 9) / 15) * v * t;
                            value21 = (value21 == 'Infinity' || isNaN(value21)) ? 0 : value21;
                            kcalNum = kcalNum + value21;
                        } else {
                            var value22 = (27 + (v - 12) / 15) * v * t;
                            value22 = (value22 == 'Infinity' || isNaN(value22)) ? 0 : value22;
                            kcalNum = kcalNum + value22;
                        }
                        break;
                    case 3:
                        if (parseFloat(speed) <= 20) {
                            var value31 = (13.5 + (v - 9) / 15) * v * t;
                            value31 = (value31 == 'Infinity' || isNaN(value31)) ? 0 : value31;
                            kcalNum = kcalNum + value31;
                        } else {
                            var value32 = (27 + (v - 20) / 15) * v * t;
                            value32 = (value32 == 'Infinity' || isNaN(value32)) ? 0 : value32;
                            kcalNum = kcalNum + value32;
                        }
                        break;
                }
                vm.kcal = Core.Util.sprintf("%.2f", kcalNum);

                kcalRidePerDistance = runMileageNum;
                kcalRidePerTime = vm.rideTime;
            } else {
                var weight = 60;
                var time = vm.rideTime / 1000 / 3600;
                var index = 30 / (400 / (vm.aveSpeed / 3.6) / 60);
                kcalNum = weight * time * index / 1000;
                if (isNaN(kcalNum)) {
                    vm.kcal = '0.00';
                } else {
                    vm.kcal = Core.Util.sprintf("%.2f", kcalNum);
                }
            }
        }

        function startSpeedInterval() {
            if (angular.isDefined(speedInterval)) return;
            speedInterval = Core.$interval(function () {
                if (vm.currentTripStatus == Core.Const.SPORT_STATUS.RUNNING) {
                    vm.speed = Core.Util.sprintf("%.2f", Core.Map.getSpeed() * 3.6);

                    maxSpeedNum = maxSpeedNum > parseFloat(vm.speed) ? maxSpeedNum : parseFloat(vm.speed);
                    vm.maxSpeed = Core.Util.sprintf("%.2f", maxSpeedNum);
                    runMileageNum += parseFloat(vm.speed / 3.6 / 1000);
                    vm.runMileage = Core.Util.sprintf("%.2f", runMileageNum);
                    //console.log('当前速度', speed);
                    Core.$timeout(function () {
                        vm.$apply();
                    });
                }
            }, 1000);
        }

        function stopSpeedInterval() {
            if (angular.isDefined(speedInterval)) {
                Core.$interval.cancel(speedInterval);
                speedInterval = undefined;
            }
        }

        function startRideInterval() {
            if (angular.isDefined(rideInterval)) return;
            rideInterval = Core.$interval(function () {
                if (vm.currentTripStatus == Core.Const.SPORT_STATUS.RUNNING) {
                    vm.rideTime += 1000;
                }
            }, 1000);
        }

        function stopRideInterval() {
            if (angular.isDefined(rideInterval)) {
                Core.$interval.cancel(rideInterval);
                rideInterval = undefined;
            }
        }

        function startCalculateKcalInterval() {
            if (angular.isDefined(calculateKcalInterval)) return;
            calculateKcalInterval = Core.$interval(function () {
                calculateKcal();
            }, 10000);
        }

        function stopCalculateKcalInterval() {
            if (angular.isDefined(calculateKcalInterval)) {
                Core.$interval.cancel(calculateKcalInterval);
                calculateKcalInterval = undefined;
            }
        }

        function showEndMap() {
            startMark.setPosition(new AMap.LngLat(startLocation.lng, startLocation.lat));

            endMark = new AMap.Marker({
                map: map,
                position: [endLocation.lng, endLocation.lat],
                icon: new AMap.Icon({
                    size: new AMap.Size(25, 31),  //图标大小
                    image: "main/img/icon-end.png",
                    // imageOffset: new AMap.Pixel(-5, 4)
                })
            });
            map.setFitView();
        }

        //map.setFitView();
        function onShareQQ() {
            shares.map(function (item) {
                if (item.id == 'qq') {
                    item.authorize(function () {
                        item.send({
                                title: "Notebike骑行路径",
                                content: "Notebike is coming!",
                                href: "http://app-api.notebike.cn/static/index.html?os=" + os + "&" + "trip_id=" + tripId,
                            },
                            function () {
                                alert("分享成功");
                            }, function (e) {
                                alert("分享失败");
                            });
                    }, function () {

                    });
                }
            });
        }

        function onShareMoments() {
            shares.map(function (item) {
                if (item.id == 'weixin') {
                    item.authorize(function () {
                        item.send({
                                title: "Notebike骑行路径",
                                content: "Notebike is coming!",
                                href: "http://app-api.notebike.cn/static/index.html?os=" + os + "&" + "trip_id=" + tripId,
                                extra: {scene: "WXSceneTimeline"}
                            },
                            function () {
                                alert("分享成功");
                            }, function (e) {
                                alert("分享失败" + e.message);
                            });
                    }, function () {
                        alert(JSON.stringify(arguments));
                    });
                }
            });
        }

        function onShareWechatFriend() {
            shares.map(function (item) {
                if (item.id == 'weixin') {
                    item.authorize(function () {
                        item.send({
                                title: "Notebike骑行路径",
                                content: "Notebike is coming!",
                                href: "http://app-api.notebike.cn/static/index.html?os=" + os + "&" + "trip_id=" + tripId,
                                extra: {scene: "WXSceneSession"}
                            },
                            function () {
                                alert("分享成功");
                            }, function (e) {
                                alert("分享失败" + e.message);
                            });
                    }, function () {

                    });
                }
            });
        }

        function onShareWeibo() {
            shares.map(function (item) {
                if (item.id == 'sinaweibo') {
                    item.authorize(function () {
                        item.send({
                                title: "Notebike骑行路径",
                                content: "Notebike is coming!",
                                href: "http://app-api.notebike.cn/static/index.html?os=" + os + "&" + "trip_id=" + tripId,
                            },
                            function () {
                                alert("分享成功");
                            }, function (e) {
                                alert("分享失败" + e.message);
                            });
                    }, function () {

                    });
                }
            });
        }

        function updateVehicleInfo() {
            var deviceId = Core.Data.get(Core.Const.DATA.KEY_CURRENT_DEVICE_ID);
            Core.Api.Vehicle.updateVehicleInfo(deviceId, vm.runMileage, vm.rideTime);
        }

        function checkIsConnected() {
            Core.$interval(function () {
                var connectStatus = Core.Data.get("connect_status");
                if (vm.rideType == Core.Const.RIDE_TYPE.RIDING) {
                    vm.isConnected = connectStatus == Core.Const.CONNECT_STATUS.CONNECTED;
                }
            }, 5000);
        }

    }
})();