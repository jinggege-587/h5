(function () {
    angular
        .module('app')
        .controller('LoginLoginController', ['$scope', 'Core', LoginLoginController]);


    function LoginLoginController($scope, Core) {
        var vm = $scope;

        vm.login = login;
        vm.goBack = goBack;
        vm.register = register;
        vm.forgetPassword = forgetPassword;
        vm.stopTouch =  Core.Native.Core.cancelTouchScreen;
        var isLoginMainExist = false;

        vm.phone = Core.Data.get('username');
        vm.password = Core.Data.get('password');

        Core.Data.set(Core.Const.DATA.KEY_CAR_LINKED, false);
        //Core.Data.set(Core.Const.DATA.KEY_CURRENT_DEVICE_MAC_ADDRESS, "");

        function goBack() {
            if(isLoginMainExist) {
                Core.Util.goBack();
            } else {
                Core.Util.goToPage('login-main', 'login.main.html');
            }
        }

        function forgetPassword() {
            Core.Util.goToPage('login-forget-password', 'login.forget-password.html');
        }

        function register() {
            Core.Util.goToPage('login-register', 'login.register.html');
        }

        function login() {

            if (!checkParams()) {
                return;
            }
            Core.Util.showLoading();
            Core.Api.User.login(vm.phone, vm.password).then(function (responseData) {
                Core.Util.hideLoading();
                Core.Data.set("username", vm.phone);
                Core.Data.set("password", vm.password);
                Core.Data.setToken(responseData.token);
                Core.Data.setUser(responseData.user);
                Core.Util.goToPage('main-main', 'main.main.html');
            }, function (err) {
                Core.Util.hideLoading();
                Core.Util.showAlertDialog('账号或密码错误');
                Core.Util.hideLoading();
            });
        }

        function checkParams() {
            if (!vm.phone) {
                Core.Util.showAlertDialog('手机号不能为空');
                return false;
            }
            if (!vm.password) {
                Core.Util.showAlertDialog('密码不能为空');
                return false;
            }
            return true;
        }

        if(!window.plus) {
            document.addEventListener('plusready', function () {
                if (window.plus) {
                    var pages = plus.webview.all();
                    for (var i = 0; i < pages.length; i++) {
                        var page = pages[i];
                        if (page.id == 'login-main') {
                            isLoginMainExist = true;
                        }
                    }
                }
            }, false);
        }
        // window.addEventListener('should-cache-sub-page', cachePage, false);
        window.addEventListener('page-show', function () {
            vm.phone = Core.Data.get('username');
            vm.password = Core.Data.get('password');
            Core.$timeout(function () {
                vm.$apply();
            });
        });
        function cachePage() {
            Core.Util.cachePage('login-forget-password', 'login.forget-password.html');
            Core.Util.cachePage('login-register', 'login.register.html');
            Core.Util.cachePage('main-main', 'main.main.html');
        }
    }
})();