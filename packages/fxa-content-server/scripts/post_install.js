var env = process.env.NODE_ENV;
var exec = require('child_process').exec;

if (env === 'production') {
  process.exit(0);
}

exec('cp node_modules/grunt-blanket-mocha/support/* app/bower_components/blanket/src',
  function (error) {
    if (error) throw error;
    process.exit(0);
  });
