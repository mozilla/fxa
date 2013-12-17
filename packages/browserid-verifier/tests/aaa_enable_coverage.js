// enable coverage, but exclude test files
if (!process.env.NO_COVERAGE) {
  require('ass').enable({ exclude: __dirname });
}
