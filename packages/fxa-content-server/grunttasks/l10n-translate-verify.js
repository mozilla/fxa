/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  grunt.registerTask(
    'l10n-translate-verify',
    'Run the Valid URL parser on the generated l10n files',
    [
      'clean',
      'selectconfig:dist',
      'l10n-generate-pages',
      'l10n-json-to-html',
      'generate-valid-urls',
      'verify-urls',
    ]
  );

  grunt.registerMultiTask(
    'verify-urls',
    'Verify whether the translated urls are valid',
    function () {
      var fileArray = this.files[0].src;
      var contents = grunt.file.read(fileArray.shift());
      contents = JSON.parse(contents);
      var urlArray = contents[0];
      var idArray = contents[1];
      var hasErrors = 0;
      var urlRegex = /(href="[\w/:\\\.%()]+")/gi;
      var idRegex = /(?:<a).*id="[\w\-]+"/gi;
      // Extract the href and id from each file and check if it belongs to
      // a valid representation of the url. Flag it if not.
      fileArray.forEach(function (src) {
        var html = grunt.file.read(src);
        var urlList = html.match(urlRegex);
        var idList = html.match(idRegex);
        // Check if there were any urls found, .match() might return null
        if (urlList !== null) {
          urlList.forEach(function (url) {
            if (urlArray.indexOf(url) === -1) {
              grunt.log.error(
                'Found an url which should not be there',
                url,
                src
              );
              hasErrors = hasErrors + 1;
            }
          });
        }
        if (idList !== null) {
          idList.forEach(function (id) {
            id = returnId(id);
            if (idArray.indexOf(id) === -1) {
              grunt.log.error('Found an id which should not be there', id, src);
              hasErrors = hasErrors + 1;
            }
          });
        }
      });
      if (hasErrors !== 0) {
        grunt.fail.warn(
          'Found ' +
            hasErrors +
            ' ' +
            grunt.util.pluralize(hasErrors, 'error/errors') +
            ' in ' +
            fileArray.length +
            ' files'
        );
      } else {
        grunt.log.writeln(
          'Checked ' +
            fileArray.length +
            ' files for valid hrefs and ids and found nothing wrong.'
        );
      }
    }
  );

  grunt.config('verify-urls', {
    dist: {
      files: [
        {
          expand: false,
          src: [
            '<%= yeoman.tmp %>/validURLS.json',
            '<%= yeoman.tmp %>/i18n/*/*.html',
          ],
        },
      ],
    },
  });

  grunt.registerMultiTask(
    'generate-valid-urls',
    'Generate the list of valid urls and ids for translation',
    function () {
      var urlRegex = /(href=\\?(?:"|')[\w/:\\\.%()]+(?:"|'))/gi;
      var idRegex = /(?:<a).*id=\\"[\w\-]+\\"/gi;
      var urlArray = [];
      var idArray = [];
      // iterate through eact .pot file and extract the urls
      this.files[0].src.forEach(function (src) {
        var contents = grunt.file.read(src);
        if (urlRegex.test(contents)) {
          Array.prototype.push.apply(urlArray, contents.match(urlRegex));
        }
        if (idRegex.test(contents)) {
          Array.prototype.push.apply(idArray, contents.match(idRegex));
        }
      });
      urlArray = urlArray.map(stripSpecialChars);
      idArray = idArray.map(returnId);
      var json = [urlArray, idArray];
      // write out the urls to a temporary JSON file
      grunt.file.write(this.files[0].dest, JSON.stringify(json));
      grunt.log.writeln(
        'Generated urls and ids from ' + this.files[0].src.length + ' files'
      );
    }
  );

  grunt.config('generate-valid-urls', {
    dist: {
      files: [
        {
          dest: '<%= yeoman.tmp %>/validURLS.json',
          expand: false,
          src: ['<%= yeoman.strings_dist %>/templates/*/*.pot'],
        },
      ],
    },
  });

  function stripSpecialChars(str) {
    str = str.replace(/'/g, '"');
    return str.replace(/(\\)/g, '');
  }

  function returnId(str) {
    str = stripSpecialChars(str);
    return str.replace(/(?:<a).*id=/, '');
  }
};
