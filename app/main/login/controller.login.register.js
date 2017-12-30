(function () {
    angular
        .module('app')
        .controller('LoginRegisterController', ['$scope', 'Core', LoginRegisterController]);


    function LoginRegisterController($scope, Core) {
        var vm = $scope;
        vm.register = register;
        vm.getSmsCode = getSmsCode;
        vm.forgetPassword = forgetPassword;
        vm.goBack = goBack;
        vm.stopTouch =  Core.Native.Core.cancelTouchScreen;
        vm.wait = {name: '发送验证码', time: 0, timeCount: 30};
        // vm.vcode = 1234;
        var time;


        // 注册type是1，修改密码type是2； BY ljq 根据短信内容判断的；
        var type = 1;

        Core.Data.set(Core.Const.DATA.KEY_CAR_LINKED, false);
        Core.Data.set(Core.Const.DATA.KEY_CURRENT_DEVICE_MAC_ADDRESS, "");

        function register() {
            if (check()) {
                Core.Api.User.register(vm.phone, vm.password, vm.vcode).then(function (responseData) {
                    Core.Data.set("username", vm.phone);
                    Core.Data.set("password", vm.password);
                    Core.Data.setToken(responseData.token);
                    Core.Data.setUser(responseData.user);
                    Core.Util.goToPage('main-main', 'main.main.html');
                }, function (err) {
                    var errMsg;
                    if (err.code == -1) {
                        errMsg = "无效的验证码";
                    } else if (err.code = 6) {
                        errMsg = "用户已存在";
                    } else {
                        errMsg = "服务端错误";
                    }
                    Core.Util.showAlertDialog(errMsg);
                });
            }
        }

        function check() {
            if (!vm.phone) {
                Core.Util.showAlertDialog("请输入手机号");
                return false;
            }
            if (!vm.password) {
                Core.Util.showAlertDialog("请输入密码");
                return false;
            }
            if (!vm.vcode) {
                Core.Util.showAlertDialog("请输入验证码");
                return false;
            }
            return true;
        }

        function getSmsCode() {
            if (!vm.phone) {
                Core.Util.showAlertDialog("请输入手机号");
                return false;
            }
            if (vm.wait.time > 0) {
                return;
            }
            Core.Api.Common.getSmsCode(vm.phone, type).then(
                function (data) {
                    vm.wait.name = "重新发送(" + vm.wait.timeCount + ")";
                    time = Core.$interval(countDown, 1000, vm.wait.timeCount);
                }, function (err) {
                    if (err.code == 6) {
                        Core.Util.showAlertDialog('用户已被注册');
                    }
                }
            );
            function countDown() {
                if (vm.wait.time == 0) {
                    vm.wait.time = vm.wait.timeCount - 1;
                    vm.wait.name = "重新发送(" + vm.wait.time + ")";
                } else {
                    vm.wait.time--;
                    vm.wait.name = "重新发送(" + vm.wait.time + ")";
                    if (vm.wait.time == 0) {
                        vm.wait.name = "发送验证码";
                    }

                }
            }
        }

        function forgetPassword() {
            Core.Util.goToPage('login-forget-password', 'login.forget-password.html');
        }

        function goBack() {
            Core.Util.goBack();
        }

        window.addEventListener('should-cache-sub-page', cachePage, false);
        function cachePage() {
            Core.Util.cachePage('login-login', 'login.login.html');
        }


    }
})();