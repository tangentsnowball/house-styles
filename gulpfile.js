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
            dest: basePaths.dest + 'css/',
            vendor: {
                src: basePaths.src + 'css/',
                dest: basePaths.dest + 'css/'
            }
        },
        templates: {
            src: basePaths.src + '',
            dest: basePaths.dest + ''
        },
        bower: {
            src: './bower_components/'
        }
    };

var gulp = require('gulp'),
    $ = require('gulp-load-plugins')({
        pattern: '*',
        camelize: true
    }),
    browserSync = $.browserSync.create(),
    flags       = require('minimist')(process.argv.slice(2)),
    isNotify    = flags.notify || false,
    copyFiles   = {
        scripts: []
    };

/* CSS - LESS */
function processCss(inputStream, filename, taskType) {
    // Grab vendor CSS
    var vendorStream = gulp.src(paths.styles.vendor.src + '*.css')
        .pipe($.plumber(function(error) {
            $.util.log($.util.colors.red('Error (' + error.plugin + '): ' + error.message));
            this.emit('end');
        }));

    // Compile LESS stream
    inputStream = inputStream
        .pipe($.plumber(function(error) {
            $.util.log($.util.colors.red('Error (' + error.plugin + '): ' + error.message + '\n'));
            this.emit('end');
        }))
        .pipe($.newer(paths.styles.dest))
        .pipe($.less({ paths: [$.path.join(__dirname, 'less', 'includes')] }));

    // Merge vendor css with compiled LESS streams
    return $.mergeStream(vendorStream, inputStream)
        // concat into supplied filename
        .pipe($.concat(filename))
        .pipe(gulp.dest(paths.styles.dest))
        .pipe($.minifyCss({ advanced: false }))
        .pipe($.rename({ suffix: '.min' }))
        .pipe(gulp.dest(paths.styles.dest))
        .pipe(browserSync.stream())
        .pipe($.if(flags.notify, $.notify({ message: 'Images task complete' })));
}

/*
 * Accepts a gulp stream, gulp-uglify options, filename
 * - Concat stream content, minify and write to JS src/dest
 */
function minifyJS (sourceStream, uglifyOptions, filename) {
    return sourceStream
        .pipe($.plumber(function(error) {
            $.util.log($.util.colors.red('Error (' + error.plugin + '): ' + error.message));
            this.emit('end');
        }))
        .pipe($.concat(filename))
        .pipe(gulp.dest(paths.scripts.src))
        // Minify with safe mangling, preserve licenses
        .pipe($.uglify(uglifyOptions))
        .pipe($.rename({ suffix: '.min' }))
        .pipe(gulp.dest(paths.scripts.dest));
} // /function minifyJS

gulp.task('styles', ['bower:css', 'less:main', 'less:responsive']);
gulp.task('less:main', ['bower:css'], function() {
    return processCss(gulp.src(paths.styles.src + 'styles.less'), 'styles.css', 'Styles');
});
gulp.task('less:responsive', ['bower:css'], function() {
    return processCss(gulp.src(paths.styles.src + 'styles-responsive.less'), 'styles-responsive.css', 'Responsive styles');
});

/* JS */
gulp.task('scripts', ['scripts:moveFiles'], function() {
  return gulp.src(paths.scripts.src + 'main.js')
    .pipe($.plumber(function(error) {
        $.util.log($.util.colors.red('Error (' + error.plugin + '): ' + error.message));
        this.emit('end');
    }))
    .pipe($.bytediff.start())
    .pipe($.newer(paths.scripts.dest))
    .pipe($.jshint('.jshintrc'))
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.rename({suffix: '.min'}))
    .pipe($.uglify())
    .pipe($.bytediff.stop())
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(browserSync.stream())
    .pipe($.if(flags.notify, $.notify({ message: 'Images task complete' })));
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
    .pipe($.if(flags.notify, $.notify({ message: 'Images task complete' })));
});

/*
 * Grab main bower files JS, chuck them exactly where we specify
 */
gulp.task('bower:js', function() {
    // Grab the main bower files
    // -------------------------------------------------------------
    var bowerFiles = gulp.src($.mainBowerFiles({ filter: '**/*.js' }), { base: paths.bower.src });

    // Filters
    // -------------------------------------------------------------
    var filterHtml5shiv    = 'html5shiv/**/*',
        filterJquery       = 'jquery/**/*',
        filterRespond      = 'respond/**/*';

    // Vendor streams - process each library separately
    // -------------------------------------------------------------
        // html5shiv
    var streamHtml5shiv = bowerFiles
            .pipe($.filter(filterHtml5shiv)),
        // Respond
        streamRespond = bowerFiles
            .pipe($.filter(filterRespond)),
        // jQuery
        streamJquery = bowerFiles
            .pipe($.filter(filterJquery));

    // Package streams - group certain libs into single packages
    // -------------------------------------------------------------
    // IE8 JS stream
    var streamIE8JS = minifyJS($.streamqueue({ objectMode: true }, streamHtml5shiv, streamRespond), {
                mangle: { keep_fnames: true },
                preserveComments: 'license'
            }, 'ie8.js' ),
    // Vendor JS stream, for all other 3rd-party JS
        streamVendorJS = minifyJS($.streamqueue({ objectMode: true }, streamJquery), {
            mangle: {
                except: ['jQuery'],
                keep_fnames: true
            },
            preserveComments: 'license'
        }, 'vendor.js' );

    /* return merged 'completed' streams to allow the task to
     * register as done once all streams resolve
     * ----------------------------------------------------------- */
    return $.mergeStream(streamVendorJS, streamIE8JS);
}); // /bower:js

/*
 * Grab main bower files CSS, chuck them exactly where we specify
 */
gulp.task('bower:css', function() {
    // Grab the main bower files
    // -------------------------------------------------------------
    var bowerFiles = gulp.src($.mainBowerFiles({ filter: '**/*.css' }), { base: paths.bower.src });

    // Filters
    // -------------------------------------------------------------
    var filterNormalizeCss = 'normalize-css/**/*';

    // Vendor streams - process each library separately
    // -------------------------------------------------------------
        // normalize-css
    var streamNormalizeCss = bowerFiles
            .pipe($.filter(filterNormalizeCss));

    // Package streams - group certain libs into single packages
    // -------------------------------------------------------------

    // Return vendor CSS stream, for all other 3rd-party CSS
    return $.mergeStream(streamNormalizeCss)
        .pipe($.plumber())
        .pipe($.concat('vendor.css'))
        .pipe(gulp.dest(paths.styles.vendor.src));
}); // /bower:css

/* BrowserSync */
gulp.task('browser-sync', ['bower:js', 'styles', 'scripts', 'images'], function() {
    browserSync.init({
        server: {
            baseDir: './'
        },
        // Proxy for when wrapping around a project's VM devserver
        // proxy: 'localhost:8888'
        // Use if you don't want BS to open a tab in your browser when it starts up
        open: false
        // Will not attempt to determine your network status, assumes you're OFFLINE
        // online: false
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
    $.del([paths.styles.dest, paths.scripts.dest, paths.images.dest], cb);
});

/* Default task */
gulp.task('default', ['clean'], function() {
    gulp.start('browser-sync');
});
