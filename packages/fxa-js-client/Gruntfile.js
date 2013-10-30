module.exports = function(grunt) {
  // load all grunt tasks matching the `grunt-*` pattern
  require('load-grunt-tasks')(grunt);
  // load the Intern tasks
  grunt.loadNpmTasks('intern');


  grunt.initConfig({
    requirejs: {
      options: {
        baseUrl: '.',
        include: ['gherkin/FxAccountClient'],
        insertRequire: ['gherkin/FxAccountClient'],
        name: 'components/almond/almond',
        wrap: {
          startFile: 'config/start.frag',
          endFile: 'config/end.frag'
        }
      },
      prod: {
        options: {
          out: 'build/gherkin.min.js',
          optimize: 'uglify2',
          generateSourceMaps: true,
          preserveLicenseComments: false
        }
      },
      debug: {
        options: {
          out: 'build/gherkin.js',
          optimize: 'none',
          preserveLicenseComments: true
        }
      }
    },
    watch: {
      lib: {
        options: {
          atBegin: true
        },
        files: ['gherkin/**/*.js'],
        tasks: ['build']
      },
      tests: {
        files: ['tests/**/*.js'],
        tasks: ['test']
      },
      config: {
        files: ['Gruntfile.js', 'config/*'],
        tasks: ['build']
      }
    },
    clean: {
      build: ['build']
    },
    jshint: {
      config: {
        options: {jshintrc: '.jshintrc'},
        src: ['Gruntfile.js', 'config/**/*.js']
      },
      app: {
        options: {jshintrc: 'gherkin/.jshintrc'},
        src: ['gherkin/**/*.js']
      }
    },
    bytesize: {
      all: {
        src: ['build/gherkin.js', 'build/gherkin.min.js']
      }
    },
    intern: {
      node: {
        options: {
          config: 'tests/intern',
          reporters: ['console'],
          suites: ['tests/all']
        }
      }
    }
  });

  grunt.registerTask('build',
    'Build gherkin',
    ['clean', 'jshint', 'requirejs', 'bytesize']);

  grunt.registerTask('test',
    'Run gherkin tests',
    ['build', 'intern:node']);

  grunt.registerTask('default',
    ['build']);
  grunt.registerTask('dev',
    ['watch']);
};
