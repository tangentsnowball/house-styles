var basePaths = {
        src: 'static/',
        dest: 'static/dist/'
    },
    paths = {
        images: {
            src: basePaths.src + 'img/',
            dest: basePaths.dest + 'img/'
        },
        scripts: {
            src: basePaths.src + 'js/',
            dest: basePaths.dest + 'js/'
        },
        styles: {
            src: basePaths.src + 'less/',
            dest: basePaths.dest + 'css/'
        },
        templates: {
            src: basePaths.src + '',
            dest: basePaths.dest + ''
        }
    };

var gulp = require('gulp'),
    $ = require('gulp-load-plugins')({
        pattern: '*',
        camelize: true
    }),
    browserSync = $.browserSync.create(),
    copyFiles = {
        scripts: []
    };

/* CSS - LESS */
function processCss(inputStream, taskType) {
    return inputStream
        .pipe($.plumber(function(error) {
            $.util.log($.util.colors.red('Error (' + error.plugin + '): ' + error.message));
            this.emit('end');
        }))
        .pipe($.newer(paths.styles.dest))
        .pipe($.less({ paths: [$.path.join(__dirname, 'less', 'includes')] }))
        .pipe($.sourcemaps.init())
            .pipe($.minifyCss({ advanced: false }))
            .pipe($.rename({ suffix: '.min' }))
        .pipe($.sourcemaps.write('./', { includeContent: false }))
        .pipe(gulp.dest(paths.styles.dest))
        .pipe(browserSync.stream())
        .pipe($.notify({ message: taskType + ' task complete' }));
}

gulp.task('styles', ['less:main', 'less:responsive']);
gulp.task('less:main', function() {
    return processCss(gulp.src(paths.styles.src + 'styles.less'), 'Styles');
});
gulp.task('less:responsive', function() {
    return processCss(gulp.src(paths.styles.src + 'styles-responsive.less'), 'Responsive styles');
});

/* JS */
gulp.task('scripts', ['scripts:moveFiles'], function() {
  return gulp.src(paths.scripts.src + '*.js')
    .pipe($.plumber(function(error) {
        $.util.log($.util.colors.red('Error (' + error.plugin + '): ' + error.message));
        this.emit('end');
    }))
    .pipe($.bytediff.start())
    .pipe($.newer(paths.scripts.dest))
    .pipe($.jshint('.jshintrc'))
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.concat('main.js'))
    .pipe($.sourcemaps.init())
        .pipe($.uglify())
        .pipe($.rename({suffix: '.min'}))
        .pipe($.bytediff.stop())
    .pipe($.sourcemaps.write('./', { includeContent: false }))
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(browserSync.stream())
    .pipe($.notify({ message: 'Scripts task complete' }));
});

/* Move JS files that are already minified to dist/js/ folder */
gulp.task('scripts:moveFiles', function() {
    gulp.src(copyFiles.scripts, { base: './static/js/' })
    .pipe(gulp.dest(paths.scripts.dest));
});

/* Images */
gulp.task('images', function() {
  return gulp.src(paths.images.src + '**/*')
    .pipe($.plumber(function(error) {
        $.util.log($.util.colors.red('Error (' + error.plugin + '): ' + error.message));
        this.emit('end');
    }))
    .pipe($.bytediff.start())
    .pipe($.newer(paths.images.dest))
    .pipe($.cache($.imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe($.bytediff.stop())
    .pipe(gulp.dest(paths.images.dest))
    .pipe(browserSync.stream())
    .pipe($.notify({ message: 'Images task complete' }));
});

/* BrowserSync */
gulp.task('browser-sync', ['styles', 'scripts', 'images'], function() {
    browserSync.init({
        server: {
            baseDir: "./"
        }
        //Use if you don't want BS to open a tab in your browser when it starts up
        //open: false
        // Will not attempt to determine your network status, assumes you're OFFLINE
        //online: false
    });

    gulp.watch(paths.styles.src + '*.less', ['styles']);
    gulp.watch(paths.scripts.src + '*.js', ['scripts']);
    gulp.watch(paths.images.src + '**/*', ['images']);
    gulp.watch(paths.templates.src + '*.html').on('change', browserSync.reload);
});

gulp.task('clear', function (done) {
  return $.cache.clearAll(done);
});

/* Clean up stray files */
gulp.task('clean', ['clear'], function(cb) {
    $.del([paths.styles.dest, paths.scripts.dest, paths.images.dest], cb)
});


/* Default task */
gulp.task('default', ['clean'], function() {
    gulp.start('browser-sync');
});
