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
        },
        {
          // sometimes provided legal docs have extra indent before links and headings
          // such as `    [`, this creates a <code> block when parsed by remarkable
          // to avoid that we remove the indent spaces

          // ref: https://github.com/mozilla/legal-docs/blob/master/firefox_privacy_notice/en-US.md
          from: /^ {4}/gm,
          to: ''
        }
      ],
      src: [
        '<%= yeoman.pp_md_src %>/*.md',
        '<%= yeoman.tos_md_src %>/*.md'
      ]
    },

    // Replace the require('text!/i18n/client.json') with {} because
    // /i18n/client.json does not exist on disk and requirejs would
    // blow up otherwise. The translations will be insert later in the
    // build step, one translated main.js file per locale.
    'fetch_translations': {
      overwrite: true,
      replacements: [
        {
          from: /__translations__:.*/,
          to: '__translations__:{},'
        }
      ],
      src: [
        '<%= yeoman.es5 %>/scripts/lib/translator.js'
      ]
    }
  });
};
