(function () {
    angular
        .module('app')
        .controller('UserAboutController', ['$scope', 'Core', '$http', UserAboutController]);


    function UserAboutController($scope, Core, $http) {
        var vm = $scope;
        var isNew = true;
        var downLoadUrl;
        vm.updateVersion = updateVersion;

        if (window.plus) {
            getAppVersionByWeb();
        } else {
            document.addEventListener('plusready', getAppVersionByWeb, false);
        }

        function updateVersion() {

            if (!isNew && downLoadUrl) {
                var fileName;
                if (plus.os.name == 'Android') {
                    fileName = '_doc/update/app_' + Core.Util.time() + '.apk';
                } else {
                    fileName = '_doc/update/app_' + Core.Util.time() + '.ipa';
                }
                plus.downloader.createDownload(downLoadUrl, {file_name: fileName}, function (d, status) {
                    console.log('开始下载');
                    if (status == 200) {
                        console.log('下载成功');
                        installWgt(d.filename); // 安装wgt包
                    } else {
                        console.log('下载失败');
                        plus.nativeUI.alert("下载安装包失败！");
                    }
                    plus.nativeUI.closeWaiting();
                }).start();
            } else {
                mui.toast("无版本可更新");
            }
        }

        function installWgt(path) {
            plus.nativeUI.showWaiting("安装应用...");
            plus.runtime.install(path, {}, function () {
                plus.nativeUI.closeWaiting();
                plus.nativeUI.alert("应用资源更新完成！", function () {
                    plus.runtime.restart();
                });
            }, function (e) {
                plus.nativeUI.closeWaiting();
                plus.nativeUI.alert("安装应用失败[" + e.code + "]：" + e.message);
            });
        }

        function getAppVersionByWeb() {
            vm.currentVersion = plus.runtime.version;
            var os;
            if (plus.os.name == 'Android') {
                os = '2';
            } else {
                os = '1';
            }
            Core.Api.App.getAppInfo(os).then(
                function (responseData) {
                    var appInfo = responseData.app_info;
                    var version = appInfo.version_name;
                    downLoadUrl = Core.Const.NET.FILE_URL_PREFIX + appInfo.down_load_url;
                    isNew = version == vm.currentVersion;
                    vm.versionDesc = isNew ? '已是最新版本' : '最新版本为' + version;
                },
                function (err) {
                    //getAppVersionByFir();
                }
            );
        }
    }
})();