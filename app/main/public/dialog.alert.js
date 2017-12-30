(function () {
    angular
        .module('app')
        .controller('DialogAlertController', ['$scope', '$uibModalInstance', 'Core', 'message', DialogAlertController]);


    function DialogAlertController($scope, $uibModalInstance, Core, message) {
        var vm = $scope;

        vm.message = message;

        vm.ok = ok;
        vm.cancel = cancel;

        function ok() {
            $uibModalInstance.close();
        }

        function cancel() {
            $uibModalInstance.dismiss('cancel');
        }
    }
})();