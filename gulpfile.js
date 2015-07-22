var gulp = require('gulp'),
    less = require('gulp-less'),
    path = require('path'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    livereload = require('gulp-livereload'),
    del = require('del'),
    browserSync = require('browser-sync').create();

/* CSS - LESS */
gulp.task('styles', ['less:main', 'less:responsive']);
gulp.task('less:main', function() {
    return gulp.src('static/css/less/styles.less')
        .pipe(less({ paths: [path.join(__dirname, 'less', 'includes')] }))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifycss())
        .pipe(gulp.dest('static/dist/css/'))
        .pipe(browserSync.stream())
        .pipe(notify({ message: 'Styles task complete' }));
});
gulp.task('less:responsive', function() {
    return gulp.src('static/css/less/styles-responsive.less')
        .pipe(less({ paths: [path.join(__dirname, 'less', 'includes')] }))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifycss())
        .pipe(gulp.dest('static/dist/css/'))
        .pipe(browserSync.stream())
        .pipe(notify({ message: 'Responsive styles task complete' }));
});

/* JS */
gulp.task('scripts', function() {
  return gulp.src('static/js/**/*.js')
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    .pipe(concat('main.js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('static/dist/js'))
    .pipe(browserSync.stream())
    .pipe(notify({ message: 'Scripts task complete' }));
});

/* Images */
gulp.task('images', function() {
  return gulp.src('static/img/**/*')
    .pipe(imagemin({ optimizationLevel: 1, progressive: true, interlaced: true }))
    .pipe(gulp.dest('static/dist/img'))
    .pipe(browserSync.stream())
    .pipe(notify({ message: 'Images task complete' }));
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
    gulp.watch('static/js/**/*.js', ['scripts']);
    gulp.watch('static/img/**/*', ['images']);
    gulp.watch('*.html').on('change', browserSync.reload);
});

/* Clean up stray files */
gulp.task('clean', function(cb) {
    del(['static/dist/css', 'static/dist/js', 'static/dist/img'], cb)
});


/* Default task */
gulp.task('default', ['clean'], function() {
    gulp.start('styles', 'scripts', 'images', 'browser-sync');
});
