(function () {
    angular
        .module('app.core')
        .factory('Map', ['$window', 'Log', 'Util', 'Data', Map]);

    function Map($window, Log, Util, Data) {

        function startNativeLocation() {
            var map = new plus.maps.Map("map");
            document.addEventListener("DOMContentLoaded", function () {
                map = new plus.maps.Map("map");
                console.log('DOMContentLoaded', map);
            }, false);
            var lastLocation;
            Core.$interval(function () {
                map.getUserLocation(function (state, point) {
                    var time = Util.time();
                    if (0 == state) {
                        var lng = point.longitude;
                        var lat = point.latitude;
                        var currentLocation ={lng: lng, lat: lat, time: time};
                        if (!lastLocation) {
                            lastLocation = currentLocation;
                        }
                        if (Util.distance(lastLocation.lng, lastLocation.lat, currentLocation.lng, currentLocation.lat) < 30) {
                            Data.set('current_location', currentLocation);
                        }
                        lastLocation = currentLocation;
                    } else {
                        Data.set('current_location', {lng: 0, lat: 0, time: time});
                    }
                });
            }, 1000);

        }


        function startLocation() {
            return;

            //加载地图，调用浏览器定位服务
            var map = new AMap.Map('', {
                resizeEnable: true
            });
            map.plugin('AMap.Geolocation', function () {
                var geolocation = new AMap.Geolocation({
                    enableHighAccuracy: true,//是否使用高精度定位，默认:true
                    //timeout: 10000,          //超过10秒后停止定位，默认：无穷大
                });
                map.addControl(geolocation);
                geolocation.getCurrentPosition();
                AMap.event.addListener(geolocation, 'complete', function (data) {
                    var lng = data.position.getLng();
                    var lat = data.position.getLat();
                    Data.set('current_location', {lng: lng, lat: lat, time: Util.time()})
                });//返回定位信息
                AMap.event.addListener(geolocation, 'error', function () {

                });      //返回定位出错信息
            });
        }

        function drawNativeLine(locationList) {
            var map = new plus.maps.Map("container");
            document.addEventListener("DOMContentLoaded", function () {
                map = new plus.maps.Map("container");
            }, false);

            var points = [];
            var polylineObj = new plus.maps.Polyline(points);
            //console.log(polylineObj);
            polylineObj.setStrokeColor("#FE7101");


            var totalLon = 0, totalLat = 0;
            var size = locationList.length;
            var lngList = [];
            var latList = [];
            for (var i in locationList) {
                totalLon += locationList[i].lng;
                totalLat += locationList[i].lat;
                var lng, lat;
                lng = locationList[i].lng;
                lat = locationList[i].lat;
                var point = new plus.maps.Point(lng, lat);
                lngList.push(lng);
                latList.push(lat);
                points.push(point);
            }
            map.centerAndZoom(new plus.maps.Point(totalLon / size, totalLat / size), 13);
            map.addOverlay(polylineObj);
        }

        function drawLine(locationList) {
            var totalLon = 0, totalLat = 0;
            var size = locationList.length;
            var lineArry = [];
            var lngList = [];
            var latList = [];
            for (var i in locationList) {
                totalLon += locationList[i].lng;
                totalLat += locationList[i].lat;
                var line = [];
                line[0] = locationList[i].lng;
                line[1] = locationList[i].lat;
                lngList.push(line[0]);
                latList.push(line[1]);
                lineArry.push(line);
            }
            var map = new AMap.Map('container', {
                resizeEnable: true,
                center: [totalLon / size, totalLat / size],
                zoom: 13
            });
            //console.log(lineArry);
            //添加点标记，并使用自己的icon
            new AMap.Marker({
                map: map,
                position: [locationList[0].lng, locationList[0].lat],
                icon: new AMap.Icon({
                    size: new AMap.Size(100, 100),
                    imageSize: new AMap.Size(30, 30),  //图标大小
                    image: "main/img/icon-start.png",
                    imageOffset: new AMap.Pixel(0, 18)
                })
            });

            new AMap.Marker({
                map: map,
                position: [locationList[locationList.length - 1].lng, locationList[locationList.length - 1].lat],
                icon: new AMap.Icon({
                    size: new AMap.Size(100, 100),
                    imageSize: new AMap.Size(25, 31),  //图标大小
                    image: "main/img/icon-end.png",
                    imageOffset: new AMap.Pixel(0, 12)
                })
            });


            var polyline = new AMap.Polyline({
                path: lineArry,          //设置线覆盖物路径
                strokeColor: "#FE7101", //线颜色
                strokeOpacity: 1,       //线透明度
                strokeWeight: 2,        //线宽
                strokeStyle: "solid",   //线样式
                strokeDasharray: [10, 5] //补充线样式
            });
            polyline.setMap(map);


            var maxlng = Math.max.apply(null, lngList);
            var minlng = Math.min.apply(null, lngList);

            var maxlat = Math.max.apply(null, latList);
            var minlat = Math.min.apply(null, latList);


            var southWest = new AMap.LngLat(minlng, maxlat);
            var northEast = new AMap.LngLat(maxlng, maxlat);
            var bounds = new AMap.Bounds(southWest, northEast);
            //map.panBy(0, -200);
            //map.setBounds(bounds);
            //map.setLimitBounds(map.getBounds());
            map.panTo([totalLon / size, totalLat / size]);

            map.setFitView();
            map.panBy(0, -50);
        }

        function drawtest() {

            var map = new AMap.Map('container', {
                resizeEnable: true,
                center: [116.397428, 39.90923],
                zoom: 13
            });
            //console.log('map', map);
            var lineArr = [
                [116.368904, 39.913423],
                [116.382122, 39.901176],
                [116.387271, 39.912501],
                [116.398258, 39.904600]
            ];
            var polyline = new AMap.Polyline({
                path: lineArr,          //设置线覆盖物路径
                strokeColor: "#3366FF", //线颜色
                strokeOpacity: 1,       //线透明度
                strokeWeight: 5,        //线宽
                strokeStyle: "solid",   //线样式
                strokeDasharray: [10, 5] //补充线样式
            });
            //console.log('polyline', polyline);
            polyline.setMap(map);

        }


        function getLocation() {
            var time = Util.time();
            var location = Data.get('current_location');
            if (location) {
                if (time - location.time < 10000) {
                    return {lng: location.lng, lat: location.lat}
                }
            }
            return {lng: 0, lat: 0}
        }

        var count = 0;

        function drawSport(map, lineArr, marker) {

            // 绘制轨迹
            new AMap.Polyline({
                map: map,
                path: lineArr,
                strokeColor: "#FE7101",  //线颜色
                strokeOpacity: 1,     //线透明度
                strokeWeight: 3,      //线宽
                strokeStyle: "solid"  //线样式
            });
            //new AMap.Marker({
            //    map: map,
            //    position: [lineArr[lineArr.length - 1][0], lineArr[lineArr.length - 1][1]],
            //    icon: new AMap.Icon({
            //        size: new AMap.Size(30, 30),  //图标大小
            //        image: "main/img/icon-start.png",
            //        imageOffset: new AMap.Pixel(-5, 4)
            //    })
            //});
            marker.setPosition([lineArr[lineArr.length - 1][0], lineArr[lineArr.length - 1][1]]);
            count++;
            if (count % 10 == 0) {
                map.panTo([lineArr[lineArr.length - 1][0], lineArr[lineArr.length - 1][1]]);
            }


            //map.setFitView();
        }


        function startGeoLocation() {

            Core.$interval(function () {
                plus.geolocation.getCurrentPosition(function (p) {
                    console.log("geolocation", p);
                    Data.set('current_speed', {speed: p.coords.speed, time: Util.time()});
                }, function (e) {
                    //console.log('error', e);
                    //Data.set('current_location', {lng: 0, lat: 0, time: Util.time()});
                }, {enableHighAccuracy: true});
            }, 1000);
            //plus.geolocation.watchPosition(function (p) {
            //    alert('watchPosition:' + p.coords.speed);
            //    Data.set('current_speed', {speed: p.coords.speed, time: Util.time()});
            //}, function (e) {
            //    alert('error:' + e);
            //}, {provider: 'system', enableHighAccuracy: true});
        }

        function getSpeed() {
            var time = Util.time();
            var speed = Data.get('current_speed');
            if (speed) {
                if (time - speed.time < 3000) {
                    return speed.speed;
                }
            }
            return 0;
        }

        var lastLng, lastLat;

        function startSpeedCalculation() {
            var map = new plus.maps.Map("map");
            document.addEventListener("DOMContentLoaded", function () {
                map = new plus.maps.Map("map");
            }, false);
            Core.$interval(function () {

                plus.geolocation.getCurrentPosition(function (p) {
                    Data.set('current_speed', {speed: p.coords.speed, time: Util.time()});
                    var lng = point.longitude;
                    var lat = point.latitude;
                    if (!lastLng) {
                        lastLng = lng;
                        lastLat = lat;
                    }
                    var speed = Util.distance(lng, lat, lastLng, lastLat);
                    lastLng = lng;
                    lastLat = lat;
                    Data.set('speed', {speed: speed, time: Util.time()});
                }, function (e) {
                });
            }, 1000);

        }

        return {
            startLocation: startLocation,
            startNativeLocation: startNativeLocation,
            getLocation: getLocation,
            drawLine: drawLine,
            drawNativeLine: drawNativeLine,
            drawSport: drawSport,
            drawTest: drawtest,
            startGeoLocation: startGeoLocation,
            startSpeedCalculation: startSpeedCalculation,
            getSpeed: getSpeed,
        };
    }
})();