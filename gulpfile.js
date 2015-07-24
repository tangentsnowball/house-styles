var gulp = require('gulp'),
    plugins = require('gulp-load-plugins')({
        pattern: '*',
        camelize: true
    }),
    browserSync = plugins.browserSync.create();

/* CSS - LESS */
function processCss(inputStream, taskType) {
    return inputStream
        .pipe(plugins.plumber())
        .pipe(plugins.less({ paths: [plugins.path.join(__dirname, 'less', 'includes')] }))
        .pipe(plugins.rename({suffix: '.min'}))
        .pipe(plugins.minifyCss())
        .pipe(gulp.dest('static/dist/css/'))
        .pipe(browserSync.stream())
        .pipe(plugins.notify({ message: taskType + ' task complete' }));
}

gulp.task('styles', ['less:main', 'less:responsive']);
gulp.task('less:main', function() {
    return processCss(gulp.src('static/css/less/styles.less'), 'Styles');
});
gulp.task('less:responsive', function() {
    return processCss(gulp.src('static/css/less/styles-responsive.less'), 'Responsive styles');
});

/* JS */
gulp.task('scripts', function() {
  return gulp.src('static/js/*.js')
    .pipe(plugins.plumber())
    .pipe(plugins.jshint('.jshintrc'))
    .pipe(plugins.jshint.reporter('default'))
    .pipe(plugins.concat('main.js'))
    .pipe(plugins.rename({suffix: '.min'}))
    .pipe(plugins.uglify())
    .pipe(gulp.dest('static/dist/js'))
    .pipe(browserSync.stream())
    .pipe(plugins.notify({ message: 'Scripts task complete' }));
});

/* Images */
gulp.task('images', function() {
  return gulp.src('static/img/**/*')
    .pipe(plugins.plumber())
    .pipe(plugins.cache(plugins.imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(gulp.dest('static/dist/img'))
    .pipe(browserSync.stream())
    .pipe(plugins.notify({ message: 'Images task complete' }));
});

/* BrowserSync */
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./"
        }
        //Use if you don't want BS to open a tab in your browser when it starts up
        //open: false
        // Will not attempt to determine your network status, assumes you're OFFLINE
        //online: false
    });

    gulp.watch('static/css/less/*.less', ['styles']);
    gulp.watch('static/js/*.js', ['scripts']);
    gulp.watch('static/img/**/*', ['images']);
    gulp.watch('*.html').on('change', browserSync.reload);
});

/* Clean up stray files */
gulp.task('clean', function(cb) {
    plugins.del(['static/dist/css', 'static/dist/js', 'static/dist/img'], cb)
});


/* Default task */
gulp.task('default', ['clean'], function() {
    gulp.start('styles', 'scripts', 'images', 'browser-sync');
});
