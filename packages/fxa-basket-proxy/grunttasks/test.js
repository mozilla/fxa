/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var SRC = [
  'test/**/*.js',
  '!test/lib/**'
];

module.exports = function (grunt) {
  grunt.config('mochaTest', {
    test: {
      options: {
        ui: 'bdd',
        reporter: 'spec',
        require: 'test/lib/blanket'
      },
      src: SRC
    },
    coverage: {
      options: {
        reporter: 'mocha-text-cov'
      },
      src: '<%= mochaTest.test.src %>'
    },
    'travis-cov': {
      options: {
        reporter: 'travis-cov'
      },
      src: SRC
    }
  });

  grunt.registerTask('test', [
    'lint',
    'mochaTest',
  ]);
};
