(function () {
    angular
        .module('app')
        .controller('LoginResetPasswordController', ['$scope', 'Core', LoginResetPasswordController]);


    function LoginResetPasswordController($scope, Core) {
        var vm = $scope;
        var resetResult = false;

        vm.goBack = goBack;
        vm.reset = reset;
        vm.back = back;
        vm.resetPassword = resetPassword;
        vm.stopTouch =  Core.Native.Core.cancelTouchScreen;

        function goBack() {
            Core.Util.goBack();
        }

        function reset() {

            if (check()) {
                var phone = Core.Data.get(Core.Const.DATA.KEY_PHONE);
                Core.Api.User.resetPassword(phone, vm.newPassword).then(function (responseData) {
                    Core.Util.showAlertDialog('重置密码成功');
                    resetResult = true;
                    Core.Data.set("password", vm.newPassword);
                    Core.Util.goToPage('login-login', 'login.login.html');
                }, function (err) {
                    var errMsg;
                    if (err.code == -1) {
                        errMsg = "无效的验证码";
                    } else if (err.code = 10) {
                        errMsg = "用户不存在";
                    } else {
                        errMsg = "服务端错误";
                    }
                    Core.Util.showAlertDialog(errMsg);
                    resetResult = false;
                })
            }
        }

        function check() {
            if (!vm.newPassword) {
                Core.Util.showAlertDialog('请输入新密码');
                return false;
            }
            if (!vm.confirmPassword) {
                Core.Util.showAlertDialog('请重复输入新密码');
                return false;
            }
            if (vm.newPassword != vm.confirmPassword) {
                Core.Util.showAlertDialog('两次密码不正确');
                return false;
            }

            return true;
        }

        function back() {
            Core.Util.goBack();
        }

        function resetPassword() {
            if (!checkParams()) {
                return;
            }

            var phone = Core.Data.get(Core.Const.DATA.KEY_PHONE);
            Core.Api.User.resetPassword(phone, vm.newPassword).then(
                function (responseData) {
                    mui.toast('修改成功, 请重新登录');
                    Core.$timeout(function () {
                        Core.Util.goToPage('login-login', 'login.login.html');
                    }, 2000);
                },
                function (err) {
                    Core.Util.showAlertDialog(err.message);
                }
            );
        }

        function checkParams() {
            if (!vm.newPassword) {
                Core.Util.showAlertDialog('请输入新密码');
                return false;
            }
            if (!vm.confirmPassword) {
                Core.Util.showAlertDialog('请再次输入新密码');
                return false;
            }
            if (vm.newPassword !== vm.confirmPassword) {
                Core.Util.showAlertDialog('两次密码输入不相同');
                return false;
            }

            return true;
        }

        window.addEventListener('should-cache-sub-page', cachePage, false);
        function cachePage() {
            Core.Util.cachePage('login-login', 'login.login.html');
        }
    }
})();