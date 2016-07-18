/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  grunt.config('requirejs', {
    dist: {
      // Options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
      options: {
        baseUrl: '<%= yeoman.es5 %>/scripts',
        // since nocache is a requirejs plugin and not stubbed, it must
        // be added manually to the bundle.
        deps: ['nocache'],
        findNestedDependencies: true,
        keepBuildDir: true,
        mainConfigFile: '<%= yeoman.es5 %>/scripts/require_config.js',
        name: 'main',
        optimize: 'none',
        out: '<%= yeoman.tmp %>/scripts/main.js',
        // required to support SourceMaps
        // http://requirejs.org/docs/errors.html#sourcemapcomments
        preserveLicenseComments: false,
        replaceRequireScript: [{
          files: ['<%= yeoman.page_template_dist %>/{,*/}index.html'],
          module: 'main',
          modulePath: '/scripts/main'
        }],
        stubModules: [
          'text',
          'stache'
        ],
        useStrict: true,
        // See issue #3166, extending waitSeconds because r.js cannot
        // parse the dependency tree in time on slow machines
        waitSeconds: 20,
        wrap: true
      }
    }
  });
};
