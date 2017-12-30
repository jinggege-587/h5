(function () {
    angular
        .module('app')
        .controller('SettingUpgradeController', ['$scope', 'Core', SettingUpgradeController]);


    function SettingUpgradeController($scope, Core) {
        var vm = $scope;
        vm.softwareVersion = Core.Util.getParameterByName("software_version");
        var downLoadUrl = Core.Util.getParameterByName("down_load_url");
        vm.process = '0%';
        vm.processNum = 0;
        vm.downLoadUpgradeFile = downLoadUpgradeFile;
        vm.isUpgrading = false;

        vm.change = function () {
            Core.Native.BLE.write(linkedCarId, Core.Device.makeFrame(Core.Const.FRAME.TYPE_WRITE_LOCK, 'ff'));
            Core.Native.BLE.write(linkedCarId, Core.Device.makeFrame(Core.Const.FRAME.TYPE_WRITE_GEAR, data));
        };

        var actlength, quotient, remainder, arr = [];
        var frame = 0;
        var binLength = '', binName = '';
        var headflag, isFirstMain = false, isFwWait = false, isMainEnd, isFwEnd, isBinName = false, isFirstTimeOut, isMainTimeOut, isFullZeroTimeOut, isFwError, numError = 0, isRegular, endSend = false;

        var linkedCarId = Core.Data.get(Core.Const.DATA.KEY_CURRENT_DEVICE_MAC_ADDRESS);
        var maxFrameNum, mProgress = 0;

        mui.back = function () {
            if (vm.isUpgrading) {
                mui.toast("固件升级中,请勿操作");
            } else {
                Core.Util.goBack();
            }
        };

        function downLoadUpgradeFile() {
            if (vm.isUpgrading) {
                return;
            }
            var isDownLoadComplete = false;
            vm.isUpgrading = true;
            var fileName = Core.Util.time() + '.bin';
            var outPath = "_downloads/" + fileName;
            Core.$timeout(function () {
                if (!isDownLoadComplete) {
                    Core.Util.showAlertDialog('文件下载失败,无法升级');
                    init();
                }
            }, 10000);
            plus.downloader.createDownload(Core.Const.NET.FILE_URL_PREFIX + downLoadUrl, {
                timeout: 10,
                filename: outPath
            }, function (d, status) {
                if (status == 200) {
                    isDownLoadComplete = true;
                    plus.io.resolveLocalFileSystemURL(outPath, function (entry) {
                        entry.file(function (file) {
                            var reader = new plus.io.FileReader();
                            reader.onloadend = function (e) {
                                fileParse(e.target.result, fileName);
                                sendUpgradeCmd();
                            };
                            reader.readAsDataURL(file);
                        }, function (e) {
                            console.log('error2', e);
                        })
                    }, function (error) {
                        console.log('error1', error);
                    });
                } else {
                }
            }).start();
        }

        function init() {
            vm.isUpgrading = false;
            frame = 0;
            arr = [];
            binLength = binName = actlength = quotient = remainder = headflag = isMainEnd = isFwEnd = isFirstTimeOut = isMainTimeOut = isFullZeroTimeOut = isFwError = isRegular = '';
            numError = 0;
            isFirstMain = isFwWait = isBinName = endSend = false
        }

        function fileParse(data, fileName) {
            var head = data.indexOf('base64,') + 'base64,'.length;
            arr = Core.Util.base642Byte(data.substring(head));
            actlength = arr.length;
            //arr = arr.join("");
            quotient = parseInt(actlength / 1024);
            remainder = actlength % 1024;
            if (quotient == 0 && (0 < remainder && remainder < 1024)) {
                quotient++;
            } else if (quotient > 0 && (0 < remainder && remainder < 1024)) {
                quotient++;
            }
            var binLengthStr = actlength.toString();
            var binNameStr = fileName.toString();

            for (var i = 0; i < binLengthStr.length; i++) {
                binLength += binLengthStr.charCodeAt(i).toString(16);
            }
            for (var j = 0; j < binNameStr.length; j++) {
                binName += binNameStr.charCodeAt(j).toString(16);
            }
            maxFrameNum = quotient + 2;
            console.log('actlength', actlength, 'quotient', quotient, 'remainder', remainder);
            // for (var test = 0; test < quotient + 1; test++) {
            //     if (test == 0) {
            //
            //         console.log("bintest","第" + test + "帧=" + getPackage(test, 128));
            //
            //     } else {
            //
            //         if ((128 < remainder && remainder < 1024)) {
            //             console.log("bintest", "第" + test + "帧=" + getPackage(test, 1024));
            //         }
            //
            //     }
            //
            // }

        }

        function getPackage(i, length) {
            var head, content, data, fullData, subArr;
            if (i == 0) {
                head = '0100' + int2HexString((parseInt(0xff) - i).toString(16));
                var zero = '00';
                data = binName + zero + binLength;
                fullData = textArray(data, length);
                return head + fullData + doCrc(fullData, length);
            } else if (i == quotient && remainder <= 128) {
                head = '01' + int2HexString(i) + int2HexString((parseInt(0xff) - i).toString(16));
                var fill = '1a';
                subArr = slice(arr, actlength - remainder, actlength);
                //subArr = arr.slice(actlength - remainder, actlength);
                content = byteArray2HexStr(subArr);
                var fills = '';
                if (remainder < 128) {
                    for (var k = remainder; k < 128; k++) {
                        fills += fill;
                    }
                }
                data = content + fills;
                fullData = textArray(data, length);
                return head + fullData + doCrc(fullData, 128);
            } else if (i == quotient && (128 < remainder && remainder < 1024)) {
                head = '02' + int2HexString(i) + int2HexString((parseInt(0xff) - i).toString(16));
                fill = '1a';
                subArr = slice(arr, actlength - remainder, actlength);
                //subArr = arr.slice(actlength - remainder, actlength);
                content = byteArray2HexStr(subArr);
                fills = '';
                for (var l = remainder; l < 1024; l++) {
                    fills += fill;
                }
                data = content + fills;
                fullData = textArray(data, 1024);
                return head + fullData + doCrc(fullData, 1024);
            } else {
                head = '02' + int2HexString(i) + int2HexString((parseInt(0xff) - i).toString(16));
                console.log('arr', arr);
                subArr = slice(arr, (i - 1) * 1024, i * 1024);
                //subArr = arr.slice((i - 1) * 1024, i * 1024);
                console.log('subArr', subArr);
                content = byteArray2HexStr(subArr);
                data = content;
                fullData = textArray(data, 1024);
                return head + fullData + doCrc(fullData, 1024);
            }
        }

        function slice(arr, start, end) {
            var array = [];
            for (var i = start, j = 0; i < end; i++, j++) {
                array[j] = arr[i];
            }
            return array;
        }

        function zeroBag(length) {
            var head = '0100ff';
            var fullData = textArray("", length);
            return head + fullData + doCrc(fullData, length);
        }

        function int2HexString(value) {
            value = value.toString(16);
            return value.toString().length == 1 ? "0" + value : "" + value;
        }

        function doCrc(bytes, length) {
            var crc = 0;
            var i, j;
            for (i = 0; i < length; i++) {
                var binByte = parseInt((bytes[i * 2] + "" + bytes[i * 2 + 1]), 16);
                crc = crc ^ (binByte & 0xff) << 8;
                for (j = 0; j < 8; j++) {
                    if ((crc & 0x8000) != 0)
                        crc = (crc << 1) ^ 0x1021;
                    else
                        crc = crc << 1;
                }
            }
            crc = crc & 0xFFFF;
            var crc1 = ((crc & 0xFF00) >> 8);
            var crc2 = ((crc & 0x00FF));
            return fullZero(crc1.toString(16)) + "" + fullZero(crc2.toString(16));
        }

        function sendFwTimeOutBin(type, frame) {
            console.log('sendFwTimeOutBin', type);
            var frameBag;
            switch (type) {
                case 1:
                    frameBag = getPackage(frame, 128);
                    break;
                case 2:
                    frameBag = getPackage(frame, 1024);
                    break;
                case 3:
                    frameBag = zeroBag(128);
                    break;
            }
            if (frameBag != null) {
                var block = parseInt(frameBag.length / 40);
                var reblock = frameBag.length % 40;
                Core.$timeout(function () {
                    write(0, block)
                }, 100);
            }

            function write(i, block) {
                var makeFrame1 = frameBag.substring(i * 40, i * 40 + 40);
                if (i < block) {
                    Core.Native.BLE.writeForUpgrade(linkedCarId, makeFrame1);
                    i++;
                    Core.$timeout(function () {
                        write(i, block);
                    }, 100);
                } else {
                    var makeFrame2 = frameBag.substring(frameBag.length - reblock, frameBag.length);
                    Core.Native.BLE.writeForUpgrade(linkedCarId, makeFrame2);
                    frame++;
                }
            }
        }

        function sendFwBin(type) {
            var frameBag;
            console.log('sendFwBin', type);
            switch (type) {
                case 1:
                    frameBag = getPackage(frame, 128);
                    break;
                case 2:
                    frameBag = getPackage(frame, 1024);
                    break;
                case 3:
                    frameBag = zeroBag(128);
                    break;
            }
            if (frameBag != null) {
                var block = parseInt(frameBag.length / 40);
                var reblock = frameBag.length % 40;
                Core.$timeout(function () {
                    write(0, block)
                }, 100);
            }
            mProgress++;
            vm.processNum = parseInt(mProgress * 100 / maxFrameNum);
            vm.process = vm.processNum + "%";

            Core.$timeout(function () {
                vm.$apply();
            });

            function write(i, block) {
                var makeFrame1 = frameBag.substring(i * 40, i * 40 + 40);
                if (i < block) {
                    console.log('write1', i, block, makeFrame1);
                    Core.Native.BLE.writeForUpgrade(linkedCarId, makeFrame1);
                    i++;
                    Core.$timeout(function () {
                        write(i, block);
                    }, 100);
                } else {
                    var makeFrame2 = frameBag.substring(frameBag.length - reblock, frameBag.length);
                    console.log('write2', i, block, makeFrame2);
                    Core.Native.BLE.writeForUpgrade(linkedCarId, makeFrame2);
                    frame++;
                }

            }

        }

        function sendUpgradeCmd() {
            console.log('sendUpgradeCmd===>');
            Core.Data.set(Core.Const.EVENT.ON_UPGRADE, true);
            Core.Native.BLE.writeForUpgrade(linkedCarId, Core.Device.makeFrame(Core.Const.FRAME.TYPE_WRITE_UPGRADE, '01'));
        }

        Core.on(Core.Const.EVENT.TYPE_WRITE_UPGRADE, function (event, data) {
            headflag = 0;
            isRegular = true;
            isFwWait = true;
        });
        Core.on(Core.Const.EVENT.TYPE_ERROR_UPGRADE, function (event, data) {
            isRegular = false;
            numError = 0;
            isFwError = false;
            isFwWait = false;
            Core.Data.set(Core.Const.EVENT.ON_UPGRADE, false);
            Core.Util.showAlertDialog('升级固件失败');
            init();
        });

        Core.on(Core.Const.EVENT.TYPE_UPGRADE, function (event, frameData) {
            console.log("升级中====>", frameData);
            if (frameData) {
                frameData = frameData.toString();
                var data = frameData.substring(0, 2);
                if (data == '43' && isFwWait) {
                    if (headflag == 0) {
                        isBinName = true;
                        sendFwBin(1);
                        headflag++;
                    } else if (headflag == 1 && isBinName) {
                        isFirstTimeOut = true;
                        isBinName = false;
                        isFirstMain = true;
                        sendFwBin(2);
                        isFwWait = false;
                        isBinName = false;
                    }
                } else if (data == '06' && isFirstMain) {
                    isFirstTimeOut = false;
                    if (frame == (quotient + 1)) {
                        isMainEnd = true;
                        Core.Native.BLE.writeForUpgrade(linkedCarId, '04');
                        frame++;
                        endSend = true;
                    } else if (!endSend) {
                        sendFwBin(2);
                    }
                    isMainTimeOut = true;
                } else if (data == '43' && isMainEnd) {
                    isFullZeroTimeOut = true;
                    isFirstMain = false;
                    isFwEnd = true;
                    sendFwBin(3);
                } else if (data == '06' && isFwEnd) {
                    isRegular = false;
                    isFwEnd = false;
                    isBinName = false;
                    isFirstMain = false;
                    isMainEnd = false;
                    isFwWait = false;
                    isFwEnd = false;
                    //升级成功
                    Core.Data.set(Core.Const.EVENT.ON_UPGRADE, false);
                    Core.Util.showAlertDialog("升级成功");
                    isFullZeroTimeOut = false;
                    isFwError = false;
                    numError = 0;
                    Core.Util.goBack();
                } else if (data == '43' && isFirstTimeOut) {
                    //第一贞正文超时
                    sendFwTimeOutBin(2, (frame - 1));
                    isFirstTimeOut = false;
                } else if (data == '43' && isMainTimeOut) {
                    sendFwTimeOutBin(2, (frame - 1));
                    isMainTimeOut = false;
                } else if (data == '43' && isFullZeroTimeOut) {
                    sendFwTimeOutBin(3, (frame - 1));
                } else if (data == '43' && !isFwError && !isRegular) {
                    if (numError == 2) {
                        isFwError = true;
                        quotient = 0;
                        remainder = 0;
                        frame = 0;
                        endSend = false;
                        sendUpgradeCmd();
                        numError = 0;
                    }
                    numError++;
                }
            }
        });

        function textArray(str, length) {
            var strLength = str.length;
            var shortLength = (length * 2 - strLength);
            var zeroArr = '';
            for (var i = 0; i < shortLength; i++) {
                zeroArr += '0';
            }
            return str + zeroArr;
        }

        function byteArray2HexStr(array) {
            var str = '';
            for (var i = 0; i < array.length; i++) {
                var a = parseInt(array[i]).toString(16);
                str += fullZero(a, 2);
            }
            return str;
        }

        function fullZero(data, length) {
            length = length ? length : 2;
            var zero = '';
            for (var k = data.length; k < length; k++) {
                zero += '0';
            }
            return zero + data;
        }


    }
})();