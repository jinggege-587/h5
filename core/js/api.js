/**
 * Created by dd on 12/26/15.
 */
(function () {
    angular
        .module('app.core')
        .factory('Api', ['$http', '$q', 'Data', 'Const', 'Log', 'Util', 'Config', Api]);

    function Api($http, $q, Data, Const, Log, Util, Config) {
        var apiList = {
            User: {
                login: ['user/login', 'phone', 'password'],
                register: ['user/register', 'phone', 'password', 'code'],
                updateNickName: ['user/nickname-update', 'username'],
                userInfo: ['user/user-info'],
                updatePassword: ['user/password-update', 'old_password', 'password'],
                resetPassword: ['user/password-reset', 'phone', 'password'],
                pushToggle: ['user/set-push', 'push_set'],
                getLinkHistory: ['user/link-history'],
                addVehicleLinkHistory: ['user/add-vehicle-link-history', 'device_id', 'device_name'],
                validateCode: ['user/validate-code', 'phone', 'code'],
                updateAvatar: ['user/avatar-update', 'avatar'],
                feedback: ['user/feedback', 'content'],
            },

            App: {
                getAppInfo: ['app/get-app', 'os'],
                getNewestHardWareInfo: ['app/get-newest-hardware-info', 'hardware_version'],
                getFailUploadTaskList: ['app/get-fail-upload-task-list', 'uuid'],
                addFailTask: ['app/add-fail-task', 'uuid', 'img_src', 'source_id', 'source_type'],
                deleteFailTask: ['app/delete-fail-task', 'id']
            },

            Car: {
                getVehicleModelList: ['vehicle/vehicle-model-list'],
                getVehicleModelSpecList: ['vehicle/vehicle-model-spec-list', 'model_id']
            },

            Common: {
                getSmsCode: ['user/phone-verification-code-send', 'phone', 'type']
            },

            Vehicle: {
                getVehicleHome: ['vehicle/vehicle-home'],
                getVehicleModelSpecList: ['vehicle/vehicle-model-spec-list', 'model_id'],
                getVehicleInfo: ['vehicle/vehicle-info', 'device_id'],
                bindUser: ['vehicle/bind-user', 'device_id'],
                checkBindUserByDeviceName: ['vehicle/check-user-bind-vehicle-by-device-name', 'device_name'],
                checkBindUser: ['vehicle/check-user-bind-vehicle', 'device_id'],
                updateVehicleInfo: ['vehicle/update-vehicle-ride-info', 'device_id', 'ride_mileage', 'ride_time'],
                finVehicleByItemCode: ['vehicle/get-vehicle-by-item-code', 'item_code'],
                getBinderVehicle: ['vehicle/get-binder-vehicles'],
                linkVehicle: ['vehicle/link-vehicle', 'device_name']
            },

            Trip: {
                getTripList: ['trip/trip-list', 'page'],
                getTripDetail: ['trip/trip-detail', 'trip_id'],
                getTripRecordList: ['trip/trip-record', 'trip_id'],
                addTripFeel: ['trip/trip-feel-add', 'id', 'feel'],
                deleteTrip: ['trip/trip-delete', 'id'],
                //getCurrentTrip: ['trip/current-trip'],
                //updateTripStatus: ['trip/update-trip-status', 'trip_id', 'status'],
                createTrip: ['trip/create', 'device_id', 'status', 'start_time', 'end_time', 'record', 'start_latitude',
                    'start_longitude', 'end_latitude', 'end_longitude', 'mileage', 'total_use_time', 'kcal', 'max_speed'],
                addTripImg: ['trip/add-trip-img', 'trip_id', 'img'],
                //reportTrip: ['trip/report', 'trip_id', 'data'],
                //finishTrip: ['trip/finish', 'trip_id', 'end_latitude', 'end_longitude'],
                //cancelTrip: ['trip/cancel', 'trip_id', 'end_latitude', 'end_longitude']
            }

        };

        var api = {};
        for (var moduleKey in apiList) {
            var moduleApiList = apiList[moduleKey];
            api[moduleKey] = {};
            for (var functionName in moduleApiList) {
                var config = moduleApiList[functionName];
                api[moduleKey][functionName] = (function (config) {
                    return function () {
                        var action = config[0];
                        var data = {};
                        if (config.length > 1) {
                            for (var i = 1; i < config.length; i++) {
                                var key = config[i];
                                var value = arguments[i - 1];
                                if (value === undefined) {
                                    continue;
                                }
                                data[key] = value;
                            }
                        }
                        return post(action, data);
                    };
                })(config);
            }
        }

        api.getUrl = getUrl;

        return api;


        function transformObjectToUrlencodedData(obj) {
            var p = [];
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    p.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
                }
            }
            return p.join('&');
        }

        function getUrl(api, data) {
            var token = Data.getToken();
            var url = Const.NET.END_POINT + '/' + api + '?token=' + token + '&client=' + Const.NET.CLIENT + '&version=' + Const.NET.VERSION + '&';
            url = url + transformObjectToUrlencodedData(data);
            return url;
        }

        function post(api, data) {
            var token = Data.getToken();
            var url = Const.NET.END_POINT + '/' + api + '?token=' + token + '&client=' + Const.NET.CLIENT + '&version=' + Const.NET.VERSION + '&sp=' + Const.NET.SP + '&';
            Log.d(url + transformObjectToUrlencodedData(data));
            return $http({
                method: 'POST',
                url: url,
                data: transformObjectToUrlencodedData(data),
                headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'}
            }).then(function (response) {
                if (response.data.hasOwnProperty('code') && response.data.code == Const.ERROR.ERROR_TOKEN_INVALID) {
                    Data.clearAuthData();
                    Core.Util.goToPage('login-login', 'login.login.html');
                }

                if (response.data.code == 0) {
                    return response.data.data;
                }

                if (response.data.hasOwnProperty('code')) {
                    return $q.reject({
                        code: response.data.code,
                        message: response.data.message
                    })
                }

                return $q.reject({
                    code: Const.ERROR.ERROR_NETWORK,
                    response: response
                });
            }, function (reason) {
                return {
                    code: Const.ERROR.ERROR_NETWORK,
                    response: reason
                }
            });
        }

        function handlePost(api, data) {
            return post(api, data).then(function (response) {
                if (response.code >= 0 && response.code == 0 && response.data) {
                    return $q.resolve(response.data);
                }

                var code = response.code ? response.code : -2;
                var message = response.message ? response.message : undefined;
                return $q.resolve({
                    code: code,
                    message: message
                });
            }, function (errorResponse) {
                return $q.reject({
                    code: Const.ERROR.ERROR_NETWORK,
                    response: errorResponse
                })
            });
        }
    }
})();