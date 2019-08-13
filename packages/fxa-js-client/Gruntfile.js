/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function(grunt) {
  // load all grunt tasks matching the `grunt-*` pattern
  require('load-grunt-tasks')(grunt);

  var pkg = grunt.file.readJSON('package.json');

  grunt.initConfig({
    pkg: pkg,
    pkgReadOnly: pkg,
  });

  // load local Grunt tasks
  grunt.loadTasks('tasks');

  grunt.registerTask('build', 'Build client', [
    'clean',
    'lint',
    'webpack:app',
    'bytesize',
  ]);

  grunt.registerTask('lint', 'Alias for eslint', ['eslint']);

  grunt.registerTask('default', ['build']);

  grunt.registerTask('release', [
    'build',
    'bump-only',
    'conventionalChangelog',
    'bump-commit',
    'yuidoc',
    'buildcontrol',
  ]);

  grunt.registerTask('dev', ['watch:dev']);

  grunt.registerTask('debug', ['watch:debug']);

  grunt.registerTask('doc', 'Create client documentation using YUIDoc', [
    'yuidoc',
    'open',
  ]);

  grunt.registerTask('travis', 'Test runner task for Travis CI', [
    'build',
    'intern:node',
    'intern:sauce',
  ]);
};
