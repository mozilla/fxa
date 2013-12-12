define([
  './intern'
], function (intern) {
  'use strict';

  intern.suites = [];
  intern.functionalSuites = [ 'tests/functional' ];

  return intern;
});
