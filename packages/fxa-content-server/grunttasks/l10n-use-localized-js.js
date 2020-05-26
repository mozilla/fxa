/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  var path = require('path');

  grunt.registerTask(
    'l10n-use-localized-js',
    'Update HTML to point to localized JavasScript',
    function () {
      // server config is set in the selectconfig task
      var supportedLanguages = grunt.config.get(
        'server.i18n.supportedLanguages'
      );
      var i18n = require('../server/lib/i18n')(grunt.config.get('server.i18n'));

      var templateDest = grunt.config.get('yeoman.page_template_dist');

      supportedLanguages.forEach((language) => {
        var locale = i18n.localeFrom(language);
        var templatePath = path.join(templateDest, locale, 'index.html');

        var html = grunt.file.read(templatePath);
        grunt.file.write(
          templatePath,
          html.replace('/app.bundle.js', '/app.bundle.' + locale + '.js')
        );
      });
    }
  );
};
