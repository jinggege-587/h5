var gulp = require('gulp');
var gutil = require('gulp-util');
var watch = require('gulp-watch');
var autoprefixer = require('gulp-autoprefixer');
var coffee = require('gulp-coffee');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var replace = require('gulp-replace');
var minifyHTML = require('gulp-minify-html');
var rename = require("gulp-rename");
var merge = require('merge-stream');
var phpjs = require('phpjs');
var clean = require('gulp-clean');
var templateCache = require('gulp-angular-templatecache');
var mkdirp = require('mkdirp');
var empty = require("gulp-empty");
var shell = require('gulp-shell');
var rev = require("gulp-rev");
var revReplace = require("gulp-rev-replace");
var browserSync = require('browser-sync').create();
var stylus = require('gulp-stylus');
var sass = require('gulp-sass');

var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');

var ignore = require('gulp-ignore');
var debug = require('gulp-debug');
const filter = require('gulp-filter');

var fs = require("fs");

var isProd = false;

// 所有要生成的包含js/css/img的子目录,生成在在build目录下,保持目录结构
var apps = ['main'];

// 所有要生成的网页,都放在build根目录下
var pages = [
    {layout: 'mui', name: 'main', path: 'main/login/main', file: 'login.main.html', title: 'App'},
    {layout: 'mui', name: 'main', path: 'main/login/register', file: 'login.register.html', title: 'App'},
    {layout: 'mui', name: 'main', path: 'main/login/login', file: 'login.login.html', title: 'App'},
    {layout: 'mui', name: 'main', path: 'main/login/forget-password', file: 'login.forget-password.html', title: 'App'},
    {layout: 'mui', name: 'main', path: 'main/login/reset-password', file: 'login.reset-password.html', title: 'App'},
    {layout: 'mui', name: 'main', path: 'main/car/main', file: 'car.main.html', title: 'App'},
    {layout: 'mui', name: 'main', path: 'main/car/link-solution', file: 'car.link.solution.html', title: 'App'},
    {layout: 'mui', name: 'main', path: 'main/car/link-list', file: 'car.link.list.html', title: 'App'},
    {layout: 'mui', name: 'main', path: 'main/car/garage', file: 'car.garage.html', title: 'App'},
    {layout: 'mui', name: 'main', path: 'main/user/main', file: 'user.main.html', title: 'App'},
    {layout: 'mui', name: 'main', path: 'main/user/detail', file: 'user.detail.html', title: 'App'},
    {layout: 'mui', name: 'main', path: 'main/user/reset-pwd', file: 'user.reset.pwd.html', title: 'App'},
    {layout: 'mui', name: 'main', path: 'main/user/reset-nickname', file: 'user.reset.nickname.html', title: 'App'},
    {
        layout: 'dialog',
        name: 'main',
        path: 'main/car/dialog/dialog-car-fail-link',
        file: 'car.dialog.car-fail-link.html',
        title: 'App'
    },
    {layout: 'mui-map', name: 'main', path: 'main/sport/main', file: 'sport.main.html', title: 'App'},
    {
        layout: 'dialog',
        name: 'main',
        path: 'main/sport/dialog/dialog-sport-exit',
        file: 'sport.dialog.sport.exit.html',
        title: 'App'
    },
    {layout: 'mui', name: 'main', path: 'main/setting/main', file: 'setting.main.html', title: 'App'},
    {layout: 'mui', name: 'main', path: 'main/setting/upgrade', file: 'setting.upgrade.html', title: 'App'},
    {layout: "mui-map", name: 'main', path: 'main/riding/list', file: 'riding.list.html', title: 'App'},
    {layout: "mui-map", name: 'main', path: 'main/riding/detail', file: 'riding.detail.html', title: 'App'},
    {layout: "mui", name: 'main', path: 'main/riding/feel', file: 'riding.feel.html', title: 'App'},
    {layout: 'dialog', name: 'main', path: 'main/public/dialog-alert', file: 'public.dialog.alert.html', title: 'App'},
    {
        layout: 'dialog',
        name: 'main',
        path: 'main/public/dialog-confirm',
        file: 'public.dialog.confirm.html',
        title: 'App'
    },
    {layout: 'mui-map', name: 'main', path: 'main/main/main', file: 'main.main.html', title: 'App'},
    {
        layout: 'dialog',
        name: 'main',
        path: 'main/user/dialog/dialog-photo-check',
        file: 'user.dialog.photo.check.html',
        title: 'App'
    },
    {layout: 'mui', name: 'main', path: 'main/barcode/barcode.scan', file: 'barcode.scan.html', title: 'App'},
    {layout: 'mui', name: 'main', path: 'main/user/about', file: 'user.about.html', title: 'App'},
    {layout: 'mui', name: 'main', path: 'main/user/feedback', file: 'user.feedback.html', title: 'App'},
    {layout: 'mui', name: 'main', path: 'main/user/course', file: 'user.course.html', title: 'App'},
    {layout: 'mui', name: 'main', path: 'main/test/test', file: 'test.test.html', title: 'App'},
    {layout: 'mui', name: 'main', path: 'main/test/test1', file: 'test.test1.html', title: 'App'},
];

// 删除build,忽略build下的asset文件夹
gulp.task('clean-build', function () {
    var tasks = [];

    // const f = filter(['!build/asset{,/*,/**,/**/*}']);
    const f = filter(['!build/asset']);

    tasks.push(
        gulp.src(['build/**/*', 'build/*', 'build/**'], {read: false})
            // gulp.src(['build'], {read: false})
            .pipe(f)
            // .pipe(ignore.exclude('build/asset{,/*,/**,/**/*}'))
            .pipe(clean({force: true}))
    );

    return merge.apply(null, tasks);
});

// 删除dist
gulp.task('clean-dist', function () {
    var tasks = [];

    tasks.push(
        gulp.src(['dist'], {read: false})
            .pipe(clean({force: true}))
    );

    return merge.apply(null, tasks);
});

// 设置生产环境标志
gulp.task('set-prod-true', function () {
    isProd = true;
});

// 生成inspina库
gulp.task('concat-mui', ['clean-build'], function () {

    // if (fs.existsSync('build/asset/inspinia/css') && fs.existsSync('build/asset/inspinia/js')){
    //     return;
    // }

    // var copyTask = gulp.src('./lib/inspinia/**/*')
    //     .pipe(gulp.dest('build/asset/inspinia/'));

    var copyTask = gulp.src(['./lib/mui/**/*'])
        .pipe(gulp.dest('build/asset/mui/'));

    var cssBundleTask = gulp.src(['./lib/mui/css/mui.min.css'])
        .pipe(concat('bundle.min.css', {newLine: '\r\n'}))
        .pipe(gulp.dest('build/asset/mui/css/'));

    var jsBundleTask = gulp.src([
            './lib/mui/js/mui.min.js',
            './lib/mui/js/common.js',
            './node_modules/angular/angular.min.js',
            './node_modules/angular-local-storage/dist/angular-local-storage.js',
            './lib/bootstrap/ui-bootstrap-modal-tpls-2.1.3.min.js',
            './lib/mui/js/html2canvas.js',
            //'./lib/inspinia/js/jquery/jquery-2.1.1.min.js',
            //'./lib/mui/js/cropper.min.js'
        ])
        .pipe(concat('bundle.min.js', {newLine: ';\r\n'}))
        .pipe(gulp.dest('build/asset/mui/js/'));

    return merge(copyTask, cssBundleTask, jsBundleTask);
});


// 生成core下的template模板
gulp.task('build-angular-template-core', ['clean-build'], function () {

    var src = ['core/template/*.html', 'core/template/**/*.html'];

    var tasks = [];
    var taskCore = gulp.src(src)
        .pipe(templateCache({root: 'core/template', standalone: true}))
        .pipe(rename('core.template.js'))
        .pipe(gulp.dest('build/core-template'));
    tasks.push(taskCore);

    return merge.apply(null, tasks);
});

// 生成各个app下的template模板
gulp.task('build-angular-template', ['build-angular-template-core'], function () {
    var tasks = [];

    for (var i in apps) {
        var dir = apps[i];
        var task = gulp.src(['app/' + dir + '/template/*.html', 'app/' + dir + '/template/**/*.html'])
            .pipe(templateCache({root: dir}))
            .pipe(rename('template.js'))
            .pipe(gulp.dest('build/' + dir + '/js'));
        tasks.push(task);
    }

    return merge.apply(null, tasks);
});

// 将core生成的template加到各个app生成的template
gulp.task('concat-angular-template', ['build-angular-template-core', 'build-angular-template'], function () {
    var tasks = [];

    for (var i in apps) {
        var dir = apps[i];
        var task = gulp.src(['build/core-template/*.js', 'build/' + dir + '/js/template.js'])
            .pipe(concat('template.js'))
            .pipe(gulp.dest('build/' + dir + '/js'));
        tasks.push(task);
    }

    return merge.apply(null, tasks);
});

// 将core生成的js加到各个app生成的js
gulp.task('build-js', ['clean-build', 'concat-angular-template'], function () {
    var tasks = [];

    for (var i in apps) {
        var dir = apps[i];
        var task = gulp.src(['core/js/*.js', 'app/app.js', 'app/' + dir + '/**/*.js'])
            .pipe(concat('app'))
            .pipe(rename({extname: '.js'}))
            .pipe(gulp.dest('build/' + dir + '/js'));
        tasks.push(task);

        var taskProd = gulp.src(['core/js/*.js', 'app/app.js', 'app/' + dir + '/**/*.js'])
            .pipe(uglify())
            .pipe(concat('app'))
            .pipe(rename({extname: '.min.js'}))
            .pipe(gulp.dest('build/' + dir + '/js'));
        tasks.push(taskProd);
    }


    return merge.apply(null, tasks);
});

// 将各个app的template模板js与应用js合并,生成最终的bundle
gulp.task('build-js-bundle', ['build-js', 'concat-angular-template'], function () {
    var tasks = [];

    for (var i in apps) {
        var dir = apps[i];
        var task = gulp.src(['build/' + dir + '/js/template.js', 'build/' + dir + '/js/app.js'])
            .pipe(concat('bundle'))
            .pipe(rename({extname: '.js'}))
            .pipe(gulp.dest('build/' + dir + '/js'));
        tasks.push(task);

        var taskProd = gulp.src(['build/' + dir + '/js/template.js', 'build/' + dir + '/js/app.min.js'])
            .pipe(concat('bundle'))
            .pipe(rename({extname: '.min.js'}))
            .pipe(gulp.dest('build/' + dir + '/js'));
        tasks.push(taskProd);
    }

    tasks.push(
        gulp.src(['build/core-template'], {read: false})
            .pipe(clean({force: true}))
    );

    return merge.apply(null, tasks);
});


// 编译stylus
gulp.task('build-sass', ['clean-build'], function () {
    var tasks = [];

    for (var i in apps) {
        var dir = apps[i];
        var task = gulp.src(['core/sass/*.scss', 'app/' + dir + '/**/**/*.scss'])
            .pipe(sass())
            .pipe(concat('style'))
            .pipe(rename({extname: '.css'}))
            .pipe(gulp.dest('build/' + dir + '/css'));
        tasks.push(task);

        var taskProd = gulp.src(['core/sass/*.scss', 'app/' + dir + '/**/*.scss'])
            .pipe(sass())
            .pipe(concat('style'))
            .pipe(rename({extname: '.min.css'}))
            .pipe(gulp.dest('build/' + dir + '/css'));
        tasks.push(taskProd);
    }

    return merge.apply(null, tasks);
});

// 复制app下的img到build目录
gulp.task('copy-image', ['clean-build'], function () {
    var tasks = [];

    for (var i in pages) {
        var page = pages[i];
        var appName = page['name'];

        var last = page['path'].lastIndexOf('/');
        var path = page['path'].substr(0, last);
        var task = gulp.src(['app/' + path + '/img/**', 'core/img/**'])
            .pipe(gulp.dest('build/' + appName + '/img/'));
        tasks.push(task);
    }

    return merge.apply(null, tasks);
});

// 编译html
gulp.task('build-html', ['clean-build', 'build-sass', 'build-js-bundle', 'copy-image'], function () {
    var tasks = [];

    for (var i in pages) {
        var page = pages[i];
        var layout = page.layout ? page.layout : 'mui';
        var name = page.name;
        var title = page.title;
        var file = page.file;
        var path = page.path ? page.path : '';

        var layoutMapping = {
            'mui-map': {
                libCss: ['asset/mui/css/bundle.min.css', 'asset/mui/css/bundle.min.css'],
                libJs: ['asset/mui/js/bundle.min.js', 'asset/mui/js/bundle.min.js'],
                appCss: [name + '/css/style.css', name + '/css/style.min.css'],
                appJs: [name + '/js/bundle.js', name + '/js/bundle.min.js']
            },
            'mui': {
                libCss: ['asset/mui/css/bundle.min.css', 'asset/mui/css/bundle.min.css'],
                libJs: ['asset/mui/js/bundle.min.js', 'asset/mui/js/bundle.min.js'],
                appCss: [name + '/css/style.css', name + '/css/style.min.css'],
                appJs: [name + '/js/bundle.js', name + '/js/bundle.min.js']
            },
            'inspinia-demo': {
                libCss: ['css/bundle.min.css', 'css/bundle.min.css'],
                libJs: ['js/bundle.min.js', 'js/bundle.min.js'],
                appCss: [name + '/css/style.css', name + '/css/style.min.css'],
                appJs: [name + '/js/bundle.js', name + '/js/bundle.min.js']
            }
        };

        var pageContent = fs.readFileSync('app/' + path + '.html', "utf-8");
        if (layout == 'dialog') {
            var task = gulp.src(['core/layout/' + layout + '.html'])
                .pipe(replace('@page-content', pageContent))
                .pipe(isProd ? minifyHTML() : empty())
                .pipe(rename(file))
                .pipe(gulp.dest('build/'));
            tasks.push(task);
        } else {
            var libCss = isProd ? layoutMapping[layout].libCss[1] : layoutMapping[layout].libCss[0];
            var libJs = isProd ? layoutMapping[layout].libJs[1] : layoutMapping[layout].libJs[0];
            var appCss = isProd ? layoutMapping[layout].appCss[1] : layoutMapping[layout].appCss[0];
            var appJs = isProd ? layoutMapping[layout].appJs[1] : layoutMapping[layout].appJs[0];
            var taskProd = gulp.src(['core/layout/' + layout + '.html'])
                .pipe(replace('@title', title))
                .pipe(replace('@lib-css', libCss))
                .pipe(replace('@app-css', appCss))
                .pipe(replace('@lib-js', libJs))
                .pipe(replace('@app-js', appJs))
                .pipe(replace('@page-content', pageContent))
                .pipe(isProd ? minifyHTML() : empty())
                .pipe(rename(file))
                .pipe(gulp.dest('build/'));
            tasks.push(taskProd);
        }

    }

    return merge.apply(null, tasks);
});


gulp.task('init-tabs', ['build-html'], function () {
    var carContent = fs.readFileSync('app/main/car/main.html', "utf-8");
    var ridingContent = fs.readFileSync('app/main/riding/list.html', "utf-8");
    var settingContent = fs.readFileSync('app/main/setting/main.html', "utf-8");
    var userContent = fs.readFileSync('app/main/user/main.html', "utf-8");
    var task = gulp.src(['build/main.main.html'])
        .pipe(replace('@car-page', carContent))
        .pipe(replace('@riding-page', ridingContent))
        .pipe(replace('@setting-page', settingContent))
        .pipe(replace('@user-page', userContent))
        .pipe(gulp.dest('build/'));
    return merge(task);

});

// 给build目录下各app目录的css以及js文件打版本,准备生成发布版
gulp.task('rev', ['default', 'clean-dist'], function () {
    return gulp.src(['build/**/*'])
        //.pipe(rev())
        .pipe(gulp.dest('dist/'))
    //.pipe(rev.manifest())
    //.pipe(gulp.dest('build/'))
});

// 生成发布版的html,各静态资源带版本号
gulp.task('rev-replace', ["rev", 'clean-dist'], function () {
    var manifest = gulp.src('build/rev-manifest.json');

    return gulp.src(['build/*.html'])
        //.pipe(revReplace({manifest: manifest}))
        .pipe(gulp.dest('dist/'))
});

// 压缩图片
gulp.task('imagemin', ['rev-replace', 'rev-replace'], function () {
    var tasks = [];

    for (var i in apps) {
        var dir = apps[i];
        var task = gulp.src('app/' + dir + '/img/**')
            .pipe(imagemin({
                progressive: true,
                svgoPlugins: [{removeViewBox: false}],
                use: [pngquant()]
            }))
            .pipe(gulp.dest('dist/' + dir + '/img/'));
        tasks.push(task);

        if (isProd) {
            var compressTask = gulp.src('dist/' + dir + '/img/**')
                .pipe(imagemin({
                    progressive: true,
                    svgoPlugins: [{removeViewBox: false}],
                    use: [pngquant()]
                }))
                .pipe(gulp.dest('dist/' + dir + '/img/'));
            tasks.push(compressTask);
        }
    }

    return merge.apply(null, tasks);
});

gulp.task('default', [
    'clean-build',
    'concat-mui',
    'build-angular-template-core',
    'build-angular-template',
    'concat-angular-template',
    'build-js',
    'build-js-bundle',
    'build-sass',
    'copy-image',
    'build-html',
    'init-tabs'
]);

gulp.task('build', ['default']);

gulp.task('release', [
    //'set-prod-true',
    'clean-dist',
    'concat-mui',
    'build-angular-template-core',
    'build-angular-template',
    'concat-angular-template',
    'build-js',
    'build-js-bundle',
    'build-sass',
    'copy-image',
    'build-html',
    'rev',
    'rev-replace',
    'imagemin'
]);

gulp.task('watch', function () {
    var jsWatcher = gulp.watch(['app/**/*.js', 'app/**/template/**/*.js', 'core/js/*.js'], ['default']);
    jsWatcher.on('change', function (event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });

    var htmlWatcher = gulp.watch(['app/**/template/**/*.html', 'app/**/*.html', 'core/**/*.html'], ['default']);
    htmlWatcher.on('change', function (event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });

    var cssWatcher = gulp.watch(['app/**/*.scss', 'app/**/template/**/*.scss', 'core/sass/*.scss'], ['default']);
    cssWatcher.on('change', function (event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });
});

gulp.task('sync', function () {
    browserSync.init({
        server: "./build",
        open: false
    });
});

gulp.task('sync-dist', function () {
    browserSync.init({
        server: "./dist",
        open: false
    });
});
