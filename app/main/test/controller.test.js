(function () {
    angular
        .module('app')
        .controller('TestController', ['$scope', 'Core', TestController]);


    function TestController($scope, Core) {
        $scope.report = report;
        //$scope.nativeReport = nativeReport;
        //$scope.cancel = cancel;
        //
        //var position;
        //
        //if (window.plus) {
        //    plusReady();
        //} else {
        //    document.addEventListener('plusready', plusReady, false);
        //}
        //
        //function plusReady() {
        //    var userId = 100;
        //    position = window.dix.positionPlug.getPosition(userId);
        //}
        //
        //function cancel() {
        //    position.cancel();
        //}
        //
        function report() {
            Core.Util.goToPage('sport-main', 'sport.main.html', null, null, "slide-in-bottom");
        }
        //
        function nativeReport() {
           position.config(true, 10).report();
        }
        document.addEventListener("plusready", onPlusReady, false);
        function onPlusReady() {
            document.addEventListener("pause", onAppPause, false);
            document.addEventListener("resume", onAppReume, false);
            document.addEventListener( "netchange", onNetChange, false );
        }

        function onAppPause() {
            alert( "前台到后台" );
        }

        function onAppReume() {
            alert( "后台到前台" );
        }

        function onNetChange() {
            var nt = plus.networkinfo.getCurrentType();
            switch ( nt ) {
                case plus.networkinfo.CONNECTION_ETHERNET:
                case plus.networkinfo.CONNECTION_WIFI:
                    alert("Switch to Wifi networks!");
                    break;
                case plus.networkinfo.CONNECTION_CELL2G:
                case plus.networkinfo.CONNECTION_CELL3G:
                case plus.networkinfo.CONNECTION_CELL4G:
                    alert("Switch to Cellular networks!");
                    break;
                default:
                    alert("Not networks!");
                    break;
            }
        }

    }
})();