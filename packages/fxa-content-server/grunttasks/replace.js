/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var findCacheBustingPath = require('./lib/find-cache-busting-path');
var requireConfig = require('../app/scripts/require_config');

module.exports = function (grunt) {

  function replacePathWithCacheBustingPath(matchedWord) {
    return findCacheBustingPath(grunt, matchedWord + '.js').replace(/\.js$/, '');
  }

  /**
   * Create a list of modules used by requireOnDemand. The original
   * path specified in require_config.paths will be replaced
   * with the cache busting variant
   */
  function createRequireOnDemandReplacements() {
    return requireConfig.requireOnDemand.map(function (moduleName) {
      return {
        from: requireConfig.paths[moduleName],
        to: replacePathWithCacheBustingPath
      };
    });
  }

  grunt.config('replace', {
    // Replace source paths in require_config with cache busting URLs.
    require_on_demand: { //eslint-disable-line camelcase
      overwrite: true,
      replacements: createRequireOnDemandReplacements(),
      src: [
        '<%= yeoman.dist %>/scripts/*.js'
      ]
    },
    tos_pp: { //eslint-disable-line camelcase
      overwrite: true,
      replacements: [
        {
          from: /{:\s.*?\s}/g,
          to: ''
        },
        {
          from: /^#\s.*?\n$/m,
          to: ''
        }
      ],
      src: [
        '<%= yeoman.pp_md_src %>/*.md',
        '<%= yeoman.tos_md_src %>/*.md'
      ]
    }
  });
};
