/**
 * Created by dd on 12/26/15.
 */
(function () {
    angular
        .module('app.core')
        .factory('Data', ['$q', 'localStorageService', 'Const', 'Util',Data]);

    function Data($q, localStorageService, Const ,Util) {

        return {
            isGuest: isGuest,
            getToken: getToken,
            setToken: setToken,
            getUser: getUser,
            setUser: setUser,
            get: get,
            set: set,
            getName: getName,
            getAvatar: getAvatar,
            clearAuthData: clearAuthData
        };

        function getName(name)
        {
            return name?name:'未命名';
        }

        function getAvatar(img)
        {
            return img? Util.getImgUrl(img) : Const.DATA.KEY_DEFAULT_AVATAR;
        }

        function isGuest()
        {
            var token = getToken();
            return !token;
        }

        function getKey(key) {
            return Const.DATA.KEY_PREFIX + key;
        }

        function get(key) {
            key = getKey(key);
            return localStorageService.get(key);
        }

        function set(key, val) {
            key = getKey(key);
            return localStorageService.set(key, val);
        }

        function getToken() {
            var key = Const.DATA.KEY_TOKEN;
            return get(key);
        }

        function setToken(token) {
            var key = Const.DATA.KEY_TOKEN;
            return set(key, token);
        }

        function getUser() {
            var key = Const.DATA.KEY_USER;
            return get(key);
        }

        function setUser(user) {
            var key = Const.DATA.KEY_USER;
            return set(key, user);
        }

        function clearAuthData() {
            setToken('');
            setUser('');
        }
    }

})();