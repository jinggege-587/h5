/**
 * Created by whis on 8/1/16.
 */
(function () {
    angular
        .module('app', ['app.core', 'ui.bootstrap'])
        .run(['Core', init])
    ;

    mui.init({
        swipeBack: true, //启用右滑关闭功能
    });

    function init(Core) {
        if (window.plus) {
            plusReady();
        } else {
            document.addEventListener("plusready", plusReady, false);
        }
        var pathname = window.location.pathname;
        var isLoginPage = false;
        if (pathname.indexOf('login.login.html') >= 0) {
            isLoginPage = true;
        }
        if (Core.Data.isGuest()) {
            if (!isLoginPage) {
                console.log('is guest');
                Core.Data.clearAuthData();
                Core.Util.goToPage('login-login', 'login.login.html');
            }
        }
        else {
            if (isLoginPage) {
                Core.Util.goToPage('main-main', 'main.main.html');
            }
        }
    }

    function plusReady() {
        plus.navigator.setStatusBarBackground("#FF780C");
        plus.navigator.setStatusBarStyle("UIStatusBarStyleBlackOpaque");
    }

})();
