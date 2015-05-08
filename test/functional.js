var startSelenium = require('./lib/start-selenium');
var argv = require('minimist')(process.argv.slice(2));

var chalk = require('chalk');

startSelenium(function (selenium) {
  var suiteType = 'tests/intern_functional_full';

  if (argv.suite === 'oauth') {
    suiteType = 'tests/intern_functional_oauth';
  }

  if (argv.suite === 'core') {
    suiteType = 'tests/intern_functional';
  }

  var COMMAND = 'node_modules/.bin/intern-runner';
  var WORK_DIR = 'fxa-content-server';
  var ARGS = ['config=' + suiteType];

  var spawn = require('child_process').spawn;
  console.log(chalk.green('Running:', COMMAND, ARGS));
  var tests = spawn(COMMAND, ARGS, {
    cwd: WORK_DIR
  });

  tests.stdout.on('data', function (data) {
    process.stdout.write(chalk.green(data));
  });

  tests.stderr.on('data', function (data) {
    process.stdout.write(chalk.red(data));
  });

  tests.on('close', function () {
    console.log(chalk.green('Intern tests shut down...'));
  });

  function exit() {
    console.log(chalk.green('Stopping Selenium...'));
    selenium.kill();
  }

  process.on('SIGINT', exit);
  process.on('SIGTERM', exit);
});
