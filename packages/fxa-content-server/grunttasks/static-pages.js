/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path');
const Handlebars = require('handlebars');

module.exports = function (grunt) {
  'use strict';

  Handlebars.registerHelper('t', function(str) {
    return (str && str.fn) ? str.fn() : str;
  });

  // Map templates to their output file
  var templates = {
    '500.html': '500.html',
    '503.html': '503.html'
  };

  var basePath = path.resolve(__dirname, '..');

  grunt.registerTask('static-pages', 'Compile static pages', function () {
    var templateDir = grunt.config().yeoman.page_template_src;
    var outputDir = grunt.config().yeoman.app;

    var files = Object.keys(templates);
    files.forEach(function (file) {
      var source = grunt.file.read(path.join(basePath, templateDir, file));
      var template = Handlebars.compile(source);
      var out = template();
      grunt.file.write(path.join(basePath, outputDir, templates[file]), out);
    });
    grunt.log.write('Wrote ' + files.length + ' files');
  });

};

