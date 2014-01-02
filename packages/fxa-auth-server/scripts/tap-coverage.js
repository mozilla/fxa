#!/usr/bin/env node

if (!process.env.NO_COVERAGE) {
  var ass = require('ass').enable( {
    // exclude files in /client/ and /test/ from code coverage
    exclude: [ '/client/', '/test' ]
  });
}

var path = require('path'),
spawn = require('child_process').spawn,
fs = require('fs');

var p = spawn(path.join(path.dirname(__dirname), 'node_modules', '.bin', 'tap'),
              process.argv.slice(2), { stdio: 'inherit' });

p.on('close', function(code) {
  if (!process.env.NO_COVERAGE) {
    ass.report('json', function(err, r) {
      console.log("code coverage:", r.percent + "%");
      process.stdout.write("generating coverage.html: ");
      var start = new Date();
      ass.report('html', function(err, html) {
        fs.writeFileSync(path.join(path.dirname(__dirname), 'coverage.html'),
                         html);
        process.stdout.write("complete in " +
                             ((new Date() - start) / 1000.0).toFixed(1) + "s\n");
        process.exit(code);
      });
    });
  } else {
    process.exit(code);
  }
});
