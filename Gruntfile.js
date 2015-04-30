// Gruntfile with the configuration of grunt-express and grunt-open. No livereload yet!
module.exports = function(grunt) {

  // Load Grunt tasks declared in the package.json file
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // Configure Grunt 
  grunt.initConfig({


    // grunt-express will serve the files from the folders listed in `bases`
    // on specified `port` and `hostname`
    express: {
      all: {
        options: {
          port: 9000,
          hostname: "0.0.0.0",
          bases: [__dirname], // Replace with the directory you want the files served from
                              // Make sure you don't use `.` or `..` in the path as Express
                              // is likely to return 403 Forbidden responses if you do
                              // http://stackoverflow.com/questions/14594121/express-res-sendfile-throwing-forbidden-error
          livereload: true
        }
      }
    },

    less: {
        development: {
             options: {
                paths: ["css"],
                compress: true,
                yuicompress: true,
                optimization: 2
            },
            files: {
              /*Target - Destination*/
              "static/css/styles.css": "static/css/less/styles.less",
              "static/css/styles-responsive.css": "static/css/less/styles-responsive.less"
            }
        }
    },

    uglify: {
      options: {
        mangle: false
      },
      my_target: {
        files: {
          'static/js/dist/main.min.js': ['static/js/main.js']
        }
      }
    },

    // grunt-watch will monitor the projects files
    watch: {
      less : {
        files: ['static/css/less/*.less'],
        tasks: ['less']
      },
      html : {
        files: ['*.html']
      },
      js : {
        files: ['static/js/*.js'],
        tasks: ['uglify']
      },
      options: {
        livereload: true
      }
    },

    // grunt-open will open your browser at the project's URL
    open: {
      all: {
        // Gets the port from the connect configuration
        path: 'http://localhost:<%= express.all.options.port%>'
      }
    }
  });

  // Creates the `server` task
  grunt.registerTask('server', [
    'express',
    'open',
    'watch'
  ]);
  grunt.registerTask('default', ["server"]);
};
