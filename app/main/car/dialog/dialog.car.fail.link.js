(function () {
    angular
        .module('app')
        .controller('DialogCarFailLinkController', ['$scope', '$uibModalInstance', 'Core', DialogCarFailLinkController]);


    function DialogCarFailLinkController($scope, $uibModalInstance, Core) {
        var vm = $scope;

        vm.tryAgain = tryAgain;
        vm.close = close;
        vm.openSolutionPage = openSolutionPage;

        function tryAgain() {
            $uibModalInstance.close();
            Core.publish('link-again');
        }

        function close(){
            $uibModalInstance.dismiss('cancel');
        }

        function openSolutionPage() {
            $uibModalInstance.close();
            //Core.Util.goToPage('car-link-solution', 'car.link.solution.html');
        }

        //window.addEventListener('should-cache-sub-page', cachePage, false);
        //function cachePage() {
        //    Core.Util.cachePage('car-link-solution', 'car.link.solution.html');
        //}

    }
})();