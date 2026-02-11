/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  grunt.registerTask(
    'cdnify',
    'Prepare static resources for CDN deployment',
    function () {
      grunt.config('cdn', {
        options: {
          // That's right, a Handlebars variable entry is written in, the server
          // will render the correct details. This is done so the same built
          // templates can be used on both stage and prod.
          cdn: '{{{ staticResourceUrl }}}',
        },
        pages: {
          cwd: '<%= yeoman.page_template_dist %>',
          dest: '<%= yeoman.page_template_dist %>',
          src: [
            '**/*.html',
            // The 502 and 503 pages are served by nginx and cannot do
            // variable interpolation to replace staticResourceUrl with
            // the FQDN.
            '!**/502.html',
            '!**/503.html',
          ],
        },
      });

      // Only add FQDN to static resources referenced from the HTML
      // files. Resources referenced in the CSS are relative to the CSS
      // file's origin, which is the CDN. No need to update those.
      grunt.task.run('cdn:pages');
    }
  );
};
