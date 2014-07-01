/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// grunt task to create a copy of each static page for each locale.
// Any `{{ locale }}` tags will be replaced with the locale. This is
// used to create a per-locale template with locale specific resources.

module.exports = function (grunt) {
  'use strict';

  var path = require('path');
  var Handlebars = require('handlebars');

  var templateSrc;
  var templateDest;

  // Make the 'gettext' function available in the templates.
  Handlebars.registerHelper('t', function (string) {
    if (string.fn) {
      return this.l10n.format(this.l10n.gettext(string.fn(this)), this);
    } else {
      return this.l10n.format(this.l10n.gettext(string), this);
    }
    return string;
  });

  grunt.registerTask('l10n-generate-pages',
      'Generate localized versions of the static pages', function () {

    var i18n = require('../server/lib/i18n')(grunt.config.get('server.i18n'));

    // server config is set in the selectconfig task
    var supportedLanguages = grunt.config.get('server.i18n.supportedLanguages');

    templateSrc = grunt.config.get('yeoman.page_template_src');
    templateDest = grunt.config.get('yeoman.page_template_dist');

    supportedLanguages.forEach(function (lang) {
      generatePagesForLanguage(i18n, lang);
    });
  });


  function generatePagesForLanguage(i18n, language) {
    // items on disk are stored by locale, not language.
    var locale = i18n.localeFrom(language);
    var destRoot = path.join(templateDest, locale);
    var context = i18n.localizationContext(language);

    grunt.file.recurse(templateSrc,
                    function (srcPath, rootDir, subDir, fileName) {

      var destPath = path.join(destRoot, (subDir || ''), fileName);
      generatePage(srcPath, destPath, context);
    });
  }

  function generatePage(srcPath, destPath, context) {
    grunt.log.writeln('generating `%s`', destPath);

    grunt.file.copy(srcPath, destPath, {
      process: function (contents, path) {
        var template = Handlebars.compile(contents);
        var out = template({
          l10n: context,
          locale: context.locale,
          lang: context.lang,
          lang_dir: context.lang_dir,
          fontSupportDisabled: context.fontSupportDisabled
        });
        return out;
      }
    });
  }
};

