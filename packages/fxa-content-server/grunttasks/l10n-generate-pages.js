/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// grunt task to create a copy of each static page for each locale.
// Three steps are performed to create the pages:
//  1. po files for each locale are converted to JSON
//  2. Templates are compiled using the JSON strings and with URLs for
// locale specific resources.
//
// They compiled templates are placed in the server's compiled template directory to await further processing
// (minification, revving).

module.exports = function (grunt) {
  var path = require('path');
  const versionInfo = require('../server/lib/version');
  var Handlebars = require('handlebars');

  var templateSrc;
  var templateDest;

  var PROPAGATED_ESCAPED_TEMPLATE_FIELDS = [
    'config',
    'featureFlags',
    'flowId',
    'flowBeginTime',
    'message',
  ];
  var PROPAGATED_UNSAFE_TEMPLATE_FIELDS = [
    'downloadFirefoxUrl',
    'staticResourceUrl',
  ];

  // Make the 'gettext' function available in the templates.
  Handlebars.registerHelper('t', function (string) {
    if (string.fn) {
      return this.l10n.format(this.l10n.gettext(string.fn(this)), this);
    } else {
      return this.l10n.format(this.l10n.gettext(string), this);
    }
  });

  grunt.registerTask('l10n-generate-pages', [
    'l10n-create-json',
    'l10n-compile-templates',
  ]);

  grunt.registerTask(
    'l10n-compile-templates',
    'Generate localized versions of the static pages',
    function () {
      var done = this.async();

      var i18n = require('../server/lib/i18n')(grunt.config.get('server.i18n'));

      // server config is set in the selectconfig task
      var supportedLanguages = grunt.config.get(
        'server.i18n.supportedLanguages'
      );

      templateSrc = grunt.config.get('yeoman.page_template_src');
      templateDest = grunt.config.get('yeoman.page_template_dist');

      // Create a cache of the templates so we can reference them synchronously later

      supportedLanguages.forEach(function (lang) {
        generatePagesForLanguage(i18n, lang, {
          versionInfo: versionInfo,
        });
      });
      done();
    }
  );

  function generatePagesForLanguage(i18n, language, options) {
    // items on disk are stored by locale, not language.
    var locale = i18n.localeFrom(language);
    var destRoot = path.join(templateDest, locale);
    var context = i18n.localizationContext(language);

    // only worry about html files. Things like .swp files
    // for editors should be ignored.
    // Ignore the mocha and style-guide templates, they are only used for testing
    var templates = grunt.file.expand(
      {
        cwd: templateSrc,
      },
      ['**/*.html', '!style-guide.html', '!mocha.html']
    );
    templates.forEach(function (fileName) {
      var srcPath = path.join(templateSrc, fileName);
      var destPath = path.join(destRoot, fileName);
      generatePage(srcPath, destPath, context, options);
    });
  }

  function generatePage(srcPath, destPath, context, options = {}) {
    grunt.verbose.writeln('generating `%s`', destPath);

    grunt.file.copy(srcPath, destPath, {
      process: function (contents) {
        var template = Handlebars.compile(contents);
        var data = {
          bundlePath:
            options.versionInfo && options.versionInfo.commit
              ? `/bundle-${options.versionInfo.commit}`
              : '/bundle',
          l10n: context,
          lang: context.lang,
          lang_dir: context.lang_dir, //eslint-disable-line camelcase
          locale: context.locale,
        };
        // Propagate any tags that are required for data
        // to be rendered dynamically by the server.
        PROPAGATED_ESCAPED_TEMPLATE_FIELDS.forEach(function (field) {
          data[field] = '{{' + field + '}}';
        });
        PROPAGATED_UNSAFE_TEMPLATE_FIELDS.forEach(function (field) {
          data[field] = '{{{' + field + '}}}';
        });
        return template(data);
      },
    });
  }
};
