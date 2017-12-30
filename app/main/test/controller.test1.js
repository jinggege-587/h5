(function () {
    angular
        .module('app')
        .controller('Test1Controller', ['$scope', 'Core', Test1Controller]);


    function Test1Controller($scope, Core) {
        $scope.captureWebview = captureWebview;
        //$scope.captureWebview2 = captureWebview2;
        //
        function captureWebview() {
            Core.publish("test", "1111");
        }


        Core.on("test", function () {
            console.log("ok");
        })
    }
})();