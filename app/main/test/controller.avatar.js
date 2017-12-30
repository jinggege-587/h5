(function () {
    angular
        .module('app')
        .controller('AvatarController', ['$scope', 'Core', AvatarController]);


    function AvatarController($scope, Core) {

        $scope.confirm = confirm;
        document.addEventListener('plusready', function () {
            //getImage();
            galleryImgs();
        });

        function getImage() {
            var cmr = plus.camera.getCamera();
            cmr.captureImage( function (p) {
                plus.io.resolveLocalFileSystemURL( p, function ( entry ) {
                    var localurl = entry.toLocalURL();//
                    $("#report").html('<img src="'+localurl+'">');
                    cutImg();
                    mui('#picture').popover('toggle');
                });
            });
        }

        function galleryImgs(){
            plus.gallery.pick( function(e){
                $("#report").html('<img src="'+e.files[0]+'">');
                cutImg();
                mui('#picture').popover('toggle');
            }, function ( e ) {
                outSet( "取消选择图片" );
            },{filter:"image",multiple:true});
        }

        function confirm(){

            $("#showEdit").fadeOut();
            var $image = $('#report > img');
            var dataURL = $image.cropper("getDataURL");
            $("#changeAvatar").html('<img src="'+dataURL+'" />');
        }

        function postAvatar() {

            var $image = $('#report > img');
            var dataURL = $image.cropper("getDataURL");
            var data = {
                base64: dataURL
            };
            $.post(url,data,function(data){
                //这里就自己写了哈
            });
        }

        function cutImg(){
            $("#showEdit").fadeIn();
            var $image = $('#report > img');
            $image.cropper({
                aspectRatio: 1 / 1,
                autoCropArea: 0.8
            });
        }
    }
})();