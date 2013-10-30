// Learn more about configuring this file at <https://github.com/theintern/intern/wiki/Configuring-Intern>.
// These default settings work OK for most people. The options that *must* be changed below are the
// packages, suites, excludeInstrumentation, and (if you want functional tests) functionalSuites.
define({
  proxyPort: 9000,
  proxyUrl: 'http://localhost:9000/',
  capabilities: {
    'selenium-version': '2.35.0'
  },
  environments: [
    { browserName: 'firefox', version: '23', platform: [ 'Linux', 'Windows 7' ] },
    { browserName: 'chrome', platform: [ 'Linux', 'Mac 10.8', 'Windows 7' ] },
    { browserName: 'safari', version: '6', platform: 'Mac 10.8' }
  ],
  maxConcurrency: 3,
  useSauceConnect: true,

  // Connection information for the remote WebDriver service. If using Sauce Labs, keep your username and password
  // in the SAUCE_USERNAME and SAUCE_ACCESS_KEY environment variables unless you are sure you will NEVER be
  // publishing this configuration file somewhere
  webdriver: {
    host: 'localhost',
    port: 4444
  },

  loader: {
    // Packages that should be registered with the loader in each testing environment
    packages: [ { name: 'gherkin', location: 'gherkin' } ]
  },

  suites: [ 'tests/main' ],
  functionalSuites: [ /* 'myPackage/tests/functional' */ ],

  // A regular expression matching URLs to files that should not be included in code coverage analysis
  excludeInstrumentation: /^tests\//
});
