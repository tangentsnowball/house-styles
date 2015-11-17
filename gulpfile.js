/* -----------------------------------------------------------------------------
 * Tangent Snowball - House Styles Gulpfile
 * -------------------------------------------------------------------------- */

// Global Vars
// -----------------------------------------------------------------------------
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
                src:  basePaths.src  + 'sass/',
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
    /* -------------------------------------------------------------------------
     * Define names of third-party dependencies
     * -------------------------------------------------------------------------
     * NOTE - when generating vendor lib collections (vendor/core.js,
     * vendor/core.css, etc.) the order in which they are defined below is the
     * order in which they will be concatenated
     * -----------------------------------------------------------------------*/
    libs = {
        scripts: {
            core: ['jquery'],
            ie8:  ['html5shiv', 'respond']
        },
        styles: {
            core: ['normalize-css']
        }
    },
    watchedPatterns = {
        styles:  paths.styles.core.src  + '**/*.s{a,c}ss',
        scripts: paths.scripts.core.src + '*.js',
        images:  paths.images.src       + '**/*',
        html:    paths.templates.src    + '*.html'
    };

// Load Node/Gulp plugins
// -----------------------------------------------------------------------------
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

/* -----------------------------------------------------------------------------
 * compileSASS
 * Accepts: a stream upon which to perform gulp stuff, and a message to display
 * Returns: the processed stream
 * -------------------------------------------------------------------------- */
function compileSASS(inputStream, taskType) {
    return inputStream
        .pipe($.plumber(function (error) {
            $.util.log($.util.colors.red('Error (' + error.plugin + '): ' + error.message + '\n'));
            this.emit('end');
        }))
        .pipe($.newer(paths.styles.core.dest))
        .pipe($.sass({ includePaths: paths.styles.src + 'imports/' }))
        .pipe($.sourcemaps.init())
            .pipe($.minifyCss({ advanced: false }))
            .pipe($.rename({ suffix: '.min' }))
        .pipe($.sourcemaps.write('./', { includeContent: true }))
        .pipe(gulp.dest(paths.styles.core.dest))
        .pipe(browserSync.stream())
        .pipe($.if(flags.notify, $.notify({ message: taskType + ' task complete' })));
} // /function compileSASS

/* -----------------------------------------------------------------------------
 * minifySrc
 * Accepts: a gulp stream, a source type, gulp-uglify options, libType, filename
 * Returns: the processed stream
 * Concat stream, minify using options and write to JS src/dest using filename
 * -------------------------------------------------------------------------- */
function minifySrc (sourceType, libType, filename, minifierOptions, sourceStream) {
    function getMinifier () {
        switch (sourceType) {
            case 'scripts':
                return $.uglify(minifierOptions);
            case 'styles':
                return $.minifyCss(minifierOptions);
        } // /switch (sourceType)
    } // /function getMinifier(o)

    return sourceStream
        .pipe($.plumber(function (error) {
            $.util.log($.util.colors.red('Error (' + error.plugin + '): ' + error.message));
            this.emit('end');
        }))
        .pipe($.concat(filename))
        .pipe(gulp.dest(paths[sourceType][libType].src))
        .pipe(getMinifier())
        .pipe($.rename({ suffix: '.min' }))
        .pipe(gulp.dest(paths[sourceType][libType].dest));
} // /function minifySrc

/* -----------------------------------------------------------------------------
 * getVendorLibsGlob
 * Accepts: libType - scripts, styles, etc.
            libCol - a single or an array of lib collection names
 * Returns: a glob pattern string
 * Generates a glob pattern from the collection name of vendor libs, as defined
 * in libs[libType]
 * Can also accept an array of lib collection names - e.g. ['ie8', 'core']
 * -------------------------------------------------------------------------- */
function getVendorLibsGlob (libType, libCol) {
    // 1. Set up empty libs array
    var libArray = [],
        glob = null;

    function isArray (v) {
        if (v.constructor === Array) {
            return true;
        } else {
            return false;
        }
    } // /function isArray

    function pushLibsToArray (name) {
        // 1. loop through libs[libType] using name as selector
        for (var lib in libs[libType][name]) {
            // 2. get lib.name
            var thisLib = libs[libType][name][lib];
            // 3. push to libsArray in order
            libArray.push(thisLib);
        } // /for...
    } // /function pushLibsToArray


    /* 2. If libCol is an array of lib collection names, loop through and push
     * each name to libArray for each collection */
    if (isArray(libCol)) {
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
        glob = ('{' + libArray.join(',') + '}/**/*').toString();
    } else if (libArray.length === 1) {
        // 3b. but there's no need to return a multiglob if there's only one lib
        glob = (libArray[0] + '/**/*').toString();
    } // /if...
    return glob;
} // /function getVendorLibsGlob

/* -----------------------------------------------------------------------------
 * Task - styles
 * Handles processing of SASS/SCSS files
 * -------------------------------------------------------------------------- */
gulp.task('styles', function () {
    return compileSASS(gulp.src(paths.styles.core.src + 'styles.s{a,c}ss'), 'Styles');
}); // /gulp.task('styles'...

/* -----------------------------------------------------------------------------
 * Task - scripts
 * Concatenates application js (anything in paths.scripts.core.src), generates
 * sourcemaps, minifies
 * -------------------------------------------------------------------------- */
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

/* -----------------------------------------------------------------------------
 * Task - images
 * Uses imagemin to optimise images losslessly
 * -------------------------------------------------------------------------- */
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

/* -----------------------------------------------------------------------------
 * Task - bower:js
 * Handles concatenation and movement of bower JS packages
 * -------------------------------------------------------------------------- */
gulp.task('bower:js', function () {
    // Grab the main bower files
    // -------------------------------------------------------------------------
    var bowerStream = gulp.src($.mainBowerFiles(
        { filter: '**/*.js' }
    ), { base: paths.bower.src });

    /* -------------------------------------------------------------------------
     * Return merged, minified JS streams
     * ---------------------------------------------------------------------- */
    return $.mergeStream(
        // Core vendor libs - present site-wide
        minifySrc('scripts', 'vendor', 'core.js',
            {
                mangle: { except: ['jQuery'], keep_fnames: true },
                preserveComments: 'license'
            },
            bowerStream.pipe($.filter(getVendorLibsGlob('scripts', 'core')))
        ),
        // IE8 JS stream - present site-wide for IE8- only
        minifySrc('scripts', 'vendor', 'ie8.js',
            {
                mangle: { keep_fnames: true },
                preserveComments: 'license'
            },
            bowerStream.pipe($.filter(getVendorLibsGlob('scripts', 'ie8')))
        ),
        // Everything else - don't concatenate, just dump out to paths.scripts.vendor.dest
        bowerStream.pipe($.ignore(getVendorLibsGlob('scripts', ['core', 'ie8'])))
            .pipe($.uglify({
                mangle: { except: ['jQuery'], keep_fnames: true },
                preserveComments: 'license'
            }))
            .pipe($.rename(function (path) {
                path.dirname = './';
                path.extname = '.min.js';
            }))
            .pipe(gulp.dest(paths.scripts.vendor.dest))
    );
}); // /gulp.task('bower:js'...

/* -----------------------------------------------------------------------------
 * Task - bower:css
 * Handles concatenation and movement of bower CSS packages
 * -------------------------------------------------------------------------- */
gulp.task('bower:css', function () {
    // Grab the main bower files
    // -------------------------------------------------------------------------
    var bowerStream = gulp.src($.mainBowerFiles(
        { filter: '**/*.css' }
    ), { base: paths.bower.src });

    return $.mergeStream(
        // Core vendor libs - present site-wide
        minifySrc('styles', 'vendor', 'core.css', { advanced: false },
            bowerStream.pipe($.filter(getVendorLibsGlob('styles', 'core')))
        )
    );
}); // /gulp.task('bower:css'...

/* -----------------------------------------------------------------------------
 * Task - browser-sync
 * Sets up the BrowserSync instance for local development
 * -------------------------------------------------------------------------- */
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
    // Watch: styles
    console.log('\nWatching...');
    console.log('styles:  ' + watchedPatterns.styles);
    gulp.watch(watchedPatterns.styles,  ['styles']);

    // Watch: scripts
    console.log('scripts: ' + watchedPatterns.scripts);
    gulp.watch(watchedPatterns.scripts, ['scripts']);

    // Watch: images
    console.log('images:  ' + watchedPatterns.images);
    gulp.watch(watchedPatterns.images,  ['images']);

    // Watch: html
    console.log('html:    ' + watchedPatterns.html + '\n');
    gulp.watch(watchedPatterns.html).on('change', browserSync.reload);

}); // /gulp.task('browser-sync'...

/* -----------------------------------------------------------------------------
 * Task - clear
 * Clears gulp-cache
 * -------------------------------------------------------------------------- */
gulp.task('clear', function (done) {
  return $.cache.clearAll(done);
}); // /gulp.task('clear'...

/* -----------------------------------------------------------------------------
 * Task - clean
 * Deletes everything in dest dirs
 * -------------------------------------------------------------------------- */
gulp.task('clean', ['clear'], function (cb) {
    $.del([paths.styles.core.dest, paths.scripts.core.dest, paths.images.dest], cb);
}); // /gulp.task('clean'...

/* -----------------------------------------------------------------------------
 * Task - default
 * -------------------------------------------------------------------------- */
gulp.task('default', ['clean'], function () {
    gulp.start('browser-sync');
}); // /gulp.task('default'...
