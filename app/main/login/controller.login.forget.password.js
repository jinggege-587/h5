(function () {
    angular
        .module('app')
        .controller('LoginForgetPasswordController', ['$scope', 'Core', LoginForgetPasswordController]);


    function LoginForgetPasswordController($scope, Core) {
        var vm = $scope;
        vm.goBack = goBack;
        vm.next = next;
        vm.getSmsCode = getSmsCode;
        vm.stopTouch =  Core.Native.Core.cancelTouchScreen;
        vm.wait = {name: '获取验证码', time: 0, timeCount: 30};
        // vm.vcode = 1234;
        var time;

        // 注册type是1，修改密码type是2； BY ljq 根据短信内容判断的；
        var type = 2;

        vm.back = back;
        vm.next = next;

        function goBack() {
            Core.Util.goBack();
        }

        function getSmsCode() {
            if (!vm.phone) {
                Core.Util.showAlertDialog('请输入手机号');
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
                    if (err.code == 5) {
                        Core.Util.showAlertDialog('用户不存在');
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
                        vm.wait.name = "获取验证码";
                    }

                }
            }
        }

        function back() {
            Core.Util.goBack();
        }

        function next() {
            if (!checkParams()) {
                return;
            }
            validateCode(function () {
                Core.Data.set(Core.Const.DATA.KEY_PHONE, vm.phone);
                Core.Util.goToPage('login-reset-password', 'login.reset-password.html');
            });

        }

        function checkParams() {
            if (!vm.phone) {
                Core.Util.showAlertDialog('手机号不能为空');
                return false;
            }
            if (!vm.vcode) {
                Core.Util.showAlertDialog('验证码不能为空');
                return false;
            }

            return true;
        }

        function validateCode(success) {
            Core.Api.User.validateCode(vm.phone, vm.vcode).then(success, function (err) {
                var errMsg;
                if (err.code == 5) {
                    errMsg = "用户不存在";
                } else if (err.code == -1) {
                    errMsg = "无效的验证码";
                } else {
                    errMsg = "服务端错误";
                }
                Core.Util.showAlertDialog(errMsg);
            });
        }

        window.addEventListener('should-cache-sub-page', cachePage, false);
        function cachePage() {
            Core.Util.cachePage('login-reset-password', 'login.reset-password.html');
        }
    }
})();