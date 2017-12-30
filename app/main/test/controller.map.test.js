(function () {
    angular
        .module('app')
        .controller('MapTestController', ['$scope', 'Core', MapTestController]);


    function MapTestController($scope, Core) {
        var vm = $scope;

        function plusReady() {
            var lng = 116.397428;
            var lat = 39.90923;
            var map = new AMap.Map("container", {
                resizeEnable: true,
                center: [lng, lat],
                zoom: 17
            });
            var lineArr = [[lng, lat]];

            Core.$interval(function () {
                lng = lng + 0.0001;
                lineArr.push([lng, lat]);
                Core.Map.drawSport(map, lineArr);
            }, 300);

        }

        if (window.plus) {
            plusReady();
        } else {
            document.addEventListener("plusready", plusReady, false);

        }
        // 将webview内容绘制到Bitmap对象中


    }
})();