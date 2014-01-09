/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  // load all grunt tasks matching the `grunt-*` pattern
  require('load-grunt-tasks')(grunt);
  // load the Intern tasks
  grunt.loadNpmTasks('intern');
  // load local Grunt tasks
  grunt.loadTasks('tasks');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    requirejs: {
      options: {
        baseUrl: '.',
        include: ['client/FxAccountClient'],
        insertRequire: ['client/FxAccountClient'],
        name: 'components/almond/almond',
        wrap: {
          startFile: 'config/start.frag',
          endFile: 'config/end.frag'
        }
      },
      prod: {
        options: {
          out: 'build/fxa-client.min.js',
          optimize: 'uglify2',
          generateSourceMaps: true,
          preserveLicenseComments: false
        }
      },
      debug: {
        options: {
          out: 'build/fxa-client.js',
          optimize: 'none',
          preserveLicenseComments: true
        }
      }
    },
    watch: {
      dev: {
        options: {
          atBegin: true
        },
        files: ['Gruntfile.js', 'client/**/*.js', 'tests/**/*.js'],
        tasks: ['build', 'intern:node']
      },
      debug: {
        options: {
          atBegin: true
        },
        files: ['Gruntfile.js', 'client/**/*.js', 'tests/**/*.js'],
        tasks: ['requirejs:debug', 'intern:node']
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
        options: {jshintrc: 'client/.jshintrc'},
        src: ['client/*.js', 'client/lib/**/*']
      }
    },
    bytesize: {
      all: {
        src: ['build/fxa-client.js', 'build/fxa-client.min.js']
      }
    },
    intern: {
      node: {
        options: {
          config: 'tests/intern',
          reporters: ['console'],
          suites: ['tests/all']
        }
      },
      // local browser
      browser: {
        options: {
          runType: 'runner',
          config: 'tests/intern_browser',
          suites: ['tests/all']
        }
      },
      sauce: {
        options: {
          runType: 'runner',
          config: 'tests/intern_sauce',
          suites: ['tests/all'],
          sauceUsername: "gherkin-web",
          sauceAccessKey: "de4982ac-cb05-4b9c-8059-385a83de8af4"
        }
      }
    },
    yuidoc: {
      compile: {
        name: '<%= pkg.name %>',
        description: '<%= pkg.description %>',
        version: '<%= pkg.version %>',
        options: {
          paths: 'client/',
          outdir: 'docs/'
        }
      }
    },
    open : {
      dev : {
        path: 'docs/index.html'
      }
    }
  });

  grunt.registerTask('build',
    'Build client',
    ['clean', 'jshint', 'requirejs', 'bytesize']);

  grunt.registerTask('test',
    'Run tests via node',
    ['intern:node']);

  grunt.registerTask('default',
    ['build']);

  grunt.registerTask('dev',
    ['watch:dev']);

  grunt.registerTask('debug',
    ['watch:debug']);

  grunt.registerTask('doc',
    ['yuidoc', 'open']);

  grunt.registerTask('travis',
    'Test runner task for Travis CI',
    ['intern:node', 'intern:sauce']);
};
