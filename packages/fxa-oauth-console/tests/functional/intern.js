define({
  functionalSuites: [ 'tests/functional/all' ],
  environments: [
    { browserName: 'firefox' }
  ],
  pageLoadTimeout: 10000,
  excludeInstrumentation: /./
});
