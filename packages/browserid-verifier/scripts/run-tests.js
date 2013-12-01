var temp  = require('temp'),
    spawn = require('child_process').spawn,
    path  = require('path'),
    fs    = require('fs');

// first we'll create a directory for aggregating coverage data
temp.mkdir("verifier-coverage-data", function(err, dn) {
  if (err) throw new Error(err);

  // convey the directory to child processes
  process.env.REPORT_COVERAGE_DIR = dn;

  // execute all tests
  var p = spawn(
    process.env._,
    [
      path.join(__dirname, '..', 'node_modules', '.bin', 'mocha'),
      '-R',
      'spec',
      'tests/*.js'
    ],
    {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });

  p.on('exit', function(err, code) {
    // now let's generate coverage data
    var p = spawn(
      process.env._,
      [
        path.join(__dirname, '..', 'node_modules', '.bin', 'mocha'),
        '-R',
        'html-cov',
        'scripts/calculate_coverage.js'
      ],
      {
        cwd: path.join(__dirname, '..'),
        stdio: 'pipe'
      });
    var html = "";
    p.stdout.on('data', function(data) {
      html += data;
    });
    p.on('exit', function(err, code) {
      // write coverage report
      fs.writeFileSync('coverage.html', html);
      // extract %age
      var m = /<div\s*class="percentage">(\d+%)<\/div>/.exec(html);
      console.log(m[1], 'code coverage (see coverage.html)');
    });
  });
});
