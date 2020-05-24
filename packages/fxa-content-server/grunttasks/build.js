/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  grunt.registerTask('build', [
    // Clean files and folders from any previous build
    'clean',

    // Select 'dist' configuration files for the running environment.
    'selectconfig:dist',

    'webpack',

    // l10n-generate-pages needs to be run before useminPrepare to seed
    // the list of resources to minimize. Generated pages are placed into
    // `server/templates/pages/dist` where they will be post-processed
    // with usemin
    'l10n-generate-pages',

    // prepares the configuration to transform specific blocks
    // in the scrutinized file into a single line, targeting an optimized version of the files.
    'useminPrepare',

    'copy:styles',

    // concatenate the CSS & JS not processed by webpack. Must be before cssmin or else
    // cssmin creates empty output.
    'concat',

    // compress CSS files
    'cssmin',

    // copy all static resources from 'app' to 'dist'
    'copy:dist',

    // generate localized js bundles. Done after the uglification step
    // to drastically shorten the build time. If translations are inserted
    // and then uglify is run, uglify has to run 40+ times, whereas this way
    // uglify only runs once.
    'l10n-localize-js',

    // rev leaf nodes in the dependency tree. Leaf nodes are revved first
    // so the URLs to leaf nodes in internal nodes can be updated. Internal
    // nodes are revved after the URLs have been updated.
    'rev:no_children',

    // Update leaf node font and image URLs in the CSS bundle.
    'usemin:css',

    // URLs inside the resources with children have been updated
    // and SRI hashes added to the main JS bundle. These files
    // are in their final state and can now be revved.
    'rev:with_children',

    // update the HTML pages to request localized JavaScript
    'l10n-use-localized-js',

    // replaces blocks in the HTML by the final rev of the inodes.
    'usemin:html',

    // update the HTML with the SRI value of the final JS bundle.
    'sriify:html',

    // Add FQDN to static resources referenced in the HTML so resources
    // can be deployed to a CDN.
    'cdnify',

    // Remove whitespace from the HTML
    'htmlmin',

    // make a copy with necessary tweaks for Mozilla Online's deployment
    'copy:mozillaonline',

    // use error pages from en as the static error pages. Comes last
    // to ensure static resources are loaded using cache busting URLs
    'copy:error_pages',
  ]);
};
