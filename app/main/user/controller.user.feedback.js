(function () {
    angular
        .module('app')
        .controller('UserFeedBackController', ['$scope', 'Core', UserFeedBackController]);


    function UserFeedBackController($scope, Core) {
        var vm = $scope;
        vm.submitFeedBack = submitFeedBack;
        vm.stopTouch =  Core.Native.Core.cancelTouchScreen;
        vm.content = "";
        function submitFeedBack() {
            if (!vm.content) {
                mui.toast('请输入内容');
                return;
            }
            Core.Api.User.feedback(vm.content).then(
                function (responseData) {
                    Core.Util.goBack();
                    mui.toast('反馈成功');
                },
                function (err) {
                }
            );
        }

    }
})();