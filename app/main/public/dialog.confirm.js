(function(){
    angular
        .module('app')
        .controller('DialogConfirmController', ['$scope', '$uibModalInstance', 'title', 'content','confirm', DialogConfirmController]);

    function DialogConfirmController($scope, $uibModalInstance, title, content, confirm) {
        var vm = $scope;

        vm.title = title;
        vm.content = content;
        vm.confirm = confirm;
        vm.disable = "取消";
        vm.close = close;

        vm.ok = ok;
        vm.cancel = cancel;

        function close(){
            $uibModalInstance.dismiss('cancel');
        }

        function ok() {
            $uibModalInstance.close();
        }

        function cancel() {
            $uibModalInstance.dismiss('cancel');
        }
    }
})();