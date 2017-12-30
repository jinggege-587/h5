(function () {
    angular
        .module('app')
        .controller('UserPwdResetController', ['$scope', 'Core', UserPwdResetController]);


    function UserPwdResetController($scope, Core) {
        var vm = $scope;

        vm.resetPassword = resetPassword;
        vm.goBack = goBack;
        vm.stopTouch =  Core.Native.Core.cancelTouchScreen;

        mui.init({
            beforeback: function(){
                var Scanner = plus.webview.getWebviewById('user-detail');
                mui.fire(Scanner,'refresh');
                return true;
            }
        });

        function resetPassword() {
            if (!checkParams()) {
                return;
            }
            Core.Api.User.updatePassword(vm.password, vm.newPassword).then(
                function (responseData) {
                    mui.toast('修改成功');
                    Core.Data.set("password", vm.newPassword);
                    Core.$timeout(function () {
                        Core.Util.goBack();
                    }, 500);
                },
                function (err) {
                    if(err.code == 3){
                        Core.Util.showAlertDialog('原始密码错误');
                    }
                }
            );
        }

        function checkParams() {
            if (!vm.password) {
                Core.Util.showAlertDialog('请输入原始密码');
                return false;
            }
            if (!vm.newPassword) {
                Core.Util.showAlertDialog('请输入新密码');
                return false;
            }
            if (!vm.repeatNewPassword) {
                Core.Util.showAlertDialog('请再次输入新密码');
                return false;
            }
            if (vm.newPassword !== vm.repeatNewPassword) {
                Core.Util.showAlertDialog('两次新密码输入不相同');
                return false;
            }

            return true;
        }

        function goBack() {
            Core.Util.goBack();
        }


    }
})();