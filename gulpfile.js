    // Application basePaths
var basePaths = {
        src: 'static/',
        dest: 'static/dist/'
    },
    // Application paths
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
    },
    // Define names of third-party dependencies
    libs = {
        vendor: {
            /* -----------------------------------------------------
             * core js libs - present on every site page, these will
             * be concatenated in order into vendor.js
             * -------------------------------------------------- */
            core: {
                jquery: {
                    name: 'jquery'
                }
            },
            /* -----------------------------------------------------
             * ie8- js libs - present on every site page, thse will
             * be concatenated in order into ie8.js
             * -------------------------------------------------- */
            ie8: {
                html5shiv: {
                    name: 'html5shiv'
                },
                respond: {
                    name: 'respond'
                }
            }
        }
    };

var gulp = require('gulp'),
    $ = require('gulp-load-plugins')({
        pattern: '*',
        camelize: true
    }),
    path = require('path'),
    browserSync = $.browserSync.create(),
    flags       = require('minimist')(process.argv.slice(2)),
    isNotify    = flags.notify || false,
    copyFiles   = {
        scripts: []
    };

/* CSS - LESS */
function processCss(inputStream, taskType) {
    return inputStream
        .pipe($.plumber(function (error) {
            $.util.log($.util.colors.red('Error (' + error.plugin + '): ' + error.message + '\n'));
            this.emit('end');
        }))
        .pipe($.newer(paths.styles.dest))
        .pipe($.less({ paths: [path.join(__dirname, 'less', 'includes')] }))
        .pipe($.sourcemaps.init())
            .pipe($.minifyCss({ advanced: false }))
            .pipe($.rename({ suffix: '.min' }))
        .pipe($.sourcemaps.write('./', { includeContent: true }))
        .pipe(gulp.dest(paths.styles.dest))
        .pipe(browserSync.stream())
        .pipe($.if(flags.notify, $.notify({ message: taskType + ' task complete' })));
}

/*
 * Accepts a gulp stream, gulp-uglify options, filename
 * - Concat stream content, minify and write to JS src/dest
 */
function minifyJS (sourceStream, uglifyOptions, filename) {
    return sourceStream
        .pipe($.plumber(function (error) {
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

/*
 * Generates a glob pattern from a list of matched vendor libs as
 * defined in libs
 */
function getLibsGlob (libName) {
    // 1. Set up empty libs array
    var libArray = [];

    // 2. loop through vendor libs in libName collection
    for (var lib in libs.vendor[libName]) {
        // jic, prevent looping through the object's prototype
        if (libs.vendor[libName].hasOwnProperty(lib)) {
            // 2a. get lib.name
            var thisLib = libs.vendor[libName][lib];
            // 2b. push to libsArray in order
            libArray.push(thisLib.name);
        }
    }

    // 3. join array, surround in glob brackets, ensure string
    if (libArray.length > 1) {
        return ('{' + libArray.join(',') + '}/**/*').toString();
    } else if (libArray.length === 1) {
        /* 3b. but there's no need to return a multi-glob if there's
         * only one lib */
        return (libArray[0] + '/**/*').toString();
    }

} // /function getLibsGlob

gulp.task('styles', ['bower:css', 'less']);
gulp.task('less', ['bower:css'], function () {
    return processCss(gulp.src(paths.styles.src + 'styles.less'), 'Styles');
});

/* JS */
gulp.task('scripts', ['scripts:moveFiles'], function () {
  return gulp.src(paths.scripts.src + 'app/*.js')
    .pipe($.plumber(function (error) {
        $.util.log($.util.colors.red('Error (' + error.plugin + '): ' + error.message));
        this.emit('end');
    }))
    .pipe($.bytediff.start())
    .pipe($.newer(paths.scripts.dest))
    .pipe($.jshint('.jshintrc'))
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.concat('app.js'))
    .pipe($.sourcemaps.init())
        .pipe($.uglify())
        .pipe($.rename({suffix: '.min'}))
        .pipe($.bytediff.stop())
    .pipe($.sourcemaps.write('./', { includeContent: true }))
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(browserSync.stream())
    .pipe($.if(flags.notify, $.notify({ message: 'Scripts task complete' })));
});

/* Move JS files that are already minified to dist/js/ folder */
gulp.task('scripts:moveFiles', function () {
    gulp.src(copyFiles.scripts, { base: './static/js/' })
    .pipe(gulp.dest(paths.scripts.dest));
});

/* Images */
gulp.task('images', function () {
  return gulp.src(paths.images.src + '**/*')
    .pipe($.plumber(function (error) {
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
gulp.task('bower:js', function () {
    // Grab the main bower files
    // -------------------------------------------------------------
    var bowerStream = gulp.src($.mainBowerFiles(
        { filter: '**/*.js' }
    ), { base: paths.bower.src });

    /* -------------------------------------------------------------
     * Return merged, minified JS streams
     * ---------------------------------------------------------- */
    return $.mergeStream(
        minifyJS(
            bowerStream.pipe($.filter(getLibsGlob('core'))),
            {
                mangle: {
                    except: ['jQuery'],
                    keep_fnames: true
                },
                preserveComments: 'license'
            },
            'vendor.js'
        ),
        // IE8 JS stream
        minifyJS(
            bowerStream.pipe($.filter(getLibsGlob('ie8'))),
            {
                mangle: { keep_fnames: true },
                preserveComments: 'license'
            },
            'ie8.js'
        )
    );
}); // /bower:js

/*
 * Grab main bower files CSS, chuck them exactly where we specify
 */
gulp.task('bower:css', function () {
    // Grab the main bower files
    // -------------------------------------------------------------
    var bowerStream = gulp.src($.mainBowerFiles(
        {
            filter: '**/*.css'
        }
    ), { base: paths.bower.src });

    // Filters
    // -------------------------------------------------------------
    var filterNormalizeCss = 'normalize-css/**/*';

    // Vendor streams - process each library separately
    // -------------------------------------------------------------
    // normalize-css
    var streamNormalizeCss = bowerStream
        .pipe($.filter(filterNormalizeCss));

    // Return vendor CSS stream, for all other 3rd-party CSS
    return $.streamqueue({ objectMode: true }, streamNormalizeCss)
        .pipe($.plumber())
        .pipe($.concat('vendor.css'))
        .pipe(gulp.dest(paths.styles.vendor.src))
        .pipe($.sourcemaps.init())
            .pipe($.minifyCss({ advanced: false }))
            .pipe($.rename({ suffix: '.min' }))
        .pipe($.sourcemaps.write('./', { includeContent: true }))
        .pipe(gulp.dest(paths.styles.dest));
}); // /bower:css

/* BrowserSync */
gulp.task('browser-sync', ['bower:js', 'styles', 'scripts', 'images'], function () {
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
    gulp.watch(paths.scripts.src + 'app/*.js', ['scripts']);
    gulp.watch(paths.images.src + '**/*', ['images']);
    gulp.watch(paths.templates.src + '*.html').on('change', browserSync.reload);
});

gulp.task('clear', function (done) {
  return $.cache.clearAll(done);
});

/* Clean up stray files */
gulp.task('clean', ['clear'], function (cb) {
    $.del([paths.styles.dest, paths.scripts.dest, paths.images.dest], cb);
});

/* Default task */
gulp.task('default', ['clean'], function () {
    gulp.start('browser-sync');
});
