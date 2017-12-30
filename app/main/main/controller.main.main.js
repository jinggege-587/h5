(function () {
    angular
        .module('app')
        .controller('MainController', ['$scope', 'Core', MainController]);


    function MainController($scope, Core) {
        var vm = $scope;

        vm.selected = 0;

        vm.selectedTab = selectedTab;
        vm.go = go;

        vm.tab = [
            {img: './main/img/icon-car-pre.png', color: '#FE770B'},
            {img: './main/img/icon-trail-nor.png', color: '#CFD4DE'},
            {img: './main/img/icon-friend-nor.png', color: '#CFD4DE'},
            {img: './main/img/icon-personal-nor.png', color: '#CFD4DE'}
        ];

        //vm.hide = hideModal;
        var linkedCarId;

        if (window.plus) {
            getFailTaskList();
        } else {
            document.addEventListener('plusready', function () {
                getFailTaskList();
            }, false);
        }

        window.addEventListener('page-show', function () {
            linkedCarId = Core.Data.get(Core.Const.DATA.KEY_CURRENT_DEVICE_MAC_ADDRESS);

            var first = null;
            mui.back = function () {
                //首次按键，提示‘再按一次退出应用’
                if (!first) {
                    first = new Date().getTime();
                    mui.toast('再按一次退出应用');
                    setTimeout(function () {
                        first = null;
                    }, 2000);
                } else {
                    if (new Date().getTime() - first < 1000) {
                        plus.runtime.quit();
                    }
                }

            };
        });

        function selectedTab(tab) {
            switch (tab) {
                case 0:
                    vm.tab[0].img = './main/img/icon-car-pre.png';
                    vm.tab[1].img = './main/img/icon-trail-nor.png';
                    vm.tab[2].img = './main/img/icon-friend-nor.png';
                    vm.tab[3].img = './main/img/icon-personal-nor.png';
                    vm.tab[0].color = '#FE770B';
                    vm.tab[1].color = vm.tab[2].color = vm.tab[3].color = '#CFD4DE';
                    vm.selected = 0;
                    break;
                case 1:
                    vm.tab[0].img = './main/img/icon-car-nor.png';
                    vm.tab[1].img = './main/img/icon-trail-pre.png';
                    vm.tab[2].img = './main/img/icon-friend-nor.png';
                    vm.tab[3].img = './main/img/icon-personal-nor.png';
                    vm.tab[1].color = '#FE770B';
                    vm.tab[0].color = vm.tab[2].color = vm.tab[3].color = '#CFD4DE';
                    vm.selected = 1;
                    break;
                case 2:
                    linkedCarId = Core.Data.get(Core.Const.DATA.KEY_CURRENT_DEVICE_MAC_ADDRESS);
                    if (linkedCarId) {
                        Core.Native.BLE.isConnected(linkedCarId, function (success) {
                            vm.tab[0].img = './main/img/icon-car-nor.png';
                            vm.tab[1].img = './main/img/icon-trail-nor.png';
                            vm.tab[2].img = './main/img/icon-friend-pre.png';
                            vm.tab[3].img = './main/img/icon-personal-nor.png';
                            vm.tab[2].color = '#FE770B';
                            vm.tab[0].color = vm.tab[1].color = vm.tab[3].color = '#CFD4DE';
                            vm.selected = 2;
                            //Core.Util.goToPage('sport-main', 'sport.main.html');
                            Core.$timeout(function () {
                                vm.$apply();
                            })
                        }, function (err) {
                            Core.Util.showAlertDialog('别急,请先连接车辆');
                        });
                    } else {
                        Core.Util.showAlertDialog('别急,请先连接车辆');
                    }
                    break;
                case 3:
                    vm.tab[0].img = './main/img/icon-car-nor.png';
                    vm.tab[1].img = './main/img/icon-trail-nor.png';
                    vm.tab[2].img = './main/img/icon-friend-nor.png';
                    vm.tab[3].img = './main/img/icon-personal-pre.png';
                    vm.tab[3].color = '#FE770B';
                    vm.tab[0].color = vm.tab[1].color = vm.tab[2].color = '#CFD4DE';
                    vm.selected = 3;
                    break;
            }
        }


        var fromUser = Core.Data.get('fromUser');
        if (fromUser) {
            Core.Data.set('fromUser', false);
            selectedTab(3)
        }


        function go() {
            Core.Util.goToPage('sport-main', 'sport.main.html', null, null, "slide-in-bottom");

        }

        function getFailTaskList() {
            var uuid = plus.device.uuid;
            Core.Api.App.getFailUploadTaskList(uuid).then(function (responseData) {
                var imgTaskFailList = responseData.img_task_fail_list;
                upLoad(imgTaskFailList, 0);

            });
        }

        function upLoad(imgTaskFailList, index) {
            if (!imgTaskFailList || imgTaskFailList.length == 0) {
                return;
            }
            if (index >= imgTaskFailList.length) {
                return;
            }
            var imgTaskFail = imgTaskFailList[index];
            index++;
            if (imgTaskFail.source_type == Core.Const.TASK_FAIL_TYPE.TRIP) {
                Core.Util.upLoad(Core.Const.NET.IMG_UPLOAD_END_POINT, imgTaskFail.img_src, 5, function (fileName) {
                    Core.Api.Trip.addTripImg(imgTaskFail.source_id, fileName).then(function () {
                        Core.Data.set(fileName, imgTaskFail.img_src);
                    }, function () {
                    });
                    Core.Api.App.deleteFailTask(imgTaskFail.id);
                    upLoad(imgTaskFailList, index);
                }, function () {
                    upLoad(imgTaskFailList, index);
                });
            } else {
                upLoad(imgTaskFailList, index);
            }

        }

        var closeCount = 0;
        window.addEventListener('page-show', function () {
            setTimeout(function () {
                if (window.plus && closeCount == 0) {
                    Core.Log.d('close behind page, current: ' + plus.webview.currentWebview().id);
                    var pages = plus.webview.all();

                    if (pages.length > 0) {
                        Core.Log.d('closing: ' + pages[0].id);
                        pages[0].close('none');
                    }

                    for (var i = 1; i < pages.length; i++) {
                        var page = pages[i];
                        if (page.id.indexOf('login') >= 0 && page != plus.webview.currentWebview()) {
                            Core.Log.d('closing: ' + page.id);
                            page.close('none');
                        }
                    }

                    closeCount++;
                }
            }, 2000);
        }, false);

        window.addEventListener('should-cache-sub-page', cachePage, false);
        function cachePage() {
            Core.Util.cachePage('user-detail', 'user.detail.html');
            Core.Util.cachePage('car-link-list', 'car.link.list.html');
            Core.Util.cachePage('sport-main', 'sport.main.html');
        }
    }
})();