(function () {
    angular
        .module('app')
        .controller('UserMainController', ['$scope', 'Core', UserMainController]);


    function UserMainController($scope, Core) {
        var vm = $scope;
        vm.openUserDetail = openUserDetail;
        vm.about = about;
        vm.feedback = feedback;
        vm.course = course;


        window.addEventListener('page-show', function () {
            console.log("page-show");
            init();
            setSettingToggleListen();
        });

        function about() {
            Core.Util.goToPage('user-about', 'user.about.html');
        }

        function feedback() {
            Core.Util.goToPage('user-feedback', 'user.feedback.html');
        }

        function course(){
            Core.Util.goToPage('user-course', 'user.course.html');
        }

        function init() {
            Core.Api.User.userInfo().then(
                function (responseData) {
                    vm.user = responseData.user;
                    vm.user.total_use_time = Core.Util.sprintf("%.2f", vm.user.total_use_time / 3600);
                    Core.Util.imgLoader(vm.user.avatar, function (path) {
                        vm.avatar = path;
                        Core.$timeout(function () {
                            vm.$apply();
                        });
                    });
                    var setting = vm.user.setting;

                    if (setting) {
                        vm.setting = JSON.parse(setting);
                    }
                },
                function (err) {
                    mui.alert(err.message);
                }
            );
        }

        function openUserDetail() {
            Core.Util.goToPage('user-detail', 'user.detail.html');
        }

        function setSettingToggleListen() {
            document.getElementById("setting").addEventListener("toggle", function (event) {
                if (event.detail.isActive) {
                    togglePushSet(Core.Const.APP.PUSH_SET.OPEN);
                } else {
                    togglePushSet(Core.Const.APP.PUSH_SET.CLOSE);
                }
            })
        }

        function togglePushSet(set) {
            Core.Api.User.pushToggle(set).then(function (responseData) {

            }, function (err) {
                mui("#setting").switch().toggle();
            })
        }

    }
})();