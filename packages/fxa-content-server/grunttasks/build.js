/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  grunt.registerTask('build', [
    // Clean files and folders from any previous build
    'clean',
    'githash',

    // Select 'dist' configuration files for the running environment.
    'selectconfig:dist',

    // l10n-generate-pages needs to be run before useminPrepare to seed
    // the list of resources to minimize. Generated pages are placed into
    // `server/templates/pages/dist` where they will be post-processed
    // with requirejs and usemin
    'l10n-generate-pages',

    // prepares the configuration to transform specific blocks
    // in the scrutinized file into a single line, targeting an optimized version of the files.
    'useminPrepare',

    // Compile ES2015 to ES5
    'babel',

    // Copy ES5 files to prepare for requirejs
    'copy:requirejs',

    // Runs r.js optimizer on the application files
    'requirejs',

    // Adds requirejs to the generated r.js bundle
    'concat:requirejs',

    // general 'css' tasks:
    //    'sass', - compile SASS,
    //    'autoprefixer' - auto prefix CSS for many browsers,
    //    'connect_fonts' - generate CSS files for connect-fonts compatible font packs.
    'css',

    // 'copy:styles',
    //  'connect_fonts_copy', - copy the generated connect fonts
    'concurrent:dist',

    // concatenate files as part of the useminPrepare task
    'concat',

    // compress CSS files
    'cssmin',

    // copy all static resources from 'app' to 'dist'
    'copy:dist',
    'copy:require_on_demand',

    'uglify',

    // rev leaf nodes in the dependency tree. Leaf nodes are revved first
    // so the URLs to leaf nodes in internal nodes can be updated. Internal
    // nodes are revved after the URLs have been updated.
    'rev:no_children',

    // Update child requireOnDemand URLs in the main JS bundle.
    'replace:require_on_demand',

    // Add subresource integrity values of dependent resources
    // to the main JS bundle.
    'sriify:js',

    // Update leaf node font and image URLs in the CSS bundle.
    'usemin:css',

    // URLs inside the resources with children have been updated
    // and SRI hashes added to the main JS bundle. These files
    // are in their final state and can now be revved.
    'rev:with_children',

    // replaces blocks in the HTML by the final rev of the inodes.
    'usemin:html',

    // update the HTML with the SRI value of the final JS bundle.
    'sriify:html',

    // copy the non-minified main.js script file for sourcemap purposes
    'copy:build',
    // copy the non-minified head.js script file for sourcemap purposes
    'copy:head',
    // update the sourcemap path to match the hosted files
    'sourcemap-source',

    // Add FQDN to static resources referenced in the HTML so resources
    // can be deployed to a CDN.
    'cdnify',

    // Remove whitespace from the HTML
    'htmlmin',

    // use error pages from en as the static error pages. Comes last
    // to ensure static resources are loaded using cache busting URLs
    'copy:error_pages'
  ]);
};
