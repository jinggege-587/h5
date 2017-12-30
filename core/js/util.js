/**
 * Created by dd on 12/26/15.
 */
(function () {
    angular
        .module('app.core')
        .factory('Util', ['$window', 'Log', 'Config', 'Const', 'localStorageService', Util]);

    function Util($window, Log, Config, Const, localStorageService) {

        var cachedPages = {};
        var openingWindow = null;
        var waitingNativeUI = null;

        return {
            goBack: goBack,
            cachePage: cachePage,
            setTitle: setTitle,
            getImgUrl: getImgUrl,
            url: url,
            getRequestParams: getRequestParams,
            getRequestParam: getRequestParam,
            go: go,
            goToRoute: goToRoute,
            getCurrentPage: getCurrentPage,
            getCurrentPath: getCurrentPath,
            getCurrentRoute: getCurrentRoute,
            canGuestVisit: canGuestVisit,
            time: time,
            installWindowScrollEventListener: installWindowScrollEventListener,
            uninstallWindowScrollEventListener: uninstallWindowScrollEventListener,
            timeFormat: timeFormat,
            getTimestamp: getTimestamp,
            containsKey: containsKey,
            getDate: getDate,
            dateDiff: dateDiff,
            date: date,
            sprintf: sprintf,
            inArray: in_array,
            isMobile: isMobile,
            ltrim: ltrim,
            rtrim: rtrim,
            trim: trim,
            clone: clone,
            goToPage: goToPage,
            getParameterByName: getParameterByName,
            showLoading: showLoading,
            hideLoading: hideLoading,
            showAlertDialog: showAlertDialog,
            showConfirmModal: showConfirmModal,
            electricMotorErrorCheck: electricMotorErrorCheck,
            bmsErrorCheck: bmsErrorCheck,
            luoBoCarHexToSingleBatch: luoBoCarHexToSingleBatch,
            HexToSingleBatch: HexToSingleBatch,
            toDecimal2: toDecimal2,
            parseQRCodeResult: parseQRCodeResult,
            closeAllWithoutPage: closeAllWithoutPage,
            upLoad: upLoad,
            distance: distance,
            imgLoader: imgLoader,
            fileRemove: fileRemove,
            openBluetooth: openBluetooth,
            base642Byte: base642Byte,
            getDeviceId: getDeviceId,
        };

        function getDeviceId(device) {
            var data;

            if (window.plus && plus.os.name == 'Android') {
                data = device.advertising;
            } else {
                data = device.advertising ? device.advertising.kCBAdvDataManufacturerData : "";
                if (data) {
                    data = data.substring(4);
                }
                return data;
            }

            while (data && data.length > 0) {
                var len = data.substring(0, 2);
                len = parseInt(len, 16);
                var type = data.substring(2, 4);
                if (type == 'FF') {
                    return data.substring(8, 8 + (len - 3) * 2);
                }
                data = data.substring((1 + len) * 2);
            }
        }

        function openBluetooth() {
            var main, BluetoothAdapter, BAdapter;
            main = plus.android.runtimeMainActivity();
            BluetoothAdapter = plus.android.importClass("android.bluetooth.BluetoothAdapter");
            BAdapter = BluetoothAdapter.getDefaultAdapter();
            if (!BAdapter.isEnabled()) {
                BAdapter.enable();
            }
        }

        function fileRemove(localPath) {
            plus.io.resolveLocalFileSystemURL(localPath, function (entry) {
                entry.remove();
            });
        }

        function imgLoader(netPath, success) {
            if (!netPath) {
                return;
            }
            var localPath = localStorageService.get(Const.DATA.KEY_PREFIX + netPath);
            if (localPath) {
                plus.io.resolveLocalFileSystemURL(localPath, function (entry) {
                    if (success && typeof success == "function") {
                        success(entry.fullPath);
                    }
                }, function () {
                    downLoad(success);
                });
            } else {
                downLoad(success);
            }


            function downLoad(success) {
                var time = new Date().getTime();
                var suffix = netPath.substring(netPath.lastIndexOf("."), netPath.length);
                var outPath = "_doc/" + time + suffix;
                var dtask = plus.downloader.createDownload(Const.NET.IMG_URL_PREFIX + netPath, {
                    retry: 3,
                    filename: outPath
                }, function (d, status) {
                    if (status == 200) {
                        var sdPath = plus.io.convertLocalFileSystemURL(outPath);
                        localStorageService.set(Const.DATA.KEY_PREFIX + netPath, outPath);
                        success(sdPath);
                    }
                });
                dtask.start();
            }

        }

        function distance(lon1, lat1, lon2, lat2) {
            var DEF_PI180 = 0.01745329252;
            var DEF_PI = 3.14159265359;
            var DEF_2PI = 6.28318530712;
            var DEF_R = 6370693.5;
            var ew1, ns1, ew2, ns2;
            var dx, dy, dew;
            var distance;
            // 角度转换为弧度
            ew1 = lon1 * DEF_PI180;
            ns1 = lat1 * DEF_PI180;
            ew2 = lon2 * DEF_PI180;
            ns2 = lat2 * DEF_PI180;
            // 经度差
            dew = ew1 - ew2;
            // 若跨东经和西经180 度，进行调整
            if (dew > DEF_PI)
                dew = DEF_2PI - dew;
            else if (dew < -DEF_PI)
                dew = DEF_2PI + dew;
            dx = DEF_R * Math.cos(ns1) * dew; // 东西方向长度(在纬度圈上的投影长度)
            dy = DEF_R * (ns1 - ns2); // 南北方向长度(在经度圈上的投影长度)
            // 勾股定理求斜边长
            distance = Math.sqrt(dx * dx + dy * dy);
            return distance;

        }

        function urlEncodedString(params) {
            var result = [];
            for (key in params) {
                if (params.hasOwnProperty(key)) {
                    result.push(encodeURIComponent(key) + "=" + encodeURIComponent(params[key]));
                }
            }
            return result.join("&");
        }

        function goBack() {
            if (window.plus) {
                window.plus.webview.currentWebview().close();
            }
            else {
                mui.back();
            }
        }

        function cachePage(id, url) {
            if (window.plus && plus.os.name == 'iOS') {
                return
            }

            if (!cachedPages[id]) {
                Log.d('caching: ' + id + " " + url);

                console.log(window.plus);
                var currentPage = window.plus ? window.plus.webview.currentWebview() : null;
                (function (parentPage) {
                    var page = plus.webview.create(url, id, {
                        scrollIndicator: 'none',
                        scalable: false,
                        popGesture: 'hide',
                        hardwareAccelerated: id != "sport-main"
                    }, {pre_create: true});
                    cachedPages[id] = page;
                    page.addEventListener('close', function () {
                        //页面关闭后可再次打开
                        openingWindow = null;
                        //兼容窗口的关闭
                        cachedPages[id] && (cachedPages[id] = null);
                        plus.device.setWakelock(false);
                        firePageShowEvent(parentPage);
                        firePageShouldCacheSubPageEvent(parentPage);

                    }, false);
                })(currentPage);
            }
            else {
                Log.d('already cached: ' + id + " " + url);
            }
        }

        function firePageShouldCacheSubPageEvent(page) {
            if (page) {
                Log.d('fire event should-cache-sub-page to: ' + page.id);
                page.evalJS("window.dispatchEvent( new Event('should-cache-sub-page') );");
            }
        }

        function firePageShowEvent(page) {
            if (page) {
                if (window.plus && plus.os.name == 'Android') {
                    Core.Native.Core.startTouchScreen();
                }
                Log.d('fire event page show to: ' + page.id);
                page.evalJS("window.dispatchEvent( new Event('page-show') );");
            }
        }

        function goToPage(id, url, extra, urlParams, aniShow) {
            aniShow = aniShow ? aniShow : "pop-in";
            //只有ios支持的功能需要在Android平台隐藏；
            if (mui.os.android) {
                // Android平台暂时使用slide-in-right动画
                if (parseFloat(mui.os.version) < 4.4) {
                    aniShow = "slide-in-right";
                }
            }

            var urlParamString = urlEncodedString(urlParams);
            url = urlParamString.length ? url + '?' + urlParamString : url;

            if (window.plus) {
                if (openingWindow) {
                    console.log(id + "is opening window");
                    return;
                }
                openingWindow = cachedPages[id];
                if (openingWindow) {
                    openingWindow.showed = true;
                    openingWindow.show(aniShow, 300, function () {
                        openingWindow = null;
                    }, extra);
                    firePageShowEvent(openingWindow);
                    firePageShouldCacheSubPageEvent(openingWindow);
                }
                else {
                    var currentPage = window.plus ? window.plus.webview.currentWebview() : null;
                    (function (parentPage) {
                        // var wa = plus.nativeUI.showWaiting();
                        openingWindow = plus.webview.create(url, id, {
                            scrollIndicator: 'none',
                            scalable: false,
                            popGesture: 'hide',
                            hardwareAccelerated: id != "sport-main"
                        }, {pre_create: true});
                        cachedPages[id] = openingWindow;
                        openingWindow.addEventListener('loaded', function () {
                            // 页面加载完成后才显示
                            // setTimeout(function () {
                            // 延后显示可避免低端机上动画时白屏
                            // wa.close();
                            openingWindow.showded = true;
                            firePageShowEvent(openingWindow);
                            openingWindow.show(aniShow, null, function () {
                                //避免快速点击打开多个页面
                                openingWindow = null;
                            });
                            console.log('2', openingWindow);
                            //firePageShowEvent(openingWindow);

                            // }, 10);
                        }, false);

                        openingWindow.addEventListener('hide', function () {
                            openingWindow && (openingWindow.showded = true);
                            openingWindow = null;
                            firePageShowEvent(parentPage);
                            firePageShouldCacheSubPageEvent(parentPage);
                        }, false);

                        openingWindow.addEventListener('close', function () {
                            //页面关闭后可再次打开
                            openingWindow = null;
                            //兼容窗口的关闭
                            cachedPages[id] && (cachedPages[id] = null);
                            firePageShowEvent(parentPage);
                            firePageShouldCacheSubPageEvent(parentPage);
                        }, false);

                    })(currentPage);
                }
            }
            else {
                mui.openWindow({
                    id: id,
                    url: url,
                    show: {
                        aniShow: aniShow
                    },
                    extras: extra,
                    waiting: {
                        autoShow: false
                    }
                });
            }


        }

        function getParameterByName(name, url) {
            if (!url) url = window.location.href;
            url = url.toLowerCase(); // This is just to avoid case sensitiveness
            name = name.replace(/[\[\]]/g, "\\$&").toLowerCase(); // This is just to avoid case sensitiveness for query parameter name
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        }

        function setTitle(title) {
            $window.document.title = title;
        }

        function getImgUrl(imgName) {
            Core.Log.d(imgName);
            if (imgName.indexOf('://') != -1) {
                return imgName;
            }

            return Const.NET.IMG_URL_PREFIX + imgName;
        }

        function url(url, params) {
            var queryString = '';
            for (var key in params) {
                var value = params[key];
                queryString += (encodeURIComponent(key) + '=' + encodeURIComponent(value) + '&');
            }
            queryString = trim(queryString, '&');
            return url + '?' + queryString;
        }

        function getRequestParams() {
            var queryString = trim($window.location.search, '?');
            var params = {};
            var paramList = queryString.split('&');
            for (var i in paramList) {
                var kv = paramList[i];
                var kvList = kv.split('=');
                if (kvList.length == 2) {
                    var key = decodeURIComponent(kvList[0]);
                    params[key] = decodeURIComponent(kvList[1]);
                }
            }

            return params;
        }

        function getRequestParam(key) {
            var params = getRequestParams();
            if (params.hasOwnProperty(key)) {
                return params[key];
            }

            return undefined;
        }

        function go(path) {
            var pathname = $window.location.pathname;
            pathname = trim(pathname, '/');
            var paths = pathname.split('/');
            if (paths.length > 0) {
                paths.splice(paths.length - 1, 1);
            }

            path = sprintf('%s/%s', paths.join('/'), path);
            path = trim(path, '/');
            path = sprintf('%s//%s/%s', $window.location.protocol, $window.location.host, path);

            $window.location.href = path;
        }

        function goToRoute(route) {
            var routes = route.split('#');
            if (routes.length > 2) {
                Log.e(sprintf('invalid route: %s', route));
                return;
            }

            var page = routes[0];
            // page = trim(page, '.html');
            var endHtmlIndex = page.indexOf('.html');
            if (endHtmlIndex >= 0 && endHtmlIndex + 5 == page.length) {
                page = page.substring(0, endHtmlIndex);
            }
            page = page + '.html';
            var controller;
            if (routes.length == 2) {
                controller = routes[1];
            }
            var path = controller ? sprintf('%s#/%s', page, controller) : page;
            go(path);
        }

        function getCurrentPage() {
            var pathname = $window.location.pathname;
            pathname = rtrim(pathname, '/');
            var paths = pathname.split('/');

            return paths.length > 0 ? paths[paths.length - 1] : undefined;
        }

        function getCurrentPath() {
            var currentPage = getCurrentPage();
            if (currentPage) {
                return rtrim(currentPage, '.html');
            }
        }

        function getCurrentControllerPath() {
            var hash = $window.location.hash;
            hash = trim(hash);
            hash = trim(hash, '#!/');
            hash = trim(hash, '/');
            return hash;
        }

        function getCurrentRoute() {
            var path = getCurrentPath();
            var controllerPath = getCurrentControllerPath();
            if (path) {
                return path + '#' + controllerPath;
            }
        }

        function canGuestVisit() {
            var route = getCurrentRoute();
            if (!route) {
                return false;
            }

            for (var i = 0; i < Config.ROUTE_LIST_GUEST_CAN_VISIT.length; i++) {
                var path = Config.ROUTE_LIST_GUEST_CAN_VISIT[i];
                if (route.indexOf(path) === 0) {
                    return true;
                }
            }

            return false;
        }

        function isWindowScrollToBottom() {
            var offset = $window.document.body.offsetHeight - $window.scrollY - $window.innerHeight;
            return offset < 3;
        }

        function installWindowScrollEventListener(callback) {
            $window.onscroll = function () {
                if (isWindowScrollToBottom() && callback) {
                    callback();
                }
            };
        }

        function uninstallWindowScrollEventListener() {
            $window.onscroll = undefined;
        }


        function clone(obj) {
            var o;
            if (typeof obj == "object") {
                if (obj === null) {
                    o = null;
                } else {
                    if (obj instanceof Array) {
                        o = [];
                        for (var i = 0, len = obj.length; i < len; i++) {
                            o.push(clone(obj[i]));
                        }
                    } else {
                        o = {};
                        for (var j in obj) {
                            o[j] = clone(obj[j]);
                        }
                    }
                }
            } else {
                o = obj;
            }
            return o;
        }

        function time() {
            return parseInt(new Date().getTime() / 1000, 10);
        }

        function containsKey(object, keys) {
            if (!object) {
                return false;
            }

            if (!(keys instanceof Array)) {
                keys = ['' + keys];
            }

            for (var i in keys) {
                var key = keys[i];
                if (object[key] === undefined) {
                    Log.e(object);
                    Log.e(keys);
                    Log.e('invalid option, key ' + key + ' undefined');
                    return false;
                }
            }

            return true;
        }

        function timeFormat(time) {
            return date('Y-m-d H:i:s', time);
        }

        function getTimestamp(time) {
            return parseInt(time.getTime() / 1000, 10);
        }

        function isMobile(phone) {

            if (phone.length != 11) {
                return false;
            }

            var myReg = /^(((13[0-9])|(15[0-9])|(17[0-9])|(18[0-9]))+\d{8})$/;
            if (!myReg.exec(phone)) {
                return false;
            }

            return true;
        }

        function getDate(unix) {
            var now = new Date(parseInt(unix) * 1000).toLocaleDateString();
            //return now.toLocaleDateString(); 
            return now;
        }

        function dateDiff(dateTimeStamp) {
            var minute = 1000 * 60;
            var hour = minute * 60;
            var day = hour * 24;
            var month = day * 30;
            var diffValue = new Date().getTime() - dateTimeStamp * 1000;
            Log.d(new Date().getTime() + '----' + dateTimeStamp);
            var monthC = diffValue / month;
            var weekC = diffValue / (7 * day);
            var dayC = diffValue / day;
            var hourC = diffValue / hour;
            var minC = diffValue / minute;
            if (monthC >= 1) {
                result = parseInt(monthC) + "个月前";
            }
            else if (weekC >= 1) {
                result = parseInt(weekC) + "周前";
            }
            else if (dayC >= 1) {
                result = parseInt(dayC) + "天前";
            }
            else if (hourC >= 1) {
                result = parseInt(hourC) + "个小时前";
            }
            else if (minC >= 1) {
                result = parseInt(minC) + "分钟前";
            } else {
                result = "刚刚";
            }
            return result;
        }

        function date(format, timestamp) {
            //  discuss at: http://phpjs.org/functions/date/
            // original by: Carlos R. L. Rodrigues (http://www.jsfromhell.com)
            // original by: gettimeofday
            //    parts by: Peter-Paul Koch (http://www.quirksmode.org/js/beat.html)
            // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // improved by: MeEtc (http://yass.meetcweb.com)
            // improved by: Brad Touesnard
            // improved by: Tim Wiel
            // improved by: Bryan Elliott
            // improved by: David Randall
            // improved by: Theriault
            // improved by: Theriault
            // improved by: Brett Zamir (http://brett-zamir.me)
            // improved by: Theriault
            // improved by: Thomas Beaucourt (http://www.webapp.fr)
            // improved by: JT
            // improved by: Theriault
            // improved by: Rafał Kukawski (http://blog.kukawski.pl)
            // improved by: Theriault
            //    input by: Brett Zamir (http://brett-zamir.me)
            //    input by: majak
            //    input by: Alex
            //    input by: Martin
            //    input by: Alex Wilson
            //    input by: Haravikk
            // bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // bugfixed by: majak
            // bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // bugfixed by: Brett Zamir (http://brett-zamir.me)
            // bugfixed by: omid (http://phpjs.org/functions/380:380#comment_137122)
            // bugfixed by: Chris (http://www.devotis.nl/)
            //        note: Uses global: php_js to store the default timezone
            //        note: Although the function potentially allows timezone info (see notes), it currently does not set
            //        note: per a timezone specified by date_default_timezone_set(). Implementers might use
            //        note: this.php_js.currentTimezoneOffset and this.php_js.currentTimezoneDST set by that function
            //        note: in order to adjust the dates in this function (or our other date functions!) accordingly
            //   example 1: date('H:m:s \\m \\i\\s \\m\\o\\n\\t\\h', 1062402400);
            //   returns 1: '09:09:40 m is month'
            //   example 2: date('F j, Y, g:i a', 1062462400);
            //   returns 2: 'September 2, 2003, 2:26 am'
            //   example 3: date('Y W o', 1062462400);
            //   returns 3: '2003 36 2003'
            //   example 4: x = date('Y m d', (new Date()).getTime()/1000);
            //   example 4: (x+'').length == 10 // 2009 01 09
            //   returns 4: true
            //   example 5: date('W', 1104534000);
            //   returns 5: '53'
            //   example 6: date('B t', 1104534000);
            //   returns 6: '999 31'
            //   example 7: date('W U', 1293750000.82); // 2010-12-31
            //   returns 7: '52 1293750000'
            //   example 8: date('W', 1293836400); // 2011-01-01
            //   returns 8: '52'
            //   example 9: date('W Y-m-d', 1293974054); // 2011-01-02
            //   returns 9: '52 2011-01-02'

            var that = this;
            var jsdate, f;
            // Keep this here (works, but for code commented-out below for file size reasons)
            // var tal= [];
            var txt_words = [
                'Sun', 'Mon', 'Tues', 'Wednes', 'Thurs', 'Fri', 'Satur',
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];
            // trailing backslash -> (dropped)
            // a backslash followed by any character (including backslash) -> the character
            // empty string -> empty string
            var formatChr = /\\?(.?)/gi;
            var formatChrCb = function (t, s) {
                return f[t] ? f[t]() : s;
            };
            var _pad = function (n, c) {
                n = String(n);
                while (n.length < c) {
                    n = '0' + n;
                }
                return n;
            };
            f = {
                // Day
                d: function () { // Day of month w/leading 0; 01..31
                    return _pad(f.j(), 2);
                },
                D: function () { // Shorthand day name; Mon...Sun
                    return f.l()
                        .slice(0, 3);
                },
                j: function () { // Day of month; 1..31
                    return jsdate.getDate();
                },
                l: function () { // Full day name; Monday...Sunday
                    return txt_words[f.w()] + 'day';
                },
                N: function () { // ISO-8601 day of week; 1[Mon]..7[Sun]
                    return f.w() || 7;
                },
                S: function () { // Ordinal suffix for day of month; st, nd, rd, th
                    var j = f.j();
                    var i = j % 10;
                    if (i <= 3 && parseInt((j % 100) / 10, 10) == 1) {
                        i = 0;
                    }
                    return ['st', 'nd', 'rd'][i - 1] || 'th';
                },
                w: function () { // Day of week; 0[Sun]..6[Sat]
                    return jsdate.getDay();
                },
                z: function () { // Day of year; 0..365
                    var a = new Date(f.Y(), f.n() - 1, f.j());
                    var b = new Date(f.Y(), 0, 1);
                    return Math.round((a - b) / 864e5);
                },

                // Week
                W: function () { // ISO-8601 week number
                    var a = new Date(f.Y(), f.n() - 1, f.j() - f.N() + 3);
                    var b = new Date(a.getFullYear(), 0, 4);
                    return _pad(1 + Math.round((a - b) / 864e5 / 7), 2);
                },

                // Month
                F: function () { // Full month name; January...December
                    return txt_words[6 + f.n()];
                },
                m: function () { // Month w/leading 0; 01...12
                    return _pad(f.n(), 2);
                },
                M: function () { // Shorthand month name; Jan...Dec
                    return f.F()
                        .slice(0, 3);
                },
                n: function () { // Month; 1...12
                    return jsdate.getMonth() + 1;
                },
                t: function () { // Days in month; 28...31
                    return (new Date(f.Y(), f.n(), 0))
                        .getDate();
                },

                // Year
                L: function () { // Is leap year?; 0 or 1
                    var j = f.Y();
                    return j % 4 === 0 & j % 100 !== 0 | j % 400 === 0;
                },
                o: function () { // ISO-8601 year
                    var n = f.n();
                    var W = f.W();
                    var Y = f.Y();
                    return Y + (n === 12 && W < 9 ? 1 : n === 1 && W > 9 ? -1 : 0);
                },
                Y: function () { // Full year; e.g. 1980...2010
                    return jsdate.getFullYear();
                },
                y: function () { // Last two digits of year; 00...99
                    return f.Y()
                        .toString()
                        .slice(-2);
                },

                // Time
                a: function () { // am or pm
                    return jsdate.getHours() > 11 ? 'pm' : 'am';
                },
                A: function () { // AM or PM
                    return f.a()
                        .toUpperCase();
                },
                B: function () { // Swatch Internet time; 000..999
                    var H = jsdate.getUTCHours() * 36e2;
                    // Hours
                    var i = jsdate.getUTCMinutes() * 60;
                    // Minutes
                    var s = jsdate.getUTCSeconds(); // Seconds
                    return _pad(Math.floor((H + i + s + 36e2) / 86.4) % 1e3, 3);
                },
                g: function () { // 12-Hours; 1..12
                    return f.G() % 12 || 12;
                },
                G: function () { // 24-Hours; 0..23
                    return jsdate.getHours();
                },
                h: function () { // 12-Hours w/leading 0; 01..12
                    return _pad(f.g(), 2);
                },
                H: function () { // 24-Hours w/leading 0; 00..23
                    return _pad(f.G(), 2);
                },
                i: function () { // Minutes w/leading 0; 00..59
                    return _pad(jsdate.getMinutes(), 2);
                },
                s: function () { // Seconds w/leading 0; 00..59
                    return _pad(jsdate.getSeconds(), 2);
                },
                u: function () { // Microseconds; 000000-999000
                    return _pad(jsdate.getMilliseconds() * 1000, 6);
                },

                // Timezone
                e: function () { // Timezone identifier; e.g. Atlantic/Azores, ...
                    // The following works, but requires inclusion of the very large
                    // timezone_abbreviations_list() function.
                    /*              return that.date_default_timezone_get();
                     */
                    throw 'Not supported (see source code of date() for timezone on how to add support)';
                },
                I: function () { // DST observed?; 0 or 1
                    // Compares Jan 1 minus Jan 1 UTC to Jul 1 minus Jul 1 UTC.
                    // If they are not equal, then DST is observed.
                    var a = new Date(f.Y(), 0);
                    // Jan 1
                    var c = Date.UTC(f.Y(), 0);
                    // Jan 1 UTC
                    var b = new Date(f.Y(), 6);
                    // Jul 1
                    var d = Date.UTC(f.Y(), 6); // Jul 1 UTC
                    return ((a - c) !== (b - d)) ? 1 : 0;
                },
                O: function () { // Difference to GMT in hour format; e.g. +0200
                    var tzo = jsdate.getTimezoneOffset();
                    var a = Math.abs(tzo);
                    return (tzo > 0 ? '-' : '+') + _pad(Math.floor(a / 60) * 100 + a % 60, 4);
                },
                P: function () { // Difference to GMT w/colon; e.g. +02:00
                    var O = f.O();
                    return (O.substr(0, 3) + ':' + O.substr(3, 2));
                },
                T: function () { // Timezone abbreviation; e.g. EST, MDT, ...
                    // The following works, but requires inclusion of the very
                    // large timezone_abbreviations_list() function.
                    /*              var abbr, i, os, _default;
                     if (!tal.length) {
                     tal = that.timezone_abbreviations_list();
                     }
                     if (that.php_js && that.php_js.default_timezone) {
                     _default = that.php_js.default_timezone;
                     for (abbr in tal) {
                     for (i = 0; i < tal[abbr].length; i++) {
                     if (tal[abbr][i].timezone_id === _default) {
                     return abbr.toUpperCase();
                     }
                     }
                     }
                     }
                     for (abbr in tal) {
                     for (i = 0; i < tal[abbr].length; i++) {
                     os = -jsdate.getTimezoneOffset() * 60;
                     if (tal[abbr][i].offset === os) {
                     return abbr.toUpperCase();
                     }
                     }
                     }
                     */
                    return 'UTC';
                },
                Z: function () { // Timezone offset in seconds (-43200...50400)
                    return -jsdate.getTimezoneOffset() * 60;
                },

                // Full Date/Time
                c: function () { // ISO-8601 date.
                    return 'Y-m-d\\TH:i:sP'.replace(formatChr, formatChrCb);
                },
                r: function () { // RFC 2822
                    return 'D, d M Y H:i:s O'.replace(formatChr, formatChrCb);
                },
                U: function () { // Seconds since UNIX epoch
                    return jsdate / 1000 | 0;
                }
            };
            this.date = function (format, timestamp) {
                that = this;
                jsdate = (timestamp === undefined ? new Date() : // Not provided
                        (timestamp instanceof Date) ? new Date(timestamp) : // JS Date()
                            new Date(timestamp * 1000) // UNIX timestamp (auto-convert to int)
                );
                return format.replace(formatChr, formatChrCb);
            };
            return this.date(format, timestamp);
        }

        function sprintf() {
            //  discuss at: http://phpjs.org/functions/sprintf/
            // original by: Ash Searle (http://hexmen.com/blog/)
            // improved by: Michael White (http://getsprink.com)
            // improved by: Jack
            // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // improved by: Dj
            // improved by: Allidylls
            //    input by: Paulo Freitas
            //    input by: Brett Zamir (http://brett-zamir.me)
            //   example 1: sprintf("%01.2f", 123.1);
            //   returns 1: 123.10
            //   example 2: sprintf("[%10s]", 'monkey');
            //   returns 2: '[    monkey]'
            //   example 3: sprintf("[%'#10s]", 'monkey');
            //   returns 3: '[####monkey]'
            //   example 4: sprintf("%d", 123456789012345);
            //   returns 4: '123456789012345'
            //   example 5: sprintf('%-03s', 'E');
            //   returns 5: 'E00'

            var regex = /%%|%(\d+\$)?([-+\'#0 ]*)(\*\d+\$|\*|\d+)?(\.(\*\d+\$|\*|\d+))?([scboxXuideEfFgG])/g;
            var a = arguments;
            var i = 0;
            var format = a[i++];

            // pad()
            var pad = function (str, len, chr, leftJustify) {
                if (!chr) {
                    chr = ' ';
                }
                var padding = (str.length >= len) ? '' : new Array(1 + len - str.length >>> 0)
                    .join(chr);
                return leftJustify ? str + padding : padding + str;
            };

            // justify()
            var justify = function (value, prefix, leftJustify, minWidth, zeroPad, customPadChar) {
                var diff = minWidth - value.length;
                if (diff > 0) {
                    if (leftJustify || !zeroPad) {
                        value = pad(value, minWidth, customPadChar, leftJustify);
                    } else {
                        value = value.slice(0, prefix.length) + pad('', diff, '0', true) + value.slice(prefix.length);
                    }
                }
                return value;
            };

            // formatBaseX()
            var formatBaseX = function (value, base, prefix, leftJustify, minWidth, precision, zeroPad) {
                // Note: casts negative numbers to positive ones
                var number = value >>> 0;
                prefix = prefix && number && {
                        '2': '0b',
                        '8': '0',
                        '16': '0x'
                    }[base] || '';
                value = prefix + pad(number.toString(base), precision || 0, '0', false);
                return justify(value, prefix, leftJustify, minWidth, zeroPad);
            };

            // formatString()
            var formatString = function (value, leftJustify, minWidth, precision, zeroPad, customPadChar) {
                if (precision != null) {
                    value = value.slice(0, precision);
                }
                return justify(value, '', leftJustify, minWidth, zeroPad, customPadChar);
            };

            // doFormat()
            var doFormat = function (substring, valueIndex, flags, minWidth, _, precision, type) {
                var number, prefix, method, textTransform, value;

                if (substring === '%%') {
                    return '%';
                }

                // parse flags
                var leftJustify = false;
                var positivePrefix = '';
                var zeroPad = false;
                var prefixBaseX = false;
                var customPadChar = ' ';
                var flagsl = flags.length;
                for (var j = 0; flags && j < flagsl; j++) {
                    switch (flags.charAt(j)) {
                        case ' ':
                            positivePrefix = ' ';
                            break;
                        case '+':
                            positivePrefix = '+';
                            break;
                        case '-':
                            leftJustify = true;
                            break;
                        case "'":
                            customPadChar = flags.charAt(j + 1);
                            break;
                        case '0':
                            zeroPad = true;
                            customPadChar = '0';
                            break;
                        case '#':
                            prefixBaseX = true;
                            break;
                    }
                }

                // parameters may be null, undefined, empty-string or real valued
                // we want to ignore null, undefined and empty-string values
                if (!minWidth) {
                    minWidth = 0;
                } else if (minWidth === '*') {
                    minWidth = +a[i++];
                } else if (minWidth.charAt(0) == '*') {
                    minWidth = +a[minWidth.slice(1, -1)];
                } else {
                    minWidth = +minWidth;
                }

                // Note: undocumented perl feature:
                if (minWidth < 0) {
                    minWidth = -minWidth;
                    leftJustify = true;
                }

                if (!isFinite(minWidth)) {
                    throw new Error('sprintf: (minimum-)width must be finite');
                }

                if (!precision) {
                    precision = 'fFeE'.indexOf(type) > -1 ? 6 : (type === 'd') ? 0 : undefined;
                } else if (precision === '*') {
                    precision = +a[i++];
                } else if (precision.charAt(0) == '*') {
                    precision = +a[precision.slice(1, -1)];
                } else {
                    precision = +precision;
                }

                // grab value using valueIndex if required?
                value = valueIndex ? a[valueIndex.slice(0, -1)] : a[i++];

                switch (type) {
                    case 's':
                        return formatString(String(value), leftJustify, minWidth, precision, zeroPad, customPadChar);
                    case 'c':
                        return formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, zeroPad);
                    case 'b':
                        return formatBaseX(value, 2, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
                    case 'o':
                        return formatBaseX(value, 8, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
                    case 'x':
                        return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
                    case 'X':
                        return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad)
                            .toUpperCase();
                    case 'u':
                        return formatBaseX(value, 10, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
                    case 'i':
                    case 'd':
                        number = +value || 0;
                        number = Math.round(number - number % 1); // Plain Math.round doesn't just truncate
                        prefix = number < 0 ? '-' : positivePrefix;
                        value = prefix + pad(String(Math.abs(number)), precision, '0', false);
                        return justify(value, prefix, leftJustify, minWidth, zeroPad);
                    case 'e':
                    case 'E':
                    case 'f': // Should handle locales (as per setlocale)
                    case 'F':
                    case 'g':
                    case 'G':
                        number = +value;
                        prefix = number < 0 ? '-' : positivePrefix;
                        method = ['toExponential', 'toFixed', 'toPrecision']['efg'.indexOf(type.toLowerCase())];
                        textTransform = ['toString', 'toUpperCase']['eEfFgG'.indexOf(type) % 2];
                        value = prefix + Math.abs(number)[method](precision);
                        return justify(value, prefix, leftJustify, minWidth, zeroPad)[textTransform]();
                    default:
                        return substring;
                }
            };

            return format.replace(regex, doFormat);
        }

        function in_array(needle, haystack, argStrict) {
            //  discuss at: http://phpjs.org/functions/in_array/
            // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // improved by: vlado houba
            // improved by: Jonas Sciangula Street (Joni2Back)
            //    input by: Billy
            // bugfixed by: Brett Zamir (http://brett-zamir.me)
            //   example 1: in_array('van', ['Kevin', 'van', 'Zonneveld']);
            //   returns 1: true
            //   example 2: in_array('vlado', {0: 'Kevin', vlado: 'van', 1: 'Zonneveld'});
            //   returns 2: false
            //   example 3: in_array(1, ['1', '2', '3']);
            //   example 3: in_array(1, ['1', '2', '3'], false);
            //   returns 3: true
            //   returns 3: true
            //   example 4: in_array(1, ['1', '2', '3'], true);
            //   returns 4: false

            var key = '',
                strict = !!argStrict;

            //we prevent the double check (strict && arr[key] === ndl) || (!strict && arr[key] == ndl)
            //in just one for, in order to improve the performance
            //deciding wich type of comparation will do before walk array
            if (strict) {
                for (key in haystack) {
                    if (haystack[key] === needle) {
                        return true;
                    }
                }
            } else {
                for (key in haystack) {
                    if (haystack[key] == needle) {
                        return true;
                    }
                }
            }

            return false;
        }

        function trim(str, charlist) {
            //  discuss at: http://phpjs.org/functions/trim/
            // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // improved by: mdsjack (http://www.mdsjack.bo.it)
            // improved by: Alexander Ermolaev (http://snippets.dzone.com/user/AlexanderErmolaev)
            // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // improved by: Steven Levithan (http://blog.stevenlevithan.com)
            // improved by: Jack
            //    input by: Erkekjetter
            //    input by: DxGx
            // bugfixed by: Onno Marsman
            //   example 1: trim('    Kevin van Zonneveld    ');
            //   returns 1: 'Kevin van Zonneveld'
            //   example 2: trim('Hello World', 'Hdle');
            //   returns 2: 'o Wor'
            //   example 3: trim(16, 1);
            //   returns 3: 6

            var whitespace, l = 0,
                i = 0;
            str += '';

            if (!charlist) {
                // default list
                whitespace =
                    ' \n\r\t\f\x0b\xa0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000';
            } else {
                // preg_quote custom list
                charlist += '';
                whitespace = charlist.replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '$1');
            }

            l = str.length;
            for (i = 0; i < l; i++) {
                if (whitespace.indexOf(str.charAt(i)) === -1) {
                    str = str.substring(i);
                    break;
                }
            }

            l = str.length;
            for (i = l - 1; i >= 0; i--) {
                if (whitespace.indexOf(str.charAt(i)) === -1) {
                    str = str.substring(0, i + 1);
                    break;
                }
            }

            return whitespace.indexOf(str.charAt(0)) === -1 ? str : '';
        }

        function ltrim(str, charlist) {
            //  discuss at: http://phpjs.org/functions/ltrim/
            // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            //    input by: Erkekjetter
            // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // bugfixed by: Onno Marsman
            //   example 1: ltrim('    Kevin van Zonneveld    ');
            //   returns 1: 'Kevin van Zonneveld    '

            charlist = !charlist ? ' \\s\u00A0' : (charlist + '')
                .replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '$1');
            var re = new RegExp('^[' + charlist + ']+', 'g');
            return (str + '')
                .replace(re, '');
        }

        function rtrim(str, charlist) {
            //  discuss at: http://phpjs.org/functions/rtrim/
            // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            //    input by: Erkekjetter
            //    input by: rem
            // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // bugfixed by: Onno Marsman
            // bugfixed by: Brett Zamir (http://brett-zamir.me)
            //   example 1: rtrim('    Kevin van Zonneveld    ');
            //   returns 1: '    Kevin van Zonneveld'

            charlist = !charlist ? ' \\s\u00A0' : (charlist + '')
                .replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '\\$1');
            var re = new RegExp('[' + charlist + ']+$', 'g');
            return (str + '')
                .replace(re, '');
        }

        function showLoading(content, timeout) {
            var txt = content ? content : '';
            if (window.plus) {
                waitingNativeUI = plus.nativeUI.showWaiting(txt);
            }
            var closeTime = timeout ? timeout : 10000;
            Core.$timeout(function () {
                waitingNativeUI.close();
            }, closeTime);
        }

        function hideLoading() {
            if (waitingNativeUI) {
                waitingNativeUI.close();
            }
        }

        function showAlertDialog(message) {
            message = message ? message : "";
            var uibModal = Core.$uibModal.open({
                templateUrl: 'public.dialog.alert.html',
                controller: 'DialogAlertController',
                backdrop: false,
                resolve: {
                    message: function () {
                        return message;
                    }
                }
            });

            uibModal.result.then(function () {
                Core.Log.d('click ok');
            }, function () {
                Core.Log.d('Modal dismissed at: ' + new Date());
            });
        }

        function showConfirmModal(title, content, confirm) {
            return Core.$uibModal.open({
                templateUrl: 'public.dialog.confirm.html',
                controller: 'DialogConfirmController',
                backdrop: false,
                resolve: {
                    title: function () {
                        return title;
                    },
                    content: function () {
                        return content
                    },
                    confirm: function () {
                        return confirm;
                    }
                }
            });
        }

        function electricMotorErrorCheck(type, data) {
            if (data == undefined) {
                return;
            }
            var bit1 = parseInt(data.substring(0, 1));
            var bit2 = parseInt(data.substring(1, 2));
            var errorBit = sprintf("%04d", bit1) + sprintf("%04d", bit2);
            var err0 = errorBit.substring(0, 1);
            var err1 = errorBit.substring(1, 2);
            var err2 = errorBit.substring(2, 3);
            var err3 = errorBit.substring(3, 4);
            var err4 = errorBit.substring(4, 5);
            var err5 = errorBit.substring(5, 6);
            var err6 = errorBit.substring(6, 7);
            var err7 = errorBit.substring(7, 8);
            var errMsg = "";

            switch (type) {
                case Const.ELECTRIC_MOTOR_ERROR_TYPE.ERROR_TYPE_1:
                    if (err1 == "1") {
                        errMsg += "过流,";
                    }
                    if (err2 == "1") {
                        errMsg += "过热,";
                    }
                    if (err3 == "1") {
                        errMsg += "过压,";
                    }
                    if (err5 == "1") {
                        errMsg += "欠压,";
                    }
                    if (err6 == "1") {
                        errMsg += "电量不足,";
                    }
                    if (err7 == "1") {
                        errMsg += "堵转,";
                    }
                    return errMsg ? errMsg.substring(0, errMsg.length - 1) : "";
                    break;
                case Const.ELECTRIC_MOTOR_ERROR_TYPE.ERROR_TYPE_2:
                    if (err3 == "1") {
                        errMsg += "上桥损坏,";
                    }
                    if (err4 == "1") {
                        errMsg += "下桥损坏,";
                    }
                    return errMsg ? errMsg.substring(0, errMsg.length - 1) : "";
                case Const.ELECTRIC_MOTOR_ERROR_TYPE.ERROR_TYPE_3:
                    if (err2 == "1") {
                        errMsg += "霍尔A开路,";
                    }
                    if (err3 == "1") {
                        errMsg += "霍尔A短路,";
                    }
                    if (err4 == "1") {
                        errMsg += "霍尔B开路,";
                    }
                    if (err5 == "1") {
                        errMsg += "霍尔B短路,";
                    }
                    if (err6 == "1") {
                        errMsg += "霍尔C开路,";
                    }
                    if (err7 == "1") {
                        errMsg += "霍尔C短路,";
                    }
                    return errMsg ? errMsg.substring(0, errMsg.length - 1) : "";
                case Const.ELECTRIC_MOTOR_ERROR_TYPE.ERROR_TYPE_4:
                    if (err2 == "1") {
                        errMsg += "手把电源没接,";
                    }
                    if (err3 == "1") {
                        errMsg += "手把地线没接,";
                    }
                    if (err4 == "1") {
                        errMsg += "手把上电未复位,";
                    }
                    if (err5 == "1") {
                        errMsg += "刹把上电未复位,";
                    }
                    return errMsg ? errMsg.substring(0, errMsg.length - 1) : "";
            }

        }

        function bmsErrorCheck(data) {
            if (data == undefined) {
                return;
            }
            var bit1 = parseInt(data.substring(0, 1));
            var bit2 = parseInt(data.substring(1, 2));
            var errorBit = sprintf("%04d", bit1) + sprintf("%04d", bit2);
            var err0 = errorBit.substring(0, 1);
            var err1 = errorBit.substring(1, 2);
            var err2 = errorBit.substring(2, 3);
            var err3 = errorBit.substring(3, 4);
            var err4 = errorBit.substring(4, 5);
            var err5 = errorBit.substring(5, 6);
            var err6 = errorBit.substring(6, 7);
            var err7 = errorBit.substring(7, 8);
            var errMsg = "";

            if (err0 == "1") {
                errMsg += "限功率输出,";
            }
            if (err1 == "1") {
                errMsg += "电池不一致,";
            }
            if (err2 == "1") {
                errMsg += "电量不足,";
            }
            if (err3 == "1") {
                errMsg += "过流,";
            }
            if (err4 == "1") {
                errMsg += "过热,";
            }
            if (err5 == "1") {
                errMsg += "低温,";
            }
            if (err6 == "1") {
                errMsg += "过压,";
            }
            if (err7 == "1") {
                errMsg += "低压,";
            }
            return errMsg ? errMsg.substring(0, errMsg.length - 1) : "";
        }

        function luoBoCarHexToSingleBatch(data) {
            var dataLength = data.length;
            var num = dataLength / 2;
            var array = [];
            for (var i = 0; i < num; i++) {
                var str = data.substring(i * 2, i * 2 + 2);
                array.push(str);
            }
            array.reverse();
            var baseStr = "";
            for (var j = 0; j < num; j++) {
                baseStr += array[j];
            }
            return HexToSingleBatch(baseStr);

        }

        function InsertString(t, c, n) {
            var r = new Array();
            for (var i = 0; i * 2 < t.length; i++) {
                r.push(t.substr(i * 2, n));
            }
            return r.join(c);
        }

        function FillString(t, c, n, b) {
            if ((t == "") || (c.length != 1) || (n <= t.length)) {
                return t;
            }
            var l = t.length;
            for (var i = 0; i < n - l; i++) {
                if (b == true) {
                    t = c + t;
                }
                else {
                    t += c;
                }
            }
            return t;
        }

        function HexToSingle(t) {
            t = t.replace(/\s+/g, "");
            if (t == "") {
                return "";
            }
            if (t == "00000000") {
                return "0";
            }
            if ((t.length > 8) || (isNaN(parseInt(t, 16)))) {
                return "Error";
            }
            if (t.length < 8) {
                t = FillString(t, "0", 8, true);
            }
            t = parseInt(t, 16).toString(2);
            t = FillString(t, "0", 32, true);
            var s = t.substring(0, 1);
            var e = t.substring(1, 9);
            var m = t.substring(9);
            e = parseInt(e, 2) - 127;
            m = "1" + m;
            if (e >= 0) {
                m = m.substr(0, e + 1) + "." + m.substring(e + 1)
            }
            else {
                m = "0." + FillString(m, "0", m.length - e - 1, true)
            }
            if (m.indexOf(".") == -1) {
                m = m + ".0";
            }
            var a = m.split(".");
            var mi = parseInt(a[0], 2);
            var mf = 0;
            for (var i = 0; i < a[1].length; i++) {
                mf += parseFloat(a[1].charAt(i)) * Math.pow(2, -(i + 1));
            }
            m = parseInt(mi) + parseFloat(mf);
            if (s == 1) {
                m = 0 - m;
            }
            return m;
        }

        function SingleToHex(t) {
            if (t == "") {
                return "";
            }
            t = parseFloat(t);
            if (isNaN(t) == true) {
                return "Error";
            }
            if (t == 0) {
                return "00000000";
            }
            var s,
                e,
                m;
            if (t > 0) {
                s = 0;
            }
            else {
                s = 1;
                t = 0 - t;
            }
            m = t.toString(2);
            if (m >= 1) {
                if (m.indexOf(".") == -1) {
                    m = m + ".0";
                }
                e = m.indexOf(".") - 1;
            }
            else {
                e = 1 - m.indexOf("1");
            }
            if (e >= 0) {
                m = m.replace(".", "");
            }
            else {
                m = m.substring(m.indexOf("1"));
            }
            if (m.length > 24) {
                m = m.substr(0, 24);
            }
            else {
                m = FillString(m, "0", 24, false)
            }
            m = m.substring(1);
            e = (e + 127).toString(2);
            e = FillString(e, "0", 8, true);
            var r = parseInt(s + e + m, 2).toString(16);
            r = FillString(r, "0", 8, true);
            return InsertString(r, " ", 2).toUpperCase();
        }

        function FormatHex(t, n, ie) {
            var r = new Array();
            var s = "";
            var c = 0;
            for (var i = 0; i < t.length; i++) {
                if (t.charAt(i) != " ") {
                    s += t.charAt(i);
                    c += 1;
                    if (c == n) {
                        r.push(s);
                        s = "";
                        c = 0;
                    }
                }
                if (ie == false) {
                    if ((i == t.length - 1) && (s != "")) {
                        r.push(s);
                    }
                }
            }
            return r.join("\n");
        }

        function FormatHexBatch(t, n, ie) {
            var a = t.split("\n");
            var r = new Array();
            for (var i = 0; i < a.length; i++) {
                r[i] = FormatHex(a[i], n, ie);
            }
            return r.join("\n");
        }

        function HexToSingleBatch(t) {
            var a = FormatHexBatch(t, 8, true).split("\n");
            var r = new Array();
            for (var i = 0; i < a.length; i++) {
                r[i] = HexToSingle(a[i]);
            }
            return r.join("\r\n");
        }

        function SingleToHexBatch(t) {
            var a = t.split("\n");
            var r = new Array();
            for (var i = 0; i < a.length; i++) {
                r[i] = SingleToHex(a[i]);
            }
            return r.join("\r\n");
        }

        function toDecimal2(x) {
            var f = parseFloat(x);
            if (isNaN(f)) {
                return false;
            }
            var f = Math.round(x * 100) / 100;
            var s = f.toString();
            var rs = s.indexOf('.');
            if (rs < 0) {
                rs = s.length;
                s += '.';
            }
            while (s.length <= rs + 2) {
                s += '0';
            }
            return s;
        }

        function parseQRCodeResult(data) {
            var str1 = data.substring(0, 2);
            var str2 = data.substring(2, 4);
            var str3 = data.substring(4, 6);
            var str4 = data.substring(6, 8);
            return str1 + ":" + str2 + ":" + str3 + ":" + str4;

        }

        function closeAllWithoutPage(pageId) {
            setTimeout(function () {
                if (window.plus) {
                    var pages = plus.webview.all();
                    for (var i = 0; i < pages.length; i++) {
                        var page = pages[i];
                        if (page.id != pageId) {
                            page.close('none');
                        }
                    }
                }
            }, 2500);
        }

        function upLoad(url, filePath, timeout, success, fail) {
            var task = plus.uploader.createUpload(url,
                {method: "POST", blocksize: 204800, priority: 100, timeout: timeout, retryInterval: 2},
                function (t, status) {
                    if (status == 200) {
                        var responseText = JSON.parse(t.responseText);
                        var fileName;
                        if (responseText.data) {
                            fileName = responseText.data.file.name;
                        }
                        success(fileName);
                    } else {
                        fail();
                    }
                }
            );
            task.addFile(filePath, {key: "file"});
            task.start();
        }

        function base642Byte(b64) {
            var lookup = [];
            var revLookup = [];
            var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;

            var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
            for (var i = 0, len = code.length; i < len; ++i) {
                lookup[i] = code[i]
                revLookup[code.charCodeAt(i)] = i
            }

            revLookup['-'.charCodeAt(0)] = 62;
            revLookup['_'.charCodeAt(0)] = 63;

            return toByteArray(b64);

            function placeHoldersCount(b64) {
                var len = b64.length;
                if (len % 4 > 0) {
                    throw new Error('Invalid string. Length must be a multiple of 4')
                }

                // the number of equal signs (place holders)
                // if there are two placeholders, than the two characters before it
                // represent one byte
                // if there is only one, then the three characters before it represent 2 bytes
                // this is just a cheap hack to not do indexOf twice
                return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
            }

            function byteLength(b64) {
                // base64 is 4/3 + up to two characters of the original data
                return b64.length * 3 / 4 - placeHoldersCount(b64)
            }

            function toByteArray(b64) {
                var i, j, l, tmp, placeHolders, arr;
                var len = b64.length;
                placeHolders = placeHoldersCount(b64);

                arr = new Arr(len * 3 / 4 - placeHolders);

                // if there are placeholders, only get up to the last complete 4 chars
                l = placeHolders > 0 ? len - 4 : len

                var L = 0

                for (i = 0, j = 0; i < l; i += 4, j += 3) {
                    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
                    arr[L++] = (tmp >> 16) & 0xFF
                    arr[L++] = (tmp >> 8) & 0xFF
                    arr[L++] = tmp & 0xFF
                }

                if (placeHolders === 2) {
                    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
                    arr[L++] = tmp & 0xFF
                } else if (placeHolders === 1) {
                    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
                    arr[L++] = (tmp >> 8) & 0xFF
                    arr[L++] = tmp & 0xFF
                }

                return arr
            }
        }


    }

})();