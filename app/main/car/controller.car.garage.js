(function () {
    angular
        .module('app')
        .controller('CarGarageController', ['$scope', 'Core', CarGarageController]);


    function CarGarageController($scope, Core) {
        var vm = $scope;
        var modelId = Core.Util.getParameterByName('model_id');
        var car_id = Core.Data.get('car-id');
        vm.modelName = Core.Util.getParameterByName('model_name');
        vm.goBack = goBack;
        vm.onSelect = onSelect;

        if (!modelId) {
            Core.Util.showAlertDialog("页面出错");
            return;
        }

        mui.init({
            beforeback: function(){
                var Scanner = plus.webview.getWebviewById('main-main');
                mui.fire(Scanner,'refresh');
                return true;
            }
        });

        init();

        function init() {
            Core.Util.showLoading();
            Core.Api.Car.getVehicleModelSpecList(modelId).then(function (data) {
                vm.colorList = data.spec_list;
                if (vm.colorList != null) {
                    vm.colorList.map(function (item, index) {
                        if (index == (car_id - 1)) {
                            item.selected = true;
                        }
                    });
                }
                Core.$timeout(function () {
                    vm.$apply();
                    Core.Util.hideLoading();
                });
            }, function (err) {
                Core.Util.hideLoading();
            });
        }

        function onSelect(id, selectIndex) {
            vm.colorList.map(function (item, index) {
                if (index == selectIndex) {
                    item.selected = true;
                } else {
                    item.selected = false;
                }
            });
            Core.Data.set('car-id', id);
            Core.Util.goBack();
        }

        function goBack() {
            Core.Util.goBack();
        }

    }
})();