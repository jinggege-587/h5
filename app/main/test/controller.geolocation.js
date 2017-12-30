(function () {
    angular
        .module('app')
        .controller('GeolocationController', ['$scope', 'Core', GeolocationController]);


    function GeolocationController($scope, Core) {
        var vm = $scope;
        vm.system = system;
        vm.amap = amap;
        vm.systemWatcher = systemWatcher;
        vm.cancelSystemWatcher = cancelSystemWatcher;
        vm.amapWatcher = amapWatcher;
        vm.cancelAmapWatcher = cancelAmapWatcher;
        vm.wgs84 = wgs84;
        vm.gcj02 = gcj02;
        vm.bd09 = bd09;
        vm.bd09ll = bd09ll;
        vm.enableHighAccuracy = enableHighAccuracy;


        var a, b, systemW, amapW;
        var type = 'wgs84';
        var flag = true;

        function amap() {
            vm.text = "amap" + "---" + type + "---" + flag;
            if (angular.isDefined(a)) {
                Core.$interval.cancel(a);
                a = undefined;
            }
            b = Core.$interval(function () {
                plus.geolocation.getCurrentPosition(function (p) {
                    alert('amap:' + p.coords.speed);
                }, function (e) {
                    alert('amap error:' + e);
                }, {provider: 'amap', coordsType: type, enableHighAccuracy: flag});
            }, 1000);
        }

        function system() {
            vm.text = "system" + "---" + type + "---" + flag;
            if (angular.isDefined(b)) {
                Core.$interval.cancel(b);
                b = undefined;
            }
            a = Core.$interval(function () {
                plus.geolocation.getCurrentPosition(function (p) {
                    alert('system:' + p.coords.speed);
                }, function (e) {
                    alert('system error:' + e);
                }, {provider: 'system', coordsType: type, enableHighAccuracy: flag});
            }, 1000);

        }

        function systemWatcher() {
            vm.text = "systemWatcher" + "---" + type + "---" + flag;
            systemW = plus.geolocation.watchPosition(function (p) {
                alert('systemWatcher:' + p.coords.speed);
            }, function (e) {
                alert('systemWatcher err:' + e);
            }, {provider: 'system', coordsType: type, enableHighAccuracy: flag});
        }

        function cancelSystemWatcher() {
            plus.geolocation.clearWatch(systemW);
            systemW = null;
        }

        function amapWatcher() {
            vm.text = "amapWatcher" + "---" + type + "---" + flag;
            amapW = plus.geolocation.watchPosition(function (p) {
                alert('amapWatcher:' + p.coords.speed);
            }, function (e) {
                alert('amapWatcher err:' + e);
            }, {provider: 'system', coordsType: type, enableHighAccuracy: flag});
        }

        function cancelAmapWatcher() {
            plus.geolocation.clearWatch(amapW);
            amapW = null;
        }

        function wgs84() {
            type = "wgs84"
        }

        function gcj02() {
            type = "gcj02"
        }

        function bd09() {
            type = "bd09"
        }

        function bd09ll() {
            type = "bd09ll"
        }

        function enableHighAccuracy() {
            flag = !flag
        }

    }
})();