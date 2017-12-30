(function () {
    angular
        .module('app')
        .controller('RidingDetailController', ['$scope', 'Core', RidingDetailController]);


    function RidingDetailController($scope, Core) {
        var vm = $scope;
        var tripId = Core.Util.getParameterByName("trip_id");
        var status_id = Core.Data.get('trip_status');
        var shares = null;
        var os;

        if (status_id) {
            vm.tripStatus = status_id ? status_id : 1;
        } else {
            Core.Data.set('trip_status', null);
            vm.tripStatus = 1;
        }

        vm.showMask = false;
        vm.deleteRideRecord = deleteRideRecord;
        vm.writeRideFeel = writeRideFeel;
        vm.showRideFeel = showRideFeel;
        vm.closeRideFeel = closeRideFeel;
        vm.updateRideFeel = updateRideFeel;
        vm.goBack = goBack;
        vm.share = share;
        vm.onShareQQ = onShareQQ;
        vm.onShareWeibo = onShareWeibo;
        vm.onShareMoments = onShareMoments;
        vm.onShareWechatFriend = onShareWechatFriend;
        vm.onClickCancel = onClickCancel;
        vm.stopTouch =  Core.Native.Core.cancelTouchScreen;

        getTripDetail();
        getTripRecord();

        if (window.plus) {
            plusReady();
        } else {
            document.addEventListener('plusready', plusReady, false);
        }

        function plusReady() {
            os = plus.os.name;
        }

        //window.addEventListener('page-show', function () {
        //    Core.Util.hideLoading();
        //    //getTripDetail();
        //    //getTripRecord();
        //});


        function getTripDetail() {
            Core.Util.showLoading();
            Core.Api.Trip.getTripDetail(tripId).then(function (responseData) {
                vm.trip = responseData.trip;
                if (vm.tripStatus != 3) {
                    if (!vm.trip.feel) {
                        Core.Data.set('trip_status', 1);
                        vm.tripStatus = 1;
                    } else {
                        Core.Data.set('trip_status', 2);
                        vm.tripStatus = 2;
                    }
                }
                Core.Util.hideLoading();
            }, function (err) {
                Core.Util.hideLoading();
            })
        }

        function getTripRecord() {
            Core.Api.Trip.getTripRecordList(tripId).then(
                function (responseData) {
                    var list = [];
                    for (var i in responseData.trip_record_list) {
                        var latlng = {
                            lng: responseData.trip_record_list[i].longitude,
                            lat: responseData.trip_record_list[i].latitude
                        };
                        list.push(latlng);
                    }
                    Core.Map.drawLine(list);
                },
                function (error) {
                }
            );
        }

        function writeRideFeel() {
            Core.Util.goToPage('riding-feel', 'riding.feel.html', null, {trip_id: tripId});
        }

        function updateRideFeel() {
            Core.Util.goToPage('riding-feel', 'riding.feel.html', null, {trip_id: tripId});
        }

        function showRideFeel() {
            Core.Data.set('trip_status', 3);
            vm.tripStatus = 3;
        }

        function closeRideFeel() {
            Core.Data.set('trip_status', 2);
            vm.tripStatus = 2;
        }

        function deleteModal() {
            Core.Api.Trip.deleteTrip(tripId).then(function (responseData) {
                Core.Data.set("isNeedRefresh", true);
                goBack();
            }, function (err) {
            });
        }

        function deleteRideRecord() {
            var modalInstance = Core.Util.showConfirmModal("删除骑行", "骑行不易, 你确定要删除吗?", "删除");

            modalInstance.result.then(function () {
                deleteModal();
            }, function () {
            });
        }

        function goBack() {
            Core.Util.goBack();
        }

        function share() {
            vm.showMask = true;
            plus.share.getServices(function (s) {
                shares = s;
                Core.Log.d(shares);
            }, function (e) {
                alert("获取分享服务列表失败：" + e.message);
            });
        }

        function onClickCancel() {
            vm.showMask = false;
        }

        function onShareQQ() {
            shares.map(function (item) {
                if (item.id == 'qq') {
                    item.authorize(function () {
                        item.send({
                                title: "Notebike骑行路径",
                                content: "Notebike is coming!",
                                //href: "http://www.notebike.cn/",
                                //href: Core.Const.END_POINT + "/static/index.html?" + "os=" + os + "&" + "trip_id=" + tripId
                                href: "http://app-api.notebike.cn/static/index.html?os=" + os + "&" + "trip_id=" + tripId,
                            },
                            function () {
                                alert("分享成功");
                            }, function (e) {
                                alert("分享失败");
                                console.log('分享fail', e);
                                console.log(arguments);
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
                                //href: "http://114.55.133.12" + "/static/index.html?" + "os=" + os + "&" + "trip_id=" + tripId,
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

        window.addEventListener('should-cache-sub-page', cachePage, false);
        function cachePage() {

        }
    }
})();
