// Direct from the grunt-mocha docs at
// https://github.com/pghalliday/grunt-mocha-test#generating-coverage-reports

var path = require('path');
var srcDir = path.join(__dirname, '../..', 'lib');

require('blanket')({
  pattern: srcDir
});
