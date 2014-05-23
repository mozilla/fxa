/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// grunt task to create a copy of each static page for each locale.
// Any `{{ locale }}` tags will be replaced with the locale. This is
// used to create a per-locale template with locale specific resources.

module.exports = function (grunt) {
  'use strict';

  var path = require('path');
  var i18n = require('i18n-abide');

  var templateSrc;
  var templateDest;

  grunt.registerTask('l10n-generate-pages',
      'Generate localized versions of the static pages', function () {

    // server config is set in the selectconfig task
    var supportedLanguages = grunt.config.get('server.i18n.supportedLanguages');

    templateSrc = grunt.config.get('yeoman.page_template_src');
    templateDest = grunt.config.get('yeoman.page_template_dist');

    supportedLanguages.forEach(generatePagesForLanguage);
  });

  function generatePagesForLanguage(language) {
    // items on disk are stored by locale, not language.
    var locale = i18n.localeFrom(language);
    var destRoot = path.join(templateDest, locale);

    grunt.file.recurse(templateSrc,
                    function (srcPath, rootDir, subDir, fileName) {

      var destPath = path.join(destRoot, (subDir || ''), fileName);
      generatePage(srcPath, destPath, locale);
    });
  }

  function generatePage(srcPath, destPath, locale) {
    grunt.log.writeln('generating `%s`', destPath);

    grunt.file.copy(srcPath, destPath, {
      process: function (contents, path) {
        // replace any `{{ locale }}` tags with the locale.
        return contents.replace(/{{\s*locale\s*}}/g, locale);
      }
    });
  }
};

