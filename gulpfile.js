/* -----------------------------------------------------------------
 * Tangent Snowball - House Styles Gulpfile
 * -------------------------------------------------------------- */

// Global Vars
// -------------------------------------------------------------------------------------------------
    // Base app paths
var basePaths = {
        src: 'static/',
        dest: 'static/dist/'
    },
    // File paths
    paths = {
        images: {
            src: basePaths.src   + 'img/',
            dest: basePaths.dest + 'img/'
        },
        scripts: {
            core:   {
                src:  basePaths.src  + 'js/app/',
                dest: basePaths.dest + 'js/'
            },
            vendor: {
                src:  basePaths.src  + 'js/vendor/',
                dest: basePaths.dest + 'js/vendor/'
            }
        },
        styles: {
            core:   {
                src:  basePaths.src  + 'less/',
                dest: basePaths.dest + 'css/'
            },
            vendor: {
                src:  basePaths.src  + 'css/vendor/',
                dest: basePaths.dest + 'css/vendor/'
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
            /* -------------------------------------------------------------------------------------
             * core js libs - present on every site page, these will be concatenated in order into
             * vendor.js
             * ---------------------------------------------------------------------------------- */
            core: {
                jquery: {
                    name: 'jquery'
                }
            },
            /* -------------------------------------------------------------------------------------
             * ie8- js libs - present on every site page, thse will be concatenated in order into
             * ie8.js
             * ---------------------------------------------------------------------------------- */
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

// Load Node/Gulp plugins
// -------------------------------------------------------------------------------------------------
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

/* -------------------------------------------------------------------------------------------------
 * processCss
 * Accepts: a stream upon which to perform gulp stuff, and a message to display
 * Returns: the processed stream
 * ---------------------------------------------------------------------------------------------- */
function processCss(inputStream, taskType) {
    return inputStream
        .pipe($.plumber(function (error) {
            $.util.log($.util.colors.red('Error (' + error.plugin + '): ' + error.message + '\n'));
            this.emit('end');
        }))
        .pipe($.newer(paths.styles.core.dest))
        .pipe($.less({ paths: [path.join(__dirname, 'less', 'includes')] }))
        .pipe($.sourcemaps.init())
            .pipe($.minifyCss({ advanced: false }))
            .pipe($.rename({ suffix: '.min' }))
        .pipe($.sourcemaps.write('./', { includeContent: true }))
        .pipe(gulp.dest(paths.styles.core.dest))
        .pipe(browserSync.stream())
        .pipe($.if(flags.notify, $.notify({ message: taskType + ' task complete' })));
} // /function processCss

/* -------------------------------------------------------------------------------------------------
 * minifyJS
 * Accepts: a gulp stream, gulp-uglify options, libType, filename
 * Returns: the processed stream
 * Concat stream content, minify using options and write to JS src/dest using filename
 * ---------------------------------------------------------------------------------------------- */
function minifyJS (sourceStream, uglifyOptions, libType, filename) {
    return sourceStream
        .pipe($.plumber(function (error) {
            $.util.log($.util.colors.red('Error (' + error.plugin + '): ' + error.message));
            this.emit('end');
        }))
        .pipe($.concat(filename))
        .pipe(gulp.dest(paths.scripts[libType].src))
        // Minify with safe mangling, preserve licenses
        .pipe($.uglify(uglifyOptions))
        .pipe($.rename({ suffix: '.min' }))
        .pipe(gulp.dest(paths.scripts[libType].dest));
} // /function minifyJS

/* -------------------------------------------------------------------------------------------------
 * getLibsGlob
 * Accepts: either a single or an array of lib collection names
 * Returns: a glob pattern string
 * Generates a glob pattern from the lib collection name of vendor libs, as defined in libs.vendor.
 * Can also accept an array of lib collection names - e.g. ['ie8', 'core']
 * ---------------------------------------------------------------------------------------------- */
function getLibsGlob (libCol) {
    // 1. Set up empty libs array
    var libArray = [],
        libColIsArray  = (libCol.constructor === Array);

    function pushLibsToArray (name) {
        // 2. loop through libs.vendor using name as selector
        for (var lib in libs.vendor[name]) {
            // jic, prevent looping through the object's prototype
            if (libs.vendor[name].hasOwnProperty(lib)) {
                // 2a. get lib.name
                var thisLib = libs.vendor[name][lib];
                // 2b. push to libsArray in order
                libArray.push(thisLib.name);
            } // /if...
        } // /for...
    } // /function pushLibsToArray

    /* 2. If libCol is an array of lib collection names, loop through and push each name to
    * libArray for each collection */
    if (libColIsArray) {
        for (var c in libCol) {
            var thisLibCol = libCol[c];
            pushLibsToArray(thisLibCol);
        } // /for...
    } else {
        // otherwise, just use libCol as-is
        pushLibsToArray(libCol);
    } // /if...

    // 3. join array, surround in glob brackets, ensure string
    if (libArray.length > 1) {
        return ('{' + libArray.join(',') + '}/**/*').toString();
    } else if (libArray.length === 1) {
        // 3b. but there's no need to return a multi-glob if there's only one lib
        return (libArray[0] + '/**/*').toString();
    } // /if...
} // /function getLibsGlob

/* -------------------------------------------------------------------------------------------------
 * Task - styles
 * Handles processing of LESS files
 * ---------------------------------------------------------------------------------------------- */
gulp.task('styles', function () {
    return processCss(gulp.src(paths.styles.core.src + 'styles.less'), 'Styles');
}); // /gulp.task('styles'...

/* -------------------------------------------------------------------------------------------------
 * Task - scripts
 * Concatenates application js (anything in paths.scripts.core.src), generates sourcemaps, minifies
 * ---------------------------------------------------------------------------------------------- */
gulp.task('scripts', ['scripts:moveFiles'], function () {
  return gulp.src(paths.scripts.core.src + '*.js')
    .pipe($.plumber(function (error) {
        $.util.log($.util.colors.red('Error (' + error.plugin + '): ' + error.message));
        this.emit('end');
    }))
    .pipe($.bytediff.start())
    .pipe($.newer(paths.scripts.core.dest))
    .pipe($.jshint('.jshintrc'))
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.concat('app.js'))
    .pipe($.sourcemaps.init())
        .pipe($.uglify())
        .pipe($.rename({suffix: '.min'}))
        .pipe($.bytediff.stop())
    .pipe($.sourcemaps.write('./', { includeContent: true }))
    .pipe(gulp.dest(paths.scripts.core.dest))
    .pipe(browserSync.stream())
    .pipe($.if(flags.notify, $.notify({ message: 'Scripts task complete' })));
}); // /gulp.task('scripts'...

/* Move JS files that are already minified to dist/js/ folder */
gulp.task('scripts:moveFiles', function () {
    gulp.src(copyFiles.scripts, { base: './static/js/' })
    .pipe(gulp.dest(paths.scripts.core.dest));
}); // /gulp.task('scripts:moveFiles'...

/* -------------------------------------------------------------------------------------------------
 * Task - images
 * Uses imagemin to optimise images losslessly
 * ---------------------------------------------------------------------------------------------- */
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
}); // /gulp.task('images'...

/* -------------------------------------------------------------------------------------------------
 * Task - bower:js
 * Handles concatenation and movement of bower JS packages
 * ---------------------------------------------------------------------------------------------- */
gulp.task('bower:js', function () {
    // Grab the main bower files
    // ---------------------------------------------------------------------------------------------
    var bowerStream = gulp.src($.mainBowerFiles(
        { filter: '**/*.js' }
    ), { base: paths.bower.src });

    /* ---------------------------------------------------------------------------------------------
     * Return merged, minified JS streams
     * ------------------------------------------------------------------------------------------ */
    return $.mergeStream(
        // Core vendor libs - present site-wide
        minifyJS(
            bowerStream.pipe($.filter(getLibsGlob('core'))),
            {
                mangle: {
                    except: ['jQuery'],
                    keep_fnames: true
                },
                preserveComments: 'license'
            },
            'vendor',
            'core.js'
        ),
        // IE8 JS stream - present site-wide for IE8- only
        minifyJS(
            bowerStream.pipe($.filter(getLibsGlob('ie8'))),
            {
                mangle: { keep_fnames: true },
                preserveComments: 'license'
            },
            'vendor',
            'ie8.js'
        )
        // Everything else - don't concatenate, just dump out to
    );
}); // /gulp.task('bower:js'...

/* -------------------------------------------------------------------------------------------------
 * Task - bower:css
 * Handles concatenation and movement of bower CSS packages
 * ---------------------------------------------------------------------------------------------- */
gulp.task('bower:css', function () {
    // Grab the main bower files
    // ---------------------------------------------------------------------------------------------
    var bowerStream = gulp.src($.mainBowerFiles(
        {
            filter: '**/*.css'
        }
    ), { base: paths.bower.src });

    // Filters
    // ---------------------------------------------------------------------------------------------
    var filterNormalizeCss = 'normalize-css/**/*';

    // Vendor streams - process each library separately
    // ---------------------------------------------------------------------------------------------
    // normalize-css
    var streamNormalizeCss = bowerStream
        .pipe($.filter(filterNormalizeCss));

    // Return vendor CSS stream, for all other 3rd-party CSS
    return $.streamqueue({ objectMode: true }, streamNormalizeCss)
        .pipe($.plumber())
        .pipe($.concat('core.css'))
        .pipe(gulp.dest(paths.styles.vendor.src))
        .pipe($.sourcemaps.init())
            .pipe($.minifyCss({ advanced: false }))
            .pipe($.rename({ suffix: '.min' }))
        .pipe($.sourcemaps.write('./', { includeContent: true }))
        .pipe(gulp.dest(paths.styles.vendor.dest));
}); // /gulp.task('bower:css'...

/* -------------------------------------------------------------------------------------------------
 * Task - browser-sync
 * Sets up the BrowserSync instance for local development
 * ---------------------------------------------------------------------------------------------- */
gulp.task('browser-sync', ['bower:js', 'bower:css', 'styles', 'scripts', 'images'], function () {
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

    // Begin polling target directories for changes...
    gulp.watch(paths.styles.core.src + '*.less', ['styles']);
    gulp.watch(paths.scripts.core.src + '*.js', ['scripts']);
    gulp.watch(paths.images.src + '**/*', ['images']);
    gulp.watch(paths.templates.src + '*.html').on('change', browserSync.reload);
}); // /gulp.task('browser-sync'...

/* -------------------------------------------------------------------------------------------------
 * Task - clear
 * Clears gulp-cache
 * ---------------------------------------------------------------------------------------------- */
gulp.task('clear', function (done) {
  return $.cache.clearAll(done);
}); // /gulp.task('clear'...

/* -------------------------------------------------------------------------------------------------
 * Task - clean
 * Deletes everything in dest dirs
 * ---------------------------------------------------------------------------------------------- */
gulp.task('clean', ['clear'], function (cb) {
    $.del([paths.styles.core.dest, paths.scripts.core.dest, paths.images.dest], cb);
}); // /gulp.task('clean'...

/* -------------------------------------------------------------------------------------------------
 * Task - default
 * ---------------------------------------------------------------------------------------------- */
gulp.task('default', ['clean'], function () {
    gulp.start('browser-sync');
}); // /gulp.task('default'...
