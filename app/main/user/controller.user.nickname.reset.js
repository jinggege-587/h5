(function () {
    angular
        .module('app')
        .controller('UserNickNameResetController', ['$scope', 'Core', UserNickNameResetController]);


    function UserNickNameResetController($scope, Core) {
        var vm = $scope;

        vm.clickable = false;
        vm.nickname = "";
        vm.descTips = false;

        vm.updateNickName = updateNickName;
        vm.inputChanged = inputChanged;
        vm.goBack = goBack;
        vm.stopTouch =  Core.Native.Core.cancelTouchScreen;

        mui.init({
            beforeback: function(){
                var Scanner = plus.webview.getWebviewById('user-detail');
                mui.fire(Scanner,'refresh');
                return true;
            }
        });

        function updateNickName() {
            if (vm.clickable) {
                Core.Api.User.updateNickName(vm.nickname).then(
                    function (responseData) {
                        mui.toast('修改成功');
                        Core.$timeout(function () {
                            Core.Util.goBack();
                        }, 500);
                    },
                    function (err) {
                        mui.alert(err.message);
                    }
                );
            }
        }

        function inputChanged() {
            check();
            vm.descTips = vm.nickname.length > 15;
        }

        function check() {
            vm.clickable = Boolean(vm.nickname);
            // vm.clickable = vm.nickname ? true : false;

        }

        function goBack() {
            Core.publish('testname','testdata');
            Core.Util.goBack();
        }

    }
})();