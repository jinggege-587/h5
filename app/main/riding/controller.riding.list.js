/**
 * Created by huyg on 16/8/31.
 */
(function () {
    angular
        .module('app')
        .controller('RidingListController', ['$scope', 'Core', '$compile', RidingListController]);


    function RidingListController($scope, Core, $compile) {
        var vm = $scope;
        vm.switchStatus = {value: 1, img: './main/img/icon-list1.png'};
        vm.switchListStatus = switchListStatus;
        vm.openDetailPage = openDetailPage;
        vm.selectedTrip = selectedTrip;
        vm.loading = loading;
        vm.load = getTripList;
        vm.refresh = refresh;
        vm.tripSelected = "";
        var page = 0;
        vm.tripList = [];
        vm.tripRefreshList = [];
        vm.isEmpty = true;
        var latlngList = [];
        var count;
        vm.isEnd = false;
        var isFirstInto = true;
        vm.isLoading = false;
        vm.isRefreshing = false;

        window.addEventListener('page-show', function () {
            if (isFirstInto) {
                isFirstInto = false;
                getTripList();
            } else {
                if (Core.Data.get("isNeedRefresh")) {
                    vm.isEnd = false;
                    refresh();
                    Core.Data.set("isNeedRefresh", false);
                }
            }

        });

        function loading() {
            Core.Util.showLoading();
            getTripList();
            Core.$timeout(function () {
                Core.Util.hideLoading();
            }, 1000);
        }


        function openDetailPage(tripId) {
            Core.Util.showLoading();
            Core.Util.goToPage('riding-detail', 'riding.detail.html', null, {trip_id: tripId});
            Core.$timeout(function () {
                Core.Util.hideLoading();
            }, 1500);
        }

        function switchListStatus() {
            if (vm.switchStatus.value == 1) {
                vm.switchStatus.value = 2;
                vm.switchStatus.img = './main/img/icon-list2.png';
                changeMap();
            } else {
                vm.switchStatus.value = 1;
                vm.switchStatus.img = './main/img/icon-list1.png';
            }
        }

        function selectedTrip(index) {
            if (vm.tripRefreshList) {
                for (var i in vm.tripRefreshList) {
                    if (i == index) {
                        vm.tripRefreshList[i].isSelected = true;
                        vm.tripSelected = vm.tripRefreshList[i];
                        getTripRecord();
                    } else {
                        vm.tripRefreshList[i].isSelected = false;
                    }
                }
            }
        }

        function getTripRecord() {
            Core.Api.Trip.getTripRecordList(vm.tripSelected.id).then(
                function (responseData) {
                    var list = [];
                    for (var i in responseData.trip_record_list) {
                        var latlng = {
                            lng: responseData.trip_record_list[i].longitude,
                            lat: responseData.trip_record_list[i].latitude
                        };
                        list.push(latlng);
                    }
                    latlngList = list;
                    changeMap();
                },
                function (error) {
                }
            );
        }

        function changeMap() {
            if (vm.switchStatus.value == 2 && vm.tripSelected && latlngList.length > 0) {
                Core.$timeout(function () {
                    vm.hideMap = false;
                    Core.Map.drawLine(latlngList);
                });
            } else {
                vm.hideMap = true;
            }
        }

        function refresh() {
            vm.isRefreshing = true;
            vm.isEnd = false;
            page = 1;
            Core.Api.Trip.getTripList(page).then(function (responseData) {
                vm.isRefreshing = false;
                vm.tripList = responseData.trip_list;
                angular.forEach(vm.tripList, function (item) {
                    Core.Util.imgLoader(item.img, function (path) {
                        item.img = path;
                        Core.$timeout(function () {
                            vm.$apply();
                        })
                    });
                });
                vm.tripRefreshList = [];
                Core.$timeout(function () {
                    vm.$apply();
                });
                Core.$timeout(function () {
                    vm.tripRefreshList = [].concat(vm.tripList);
                    vm.isEmpty = vm.tripRefreshList.length == 0;
                }, 500);
            }, function () {
                vm.isRefreshing = false;
            });
        }

        function getTripList() {
            vm.isLoading = true;
            if (vm.isEnd) {
                vm.isLoading = false;
                return;
            }
            page++;
            Core.Api.Trip.getTripList(page).then(function (responseData) {
                vm.isLoading = false;
                vm.tripList = responseData.trip_list;
                count = responseData.count;
                angular.forEach(vm.tripList, function (item) {
                    Core.Util.imgLoader(item.img, function (path) {
                        item.img = path;
                        Core.$timeout(function () {
                            vm.$apply();
                        })
                    });
                });
                vm.tripRefreshList = vm.tripRefreshList.concat(vm.tripList);
                console.log('tripRefreshList', vm.tripRefreshList);
                if (page == 1) {
                    selectedTrip(0);
                }
                vm.isEmpty = vm.tripRefreshList.length == 0;
                if (page * 10 >= count) {
                    vm.isEnd = true;
                }
            }, function () {
                vm.isLoading = false;
                page--;
            });
        }
    }
})();
