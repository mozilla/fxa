/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  grunt.config('localeschema', {
    app: {
      files: [
        {
          '<%= yeoman.tmp %>/i18n/schemas/client-schema.json':
            '<%= yeoman.tmp %>/i18n/templates/client.pot.json',
          '<%= yeoman.tmp %>/i18n/schemas/server-schema.json':
            '<%= yeoman.tmp %>/i18n/templates/server.pot.json',
        },
      ],
    },
  });

  grunt.registerMultiTask(
    'localeschema',
    'Create a JSON schema file from the template .pot file.',
    function () {
      this.files.forEach(function (file) {
        var src = file.orig.src[0];
        var dest = file.dest;
        var schema = createSchema(src);

        grunt.file.write(dest, JSON.stringify(schema, null, 2));
        grunt.log.writeln('%s schema created', dest);
      });
    }
  );

  function createSchema(file) {
    var data = grunt.file.readJSON(file);
    var keys = Object.keys(data).sort();
    var schema = {
      properties: {},
      required: keys,
    };

    keys.forEach(function (key) {
      var value = data[key];
      schema.properties[key] = { type: typeof value };
    });
    return schema;
  }
};
