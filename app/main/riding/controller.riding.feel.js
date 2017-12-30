/**
 * Created by huyg on 16/8/31.
 */
(function () {
    angular
        .module('app')
        .controller('RidingFeelController', ['$scope', 'Core', RidingFeelController]);


    function RidingFeelController($scope, Core) {
        var vm = $scope;

        var tripId = Core.Util.getParameterByName("trip_id");
        vm.eidtStatus = false;
        vm.ridingFeel = "";

        vm.finish = finish;
        vm.goBack = goBack;

        Core.Api.Trip.getTripDetail(tripId).then(function (responseData) {
            var trip = responseData.trip;
            if (trip.feel) {
                vm.eidtStatus = true;
                vm.ridingFeel = trip.feel;
            }
        }, function (err) {

        });

        function finish() {
            if(vm.ridingFeel) {
                Core.Api.Trip.addTripFeel(tripId, vm.ridingFeel).then(function (responseData) {
                    Core.Data.set('trip_status', 3);
                    Core.Util.goBack();
                    //Core.Util.goToPage('riding-detail', 'riding.detail.html', null, {trip_id: tripId});
                }, function (err) {

                })
            }
        }

        function goBack() {
            Core.Util.goBack();
        }
    }
})();
