(function () {
    angular
        .module('app')
        .controller('UserDetailController', ['$rootScope', '$scope', 'Core', UserDetailController]);


    function UserDetailController($rootScope, $scope, Core) {
        var vm = $scope;
        var isLogout;

        vm.updateNickName = updateNickName;
        vm.updatePassword = updatePassword;
        vm.logout = logout;
        vm.goBack = goBack;
        vm.avatarUpdate = avatarUpdate;
        vm.galleryImg = galleryImg;
        vm.captureImg = captureImg;
        vm.cancel = cancel;
        vm.showMask = false;

        window.addEventListener('page-show', function () {
            isLogout = false;
            init();
        });

        mui.init({
            beforeback: function () {
                var Scanner = plus.webview.getWebviewById('login-login');
                mui.fire(Scanner, 'closeOtherPage');
                return true;
            }
        });


        function init() {
            Core.Api.User.userInfo().then(
                function (responseData) {
                    var user = responseData.user;
                    vm.username = user.username == '' ? user.phone : user.username;
                    Core.Util.imgLoader(user.avatar, function (path) {
                        vm.avatar = path;
                        Core.$timeout(function () {
                            vm.$apply();
                        });
                    });
                },
                function (err) {
                    mui.alert(err.message);
                }
            );
        }

        function updateNickName() {
            Core.Util.goToPage('user-reset-nickname', 'user.reset.nickname.html');
        }

        function updatePassword() {
            Core.Util.goToPage('user-reset-pwd', 'user.reset.pwd.html');
        }

        function logout() {
            var linkId = Core.Data.get(Core.Const.DATA.KEY_CURRENT_DEVICE_MAC_ADDRESS);
            if (linkId) {
                Core.Native.BLE.disconnect(linkId);
            }
            Core.Data.set(Core.Const.DATA.KEY_CAR_LINKED, false);
            Core.Data.set(Core.Const.DATA.KEY_CURRENT_DEVICE_MAC_ADDRESS, "");
            Core.Data.set(Core.Const.EVENT.ON_UPGRADE, false);
            Core.Data.setUser(null);
            Core.Data.setToken(null);
            Core.Data.set("password", "");
            mui.toast('登出成功');
            Core.Util.goToPage('login-login', 'login.login.html');
            Core.Util.closeAllWithoutPage('login-login');
        }


        function goBack() {
            Core.Data.set('fromUser', true);
            Core.Util.goBack();
        }

        function avatarUpdate() {
            vm.showMask = true;

        }

        function galleryImg() {
            vm.showMask = false;
            plus.gallery.pick(function (path) {
                var outPath = "_doc/" + Core.Util.time() + ".png";
                plus.zip.compressImage({
                        src: path,
                        dst: outPath,
                        width: '270px',
                    },
                    function (e) {
                        //var localAvatarPath = e.target;
                        Core.Util.upLoad(Core.Const.NET.IMG_UPLOAD_END_POINT, outPath, 10, function (fileName) {
                            //createTrip(fileName);
                            Core.Api.User.updateAvatar(fileName).then(function () {

                                Core.Data.set(fileName, outPath);
                                vm.avatar = Core.Const.NET.IMG_URL_PREFIX + fileName;
                                Core.Util.fileRemove(path);
                            }, function () {
                            });
                        });
                    }, function (error) {
                    });
            }, function (e) {
                //outSet( "取消选择图片" );
            }, {filter: "image", multiple: false});
        }

        function cancel() {
            vm.showMask = false;
        }

        function captureImg() {
            vm.showMask = false;
            var cmr = plus.camera.getCamera();
            var res = cmr.supportedImageResolutions[0];
            var fmt = cmr.supportedImageFormats[0];
            cmr.captureImage(function (path) {
                    var outPath = "_doc/" + Core.Util.time() + ".png";
                    console.log("pick path", path);
                    plus.zip.compressImage({
                            src: path,
                            dst: outPath,
                            width: '270px',
                        },
                        function () {
                            Core.Util.upLoad(Core.Const.NET.IMG_UPLOAD_END_POINT, outPath, 10, function (fileName) {
                                //createTrip(fileName);
                                Core.Api.User.updateAvatar(fileName).then(function () {
                                    Core.Data.set(fileName, outPath);
                                    vm.avatar = Core.Const.NET.IMG_URL_PREFIX + fileName;
                                    Core.Util.fileRemove(path);
                                }, function () {
                                });
                            });
                        }, function (error) {
                        });

                },
                function (error) {
                },
                {resolution: res, format: fmt}
            );
        }


        window.addEventListener('should-cache-sub-page', cachePage, false);
        function cachePage() {
            //Core.Util.cachePage('login-login', 'login.login.html');
            //Core.Util.cachePage('user-reset-pwd', 'user.reset.pwd.html');
            //Core.Util.cachePage('user-reset-nickname', 'user.reset.nickname.html');
        }

    }
})();