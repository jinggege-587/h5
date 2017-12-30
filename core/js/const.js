/**
 * Created by dd on 12/26/15.
 */
(function () {
    angular
        .module('app.core')
        .factory('Const', ['$window', Const]);

    function Const($window) {
        var Const = {
            ERROR: {
                ALREADY_EXISTS: 6,
                INVALID_USER_NAME: 5,
                ERROR_PASSWORD: 3,
                ERROR_NETWORK: -10000,
                ERROR_INVALID: -1,
                ERROR_PARAM_NOT_SET: 1,
                ERROR_TOKEN_INVALID: 2,
                ERROR_LOGIN_FAIL: 3,
                ERROR_WRONG_PARAM: 4,
                ERROR_NOT_EXIST: 5,
                ERROR_EXIST: 6,
                ERROR_ORG_NOT_EXIST: 7,
                ERROR_ORG_MEMBER_NOT_EXISTS: 8,
                ERROR_REGISTER: 9,
                ERROR_USER_NOT_EXISTS: 10,
                ERROR_PHONE_HAS_BEEN_TAKEN: 11,
                ERROR_BIND_USER_BIND_EXISTS: 12,
                ERROR_WRONG_TYPE: 13,
                ERROR_SAVE_ERROR: 14,
                ERROR_ACTION_NOT_ALLOWED: 15,
                ERROR_WRONG_VERIFICATION_CODE: 16,
                ERROR_SEND_PHONE_VCODE_TOO_OFTEN: 17
            },

            SYSTEM: {
                LOG_LEVEL_ERROR: 1,
                LOG_LEVEL_WARN: 2,
                LOG_LEVEL_INFO: 3,
                LOG_LEVEL_TRACE: 4,
                LOG_LEVEL_DEBUG: 5
            },

            NET: {
                END_POINT: 'http://app-api.notebike.cn',
                //END_POINT: 'http://10.0.0.224:9999',
                // END_POINT: 'http://192.168.99.223:9999',
                // END_POINT: 'http://yunto.api/courier/100',
                //IMG_URL_PREFIX: 'http://app-api.notebike.cn/static/img/',
                IMG_URL_PREFIX: 'http://static.notebike.cn/app/img/',

                //IMG_URL_PREFIX: 'http://192.168.99.223:9999/static/img/',
                VERSION: 1,
                CLIENT: 3,
                SP: 0,

                IMG_UPLOAD_END_POINT: 'http://app-api.notebike.cn/file/img/upload',
                //IMG_UPLOAD_END_POINT: 'http://static.notebike.cn/app/img/',
                //IMG_UPLOAD_END_POINT: 'http://10.0.0.223:9999/file/img/upload',


                FILE_URL_PREFIX: 'http://static.notebike.cn/app/file/',

                APP_VERSION: 'http://api.fir.im/apps/latest/',

            },
            APP: {
                CAR_LINK: {
                    UNLINK: -1,
                    LINKING: 0,
                    LINK: 1
                },
                PUSH_SET: {
                    OPEN: 1,
                    CLOSE: -1
                }

            },

            DATA: {
                KEY_PREFIX: 'luobo.data.',
                KEY_TOKEN: 'token',
                KEY_USER: 'user',
                KEY_DEFAULT_AVATAR: 'home/img/default-avatar.png',
                KEY_CONNECTED_BLUETOOTH_DEVICE: 'connected-bluetooth-device',
                KEY_WAYBILL_TYPE: 'waybill-type',
                KEY_PHONE: '',
                KEY_CURRENT_DEVICE_ID: 'device_id',
                KEY_CURRENT_DEVICE_MAC_ADDRESS: 'mac_address',
                KEY_RIDE_TYPE: 'ride_type',
                KEY_CAR_LINKED: 'car_linked',

                CHECK_CONNECT: 'check_connect',

                TYPE_READ_ELECTRICITY: 'type_read_electricity',
                TYPE_READ_GEAR: 'type_read_gear',
                TYPE_READ_ELECTRIC_MOTOR: 'type_read_electric_motor',
                TYPE_READ_BMS: 'type_read_bms',
                TYPE_WRITE_GEAR: 'type_write_gear',
                TYPE_READ_TOTAL_MILEAGE: 'type_read_total_mileage',
                TYPE_READ_ONCE_MILEAGE: 'type_read_once_mileage',
                TYPE_READ_SPEED: 'type_read_speed',
                TYPE_WRITE_LOCK: 'type_write_lock',
                TYPE_WRITE_UPGRADE: 'upgrade',
                TYPE_READ_SELF_TEST: 'type_read_self_test',
                TYPE_READ_LOCK: 'read_lock',
                TYPE_READ_ID: 'type_read_id',
                TYPE_WRITE_OS_READABLE: 'type_write_os_readable',
                TYPE_READ_POWER_RECYCLE: 'type_read_power_recycle',
                TYPE_READ_VERSION: 'type_read_version',
                TYPE_UPGRADE: 'type_upgrade',
                TYPE_ERROR_UPGRADE: 'type_error_upgrade'
            },

            CAR_INIT: {
                SPEED_GEAR: 'init_speed_gear',
                LOCK: 'init_lock',
            },

            EVENT: {
                CHECK_CONNECT: 'check_connect',

                TYPE_READ_ELECTRICITY: 'type_read_electricity',
                TYPE_READ_GEAR: 'type_read_gear',
                TYPE_READ_ELECTRIC_MOTOR: 'type_read_electric_motor',
                TYPE_READ_BMS: 'type_read_bms',
                TYPE_WRITE_GEAR: 'type_write_gear',
                TYPE_READ_TOTAL_MILEAGE: 'type_read_total_mileage',
                TYPE_READ_ONCE_MILEAGE: 'type_read_once_mileage',
                TYPE_READ_SPEED: 'type_read_speed',
                TYPE_WRITE_LOCK: 'type_write_lock',
                TYPE_WRITE_UPGRADE: 'type_write_upgrade',
                TYPE_READ_SELF_TEST: 'type_read_self_test',
                TYPE_READ_LOCK: 'type_read_lock',
                TYPE_READ_ID: 'type_read_id',
                TYPE_WRITE_OS_READABLE: 'type_write_os_readable',
                TYPE_READ_POWER_RECYCLE: 'type_read_power_recycle',
                TYPE_READ_VERSION: 'type_read_version',
                TYPE_UPGRADE: 'type_upgrade',
                TYPE_ERROR_UPGRADE: 'type_error_upgrade',

                ON_UPGRADE:'on_upgrade'
            },

            FRAME: {
                TYPE_READ_ELECTRICITY: 1,
                TYPE_READ_ELECTRIC_MOTOR: 2,
                TYPE_READ_GEAR: 3,
                TYPE_WRITE_GEAR: 4,
                TYPE_READ_TOTAL_MILEAGE: 5,
                TYPE_READ_ONCE_MILEAGE: 6,
                TYPE_READ_SPEED: 7,
                TYPE_WRITE_LOCK: 8,
                TYPE_WRITE_UPGRADE: 9,
                TYPE_READ_SELF_TEST: 10,
                TYPE_READ_BMS: 11,
                TYPE_READ_LOCK: 12,
                TYPE_READ_ID: 13,
                TYPE_WRITE_OS_READABLE: 14,
                TYPE_READ_POWER_RECYCLE: 15,
                TYPE_READ_VERSION: 16,
            },

            TASK_FAIL_TYPE: {
                TRIP: 1
            },

            SPORT_STATUS: {
                READY: 0,
                RUNNING: 1,
                STOP: 2,
                FINISH: 3,
                CANCEL: -1
            },

            ELECTRIC_MOTOR_ERROR_TYPE: {
                ERROR_TYPE_1: 1,
                ERROR_TYPE_2: 2,
                ERROR_TYPE_3: 3,
                ERROR_TYPE_4: 4
            },

            RIDE_TYPE: {
                WALKING: 0,
                RIDING: 1
            },

            CONNECT_STATUS: {
                DISCONNECTED: -1,
                CONNECTING: 0,
                CONNECTED: 1,
            }

        };

        return Const;
    }

})();