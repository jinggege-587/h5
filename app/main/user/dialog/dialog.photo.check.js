(function () {
    angular
        .module('app')
        .controller('PhotoCheckController', ['$scope', 'Core', PhotoCheckController]);


    function PhotoCheckController($scope, Core) {
        var vm = $scope;
        vm.album = album;
        vm.camera = camera;
        vm.cancel = cancel;

        function album(){
            plus.gallery.pick( function(e){
                //$("#report").html('<img src="'+e.files[0]+'">');
                //cutImg();
                //mui('#picture').popover('toggle');

            }, function ( e ) {
                outSet( "取消选择图片" );
            },{filter:"image",multiple:true});

        }

        function camera(){
            //var cmr = plus.camera.getCamera();
            //cmr.captureImage( function (p) {
            //    plus.io.resolveLocalFileSystemURL( p, function ( entry ) {
            //        var localurl = entry.toLocalURL();//
            //        $("#report").html('<img src="'+localurl+'">');
            //        cutImg();
            //        mui('#picture').popover('toggle');
            //    });
            //});
            var cmr = plus.camera.getCamera();
            cmr.captureImage( function ( path ) {
                plus.gallery.save( path );
                //Core.Util.goToPage('user-avatar-deal', 'user.avatar.deal.html', null, {path: path});
            }, function ( e ) {
                outSet( "取消拍照" );
            }, {filename:"_doc/gallery/",index:1} );
        }

        function cancel(){

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