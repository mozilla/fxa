/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var path = require('path');
var i18n = require('i18n-abide');

// percentage of strings that must be translated for a supported locale
var supportedThreshold = 90;
// percentage of strings that must be translated for verbose feedback
var verboseThreshold = 60;

module.exports = function(grunt) {
  grunt.registerTask('l10n-supported-locales', [
    'selectconfig:dist',
    'l10n-create-json',
    'l10n-locale-counts',
  ]);

  var getCount = function(clientKeys, serverKeys, src) {
    var clientJson = require(path.resolve(src, 'client.json'));
    var messagesJson = require(path.resolve(src, 'messages.json'));
    var count = 0;

    clientKeys.forEach(function(key) {
      if (key in clientJson && clientJson[key] !== '') {
        count++;
      }
    });
    serverKeys.forEach(function(key) {
      if (key in messagesJson && messagesJson[key] !== '') {
        count++;
      }
    });

    return count;
  };

  var getMissingStrings = function(clientKeys, serverKeys, src) {
    var clientJson = require(path.resolve(src, 'client.json'));
    var messagesJson = require(path.resolve(src, 'messages.json'));
    var missing = [];

    clientKeys.forEach(function(key) {
      if (!clientJson[key]) {
        missing.push('client.json: ' + key);
      }
    });
    serverKeys.forEach(function(key) {
      if (!messagesJson[key]) {
        missing.push('messages.json: ' + key);
      }
    });

    return missing;
  };

  grunt.config('l10n-locale-counts', {
    app: {
      files: [
        {
          expand: true,
          src: ['<%= yeoman.app %>/i18n/*'],
        },
      ],
    },
  });

  grunt.registerMultiTask(
    'l10n-locale-counts',
    'Print the list of locales we should enable in production.',
    function() {
      // config must be loaded inside of the task so that it does not interfere
      // with other tasks.
      var config = grunt.config().server;
      var goodLocales = [config.i18n.defaultLang];
      var templateDir = path.join(
        __dirname,
        '..',
        grunt.config().yeoman.tmp,
        'i18n',
        'templates'
      );
      var templateClientKeys = Object.keys(
        require(path.join(templateDir, 'client.pot.json'))
      );
      var templateServerKeys = Object.keys(
        require(path.join(templateDir, 'server.pot.json'))
      );
      var totalStrings = templateClientKeys.length + templateServerKeys.length;

      this.files.forEach(function(file) {
        var src = file.src[0];
        var locale = path.basename(src);
        var count = getCount(templateClientKeys, templateServerKeys, src);
        var percent = (count / totalStrings) * 100;

        if (percent >= supportedThreshold) {
          grunt.log.writeln(locale, count, '/', totalStrings);

          // Although this locale exceeded our threshold, it's
          // not perfect. Let's see what it's missing.
          if (count !== totalStrings) {
            grunt.log.writeln('- Missing strings:');
            grunt.log.writeln(
              '    ' +
                getMissingStrings(
                  templateClientKeys,
                  templateServerKeys,
                  src
                ).join('\n    ') +
                '\n'
            );
          }

          goodLocales.push(i18n.languageFrom(locale));
        } else if (percent >= verboseThreshold) {
          grunt.verbose.writeln(locale, count, '/', totalStrings);
          grunt.verbose.writeln('- Missing strings:');
          grunt.verbose.writeln(
            '    ' +
              getMissingStrings(
                templateClientKeys,
                templateServerKeys,
                src
              ).join('\n    ') +
              '\n'
          );
        } else {
          grunt.verbose.writeln(locale, count, '/', totalStrings);
        }
      });

      grunt.log.write(JSON.stringify(goodLocales.sort(), null, '  '));
    }
  );
};
