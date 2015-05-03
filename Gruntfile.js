// Gruntfile with the configuration of grunt-express and grunt-open. No livereload yet!
module.exports = function(grunt) {

  // Load Grunt tasks declared in the package.json file
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  var fs = require('fs');
  var path = require('path');
  
  /* Custom function for checking newer for saved less files that import to other less files */
  function checkForNewerImports(lessFile, mTime, include) {
      fs.readFile(lessFile, 'utf8', function(err, data) {
          var lessDir = path.dirname(lessFile),
              regex = /@import "(.+?)(\.less)?";/g,
              shouldInclude = false,                
              match;
   
          while ((match = regex.exec(data)) !== null) {
              // All of my less files are in the same directory,
              // other paths may need to be traversed for different setups...
              var importFile = lessDir + '/' + match[1] + '.less';
              if (fs.existsSync(importFile)) {
                  var stat = fs.statSync(importFile);
                  if (stat.mtime > mTime) {
                      shouldInclude = true;
                      break;
                  }
              }
          }
          include(shouldInclude);
      });
  }

  var config = {
    dev: 'static',
    dist: 'static/dist'
  };

  // Configure Grunt 
  grunt.initConfig({
    config: config,

    // grunt-express will serve the files from the folders listed in `bases`
    // on specified `port` and `hostname`
    express: {
      all: {
        options: {
          port: 9000,
          hostname: '0.0.0.0',
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
                paths: ['css'],
                compress: true,
                yuicompress: true,
                optimization: 2
            },
            files: {
              /*Target - Destination*/
              '<%= config.dev %>/css/styles.css': '<%= config.dev %>/css/less/styles.less',
              '<%= config.dev %>/css/styles-responsive.css': '<%= config.dev %>/css/less/styles-responsive.less'
            }
        }
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        '<%= config.dev %>/js/*.js',
        '!<%= config.dev %>/js/vendor/*',
      ]
    },

    uglify: {
      options: {
        mangle: false
      },
      all: {
        files: {
          '<%= config.dist %>/js/main.min.js': ['<%= config.dev %>/js/main.js']
        }
      }
    },

    newer: {
        options: {
            override: function(details, include) {
                if (details.task === 'less') {
                    checkForNewerImports(details.path, details.time, include);
                }
                else {
                    include(false);
                }
            }
        }
    },

    // grunt-watch will monitor the projects files
    watch: {
      less : {
        files: ['<%= config.dev %>/css/less/*.less'],
        tasks: ['newer:less']
      },
      html : {
        files: ['*.html']
      },
      js : {
        files: ['<%= config.dev %>/js/*.js', '!<%= config.dist %>/js/*.js'],
        tasks: ['newer:jshint', 'newer:uglify:all']
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
    'watch',
    'newer:jshint',
    'uglify'
  ]);
  grunt.registerTask('default', ['server']);
};
