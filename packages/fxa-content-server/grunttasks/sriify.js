/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var findCacheBustingPath = require('./lib/find-cache-busting-path');
var requireConfig = require('../app/scripts/require_config');
var url = require('url');

module.exports = function (grunt) {
  function normalizeSriDirectives(sriDirectives) {
    var normalized = {};

    Object.keys(sriDirectives).forEach(function (key) {
      var cleanedKey = key.replace(/@?dist/, '');
      normalized[cleanedKey] = sriDirectives[key];
    });

    return normalized;
  }

  function addSriAttributesToResourceElements(directives, html) {
    return html.replace(/(?:src|href)="([^"]*)"/gi, function (match, resourceUrl) {
      var parsedUrl = url.parse(resourceUrl);
      var directive = directives[parsedUrl.pathname];
      if (directive) {
        return match + ' integrity="' + directive.integrity + '" crossorigin="anonymous"' ;
      }

      return match;
    });
  }

  function updateHtmlWithSriAttributes(directives, src) {
    var html = grunt.file.read(src);

    var htmlWithIntegrity = addSriAttributesToResourceElements(directives, html);

    if (html !== htmlWithIntegrity) {
      grunt.log.writeln('Adding SRI directives to', src);
      grunt.file.write(src, htmlWithIntegrity);
    }
  }

  function cacheBustingPathToDirectiveKey(cacheBustingPath) {
    // directive keys are relative to the `dist` subdirectory directory.
    // cacheBustingPaths are relative to `dist/scripts`. Normalize to
    // the directive's key.
    if (cacheBustingPath.indexOf('../bower_components') === 0) {
      return cacheBustingPath.replace(/^\.\./, '');
    }

    // everything else is in the scripts subdirectory
    return '/scripts/' + cacheBustingPath;
  }

  function addSriHashToRequireConfig(directives, js) {
    // Create a replacement `sriConfig` section for require_config.
    //
    // For each module listed in require_config.requireOnDemand,
    // find the SRI hash for the module. Replace the existing
    // `sriConfig` value with the generated list.
    var cacheBustingPathToSriValue = {};
    requireConfig.requireOnDemand.forEach(function (moduleName) {
      var modulePath = requireConfig.paths[moduleName] + '.js';
      var cacheBustingPath = findCacheBustingPath(grunt, modulePath);
      var directiveKey = cacheBustingPathToDirectiveKey(cacheBustingPath);

      var directive = directives[directiveKey];
      if (directive) {
        cacheBustingPathToSriValue[moduleName] = directive.integrity;
      } else {
        throw new Error('Could not get SRI hash for' + moduleName);
      }
    });

    return js
      .replace(/sriConfig:\s?{}/, 'sriConfig:' + JSON.stringify(cacheBustingPathToSriValue));
  }

  function updateJsWithSriAttributes(directives, src) {
    var js = grunt.file.read(src);
    var jsWithIntegrity = addSriHashToRequireConfig(directives, js);

    if (js !== jsWithIntegrity) {
      grunt.log.writeln('Adding requireOnDemand SRI hashes to', src);
      grunt.file.write(src, jsWithIntegrity);
    }
  }

  grunt.registerMultiTask('sri-update-html', 'Update HTML with SRI attributes', function () {
    // open each HTML file
    // look for src, href
    // look up url in sri table
    // if url in sri table, insert integrity tag
    // write HTML file if any changes to file

    var options = this.options({});
    var sriDirectives = normalizeSriDirectives(grunt.file.readJSON(options.directives));

    this.filesSrc.forEach(
      updateHtmlWithSriAttributes.bind(null, sriDirectives));
  });

  grunt.config('sri-update-html', {
    options: {
      directives: '<%= yeoman.tmp %>/sri-directives.json'
    },
    dist: { //eslint-disable-line sorting/sort-object-props
      src: [
        '<%= yeoman.page_template_dist %>/**/*.html'
      ]
    }
  });

  grunt.registerMultiTask('sri-update-js', 'Update require_config with SRI hashes', function () {
    // replace `sriConfig: {}` in require_config.js with a list
    // of SRI hashes for the list of resources specified in `requireOnDemand`.
    var options = this.options({});
    var sriDirectives = normalizeSriDirectives(grunt.file.readJSON(options.directives));

    this.filesSrc.forEach(
      updateJsWithSriAttributes.bind(null, sriDirectives));
  });

  grunt.config('sri-update-js', {
    options: {
      directives: '<%= yeoman.tmp %>/sri-directives.json'
    },
    dist: { //eslint-disable-line sorting/sort-object-props
      src: [
        // the .* is to handle the country code prefix.
        // The filenames do not yet have the md5 prefix
        '<%= yeoman.dist %>/scripts/main.*.js'
      ]
    }
  });

  grunt.config('sri', {
    options: {
      algorithms: [ 'sha512' ],
      dest: '<%= yeoman.tmp %>/sri-directives.json'
    },
    dist: { //eslint-disable-line sorting/sort-object-props
      src: [
        '<%= yeoman.dist %>/**/*.css',
        '<%= yeoman.dist %>/**/*.js',
      ]
    }
  });

  grunt.registerTask('sriify', 'Add SRI integrity attributes to static resources', function (subtaskName) {
    // sri is run twice. The first time to find the sri hashes for
    // the resources embedded in main.js. This will modify main.js
    // so sri must be called again to find the final sri value for
    // main.js in the html.
    if (subtaskName === 'js') {
      grunt.task.run('sri', 'sri-update-js');
    } else if (subtaskName === 'html') {
      grunt.task.run('sri', 'sri-update-html');
    }
  });
};
