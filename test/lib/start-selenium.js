var selenium = require('selenium-standalone');
var chalk = require('chalk');

module.exports = function (cb) {
  selenium.install({
    version: '2.45.0',
    drivers: {},
    logger: function(message) {
      process.stdout.write(chalk.green(message));
    }
  }, function (err) {
    if (err) { throw err; }
    selenium.start(function (err, child) {
      if (err) { throw err; }

      console.log(chalk.green('Selenium started or already running...'));
      cb(child);
    });
  });
};
