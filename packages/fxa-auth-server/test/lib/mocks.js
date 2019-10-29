/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path');
const proxyquire = require('proxyquire');

module.exports = {
  require: requireDependencies,
  log: mockLog,
};

// `mocks.require`
//
// Require dependencies using the same path that is specified in the module
// under test.
//
// Returns an object containing dependencies keyed by their path.
//
// Expects three arguments; `dependencies`, `modulePath` and `basePath`.
//
// dependencies: Array of { path, ctor } items.
//               path: The dependency path, as specified in the module
//                     under test.
//               ctor: Optional. If the dependency is a constructor for
//                     an instance that you wish to mock, set this to a
//                     function that returns your mock instance.
// modulePath:   The relative path to the module under test.
// basePath:     The base path, i.e. __dirname for the test itself.
function requireDependencies(dependencies, modulePath, basePath) {
  var result = {};

  dependencies.forEach(function(dependency) {
    result[dependency.path] = requireDependency(
      dependency,
      modulePath,
      basePath
    );
  });

  return result;
}

function requireDependency(dependency, modulePath, basePath) {
  if (typeof dependency.ctor === 'function') {
    return dependency.ctor;
  }

  if (dependency.path[0] !== '.') {
    return proxyquire(dependency.path, {});
  }
  const moduleUnderTest = require.resolve(modulePath, { paths: [basePath] });
  const dependencyPath = require.resolve(dependency.path, {
    paths: [path.dirname(moduleUnderTest)],
  });
  return proxyquire(dependencyPath, {});
}

function mockLog(logger, cb) {
  var root = require('../../lib/oauth/logging')();
  var log = require('../../lib/oauth/logging')(logger);
  var filter = {
    filter: function(record) {
      if (cb(record)) {
        log.removeFilter(filter);
        log.setLevel(root.getEffectiveLevel());
        return false;
      }
      return true;
    },
  };
  log.addFilter(filter);
}
