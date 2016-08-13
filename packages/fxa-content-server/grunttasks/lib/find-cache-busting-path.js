/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


var path = require('path');

/**
 * Find the cache busting variant of the given filename
 *
 * @param {Object} grunt
 * @param {String} filename - file to find the cache busting variant.
 * @returns {String}
 */
module.exports = function (grunt, filename) {
  var dirname = path.dirname(filename);
  var basename = path.basename(filename);

  // Sources with cache busting URLs have the form of:
  // <root_dir>/<md5hash>.<basename>
  var globToFind = dirname + '/*.' + basename;
  var matches = grunt.file.expand({
    // Using <%= yeoman.dist %> always failed here, which leads
    // to a hard coded path. :(
    cwd: 'dist/scripts'
  }, globToFind);

  return matches[0] || filename;
};

