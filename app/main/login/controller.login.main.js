(function () {
    angular
        .module('app')
        .controller('LoginMainController', ['$scope', 'Core', LoginMainController]);


    function LoginMainController($scope, Core) {
        var vm = $scope;
        vm.register = register;
        vm.login = login;
        vm.quickLogin = quickLogin;
        vm.isGuest = Core.Data.isGuest();


        if (window.plus) {
            plusready();
        } else {
            document.addEventListener('plusready', function () {
                plusready();
            }, false);
        }


        function plusready() {
            if (window.plus && plus.os.name == 'Android') {
                Core.Util.openBluetooth();
            }
            Core.Data.set(Core.Const.DATA.KEY_CAR_LINKED, false);
            Core.Data.set(Core.Const.DATA.KEY_CURRENT_DEVICE_MAC_ADDRESS, "");
            Core.Data.set(Core.Const.EVENT.ON_UPGRADE, false);
            if (!Core.Data.isGuest()) {
                Core.Util.showLoading();
                Core.Util.goToPage('main-main', 'main.main.html');
            }
            Core.Data.set('firstTip', true);
            //if (window.plus && plus.os.name == 'Android') {
            Core.$timeout(function () {
                //Core.Native.Core.touchScreen();
                Core.Util.hideLoading();
            }, 500);
            //}
        }

        //var webViewRegister,webViewLogin,webViewCarMain;
        //document.addEventListener('plusready', function(){ //扩展的js对象在plusready后方可使用
        //    webViewRegister = plus.webview.create("login.register.html");
        //    webViewLogin =  plus.webview.create("login.login.html");
        //    webViewCarMain = plus.webview.create("car.main.html");
        //});

        function register() {
            //webViewRegister.show("slide-in-right",200);
            Core.Util.goToPage('login-register', 'login.register.html');
        }

        function login() {
            //webViewLogin.show("slide-in-right",200);
            Core.Util.goToPage('login-login', 'login.login.html');
        }

        function quickLogin() {
            Core.Util.showLoading();
            var username = Core.Data.get('username');
            var password = Core.Data.get('password');
            if (username && password) {
                Core.Api.User.login(username, password).then(function (responseData) {
                    Core.Util.hideLoading();
                    Core.Data.set("username", vm.phone);
                    Core.Data.set("password", vm.password);
                    Core.Data.setToken(responseData.token);
                    Core.Data.setUser(responseData.user);
                    Core.Util.goToPage('main', 'main.main.html');
                }, function (err) {
                    Core.Util.hideLoading();
                    Core.Util.showAlertDialog('快速登录失败,请手动登录');
                })
            } else {
                Core.Util.hideLoading();
                Core.Util.showAlertDialog('快速登录失败,请手动登录');
            }

        }

        //function initModal() {
        //    $ionicModal.fromTemplateUrl('public.dialog.alert.html', {
        //        scope: $scope,
        //        animation: 'slide-in-up'
        //    }).then(function (modal) {
        //        vm.modal = modal;
        //    });
        //
        //}
        //
        //function openModal(content) {
        //    vm.content = content;
        //    vm.modal.show();
        //}
        //
        //function hideModal() {
        //    vm.modal.hide();
        //}

        // document.addEventListener('plusready', cachePage, false);
        window.addEventListener('page-show', cachePage, false);
        function cachePage() {
            Core.Util.cachePage('login-login', 'login.login.html');
            Core.Util.cachePage('login-register', 'login.register.html');
        }
    }
})();