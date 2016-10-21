var selenium = require('selenium-standalone');
var chalk = require('chalk');

module.exports = function (cb) {
  selenium.install({
    version: '2.53.0',
    drivers: {},
    logger: function(message) {
      process.stdout.write(chalk.green(message));
    }
  }, function (err) {
    if (err) { throw err; }
    selenium.start({
      version: '2.53.0'
    },function (err, cp) {
      if (err) {
        if (err.message && err.message === 'Another Selenium process is already running') {
          console.log('Did not start Selenium, already running..');
        } else {
          throw err;
        }
      } else {
        console.log('Started Selenium');
      }

      cb(cp);
    });
  });
};
