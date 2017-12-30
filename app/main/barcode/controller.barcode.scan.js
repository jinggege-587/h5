(function () {
    angular
        .module('app')
        .controller('BarcodeScanController', ['$scope', 'Core', BarcodeScanController]);


    function BarcodeScanController($scope, Core) {
        var vm = $scope;


        vm.scanPicture = scanPicture;
        vm.back = back;

        var ws = null, wo = null;
        var scan = null, domready = false;

        if (window.plus) {
            plus.webview.create();
            plusReady();
        } else {
            document.addEventListener("plusready", plusReady, false);
        }

        // 监听DOMContentLoaded事件
        document.addEventListener("DOMContentLoaded", function () {
            domready = true;
            plusReady();
        }, false);


// H5 plus事件处理
        function plusReady() {
            // if (ws || !window.plus || !domready) {
            //     return;
            // }
            // 获取窗口对象

            ws = plus.webview.currentWebview();
            wo = ws.opener();
            // 开始扫描
            ws.addEventListener('show', function () {
                scan = new plus.barcode.Barcode('bcid');
                scan.onmarked = resolveScanResult;
                scan.start({conserve: true, filename: "_doc/barcode/"});
            });
            // 显示页面并关闭等待框
            ws.show("pop-in");
            wo.evalJS("closeWaiting()");
        }

// 二维码扫描成功
        function resolveScanResult(type, result, file) {

            switch (type) {
                case plus.barcode.QR:
                    type = "QR";
                    break;
                case plus.barcode.EAN13:
                    type = "EAN13";
                    break;
                case plus.barcode.EAN8:
                    type = "EAN8";
                    break;
                default:
                    type = "其它" + type;
                    break;
            }
            result = result.replace(/\n/g, '');

            //var flag = Core.Data.get('last-scan-flag');
            //console.log(flag);
            //if (!flag  || flag != result) {
            Core.Data.set('scan-back', true);
            wo.evalJS("scanResult('" + type + "','" + result + "','" + file + "');");
            //};

            //scan.start({conserve: true, filename: "_doc/barcode/"});
            Core.Util.goBack();
        }

        // 从相册中选择二维码图片
        function scanPicture() {
            plus.gallery.pick(function (path) {
                plus.barcode.scan(path, resolveScanResult, function (error) {
                    plus.nativeUI.alert("无法识别此图片");
                });
            }, function (err) {
                // plus.nativeUI.alert("Failed: " + err.message);

            });
        }

        //返回
        function back() {
            Core.Util.goBack();
        }
    }
})();