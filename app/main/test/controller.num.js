(function () {
    angular
        .module('app')
        .controller('NumController', ['$scope', 'Core', NumController]);


    function NumController($scope, Core) {
        var vm = $scope;
        vm.num = Core.Util.luoBoCarHexToSingleBatch('CCB70940');
    }
})();