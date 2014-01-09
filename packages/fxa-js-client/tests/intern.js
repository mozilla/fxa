// Learn more about configuring this file at <https://github.com/theintern/intern/wiki/Configuring-Intern>.
// These default settings work OK for most people. The options that *must* be changed below are the
// packages, suites, excludeInstrumentation, and (if you want functional tests) functionalSuites.
define({

  loader: {
    // Packages that should be registered with the loader in each testing environment
    packages: [ { name: 'fxa-js-client', location: 'client' } ]
  },

  suites: [ 'tests/all' ],
  functionalSuites: [ ],
  SERVER: typeof process !== 'undefined' ? process.env.SERVER : undefined,

  excludeInstrumentation: /(?:.)\//

});
