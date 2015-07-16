/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path');
const proxyquire = require('proxyquire');
const m = require('module');

var moduleCache;

module.exports = {
  require: requireDependencies,
  register: registerDependencies,
  deregister: deregisterDependencies
};

// `mocks.require`
//
// Require dependencies using the same path that is specifed in the module
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

  dependencies.forEach(function (dependency) {
    result[dependency.path] = requireDependency(dependency, modulePath, basePath);
  });

  return result;
}

function requireDependency(dependency, modulePath, basePath) {
  if (typeof dependency.ctor === 'function') {
    return dependency.ctor;
  }

  var localPath = dependency.path;

  if (localPath[0] === '.') {
    localPath = path.relative(
      basePath,
      path.resolve(basePath, modulePath, localPath)
    );
  }

  return require(localPath);
}

// `mocks.register`
//
// Register mock dependencies, fixing paths as we go so that it works
// with the blanket coverage tool (which rewrites require paths in the
// instrumented code). You should call this function inside beforeEach.
//
// Expects three arguments; `dependencies`, `modulePath` and `basePath`.
//
// dependencies: An object, where keys are dependency paths and values
//               are mock objects. This argument is typically the return
//               value from `mocks.require`, modified by sinon for your
//               tests.
// modulePath:   The relative path to the module under test.
// basePath:     The base path, i.e. __dirname for the test itself.
function registerDependencies(dependencies, modulePath, basePath) {
  var instrumentedDependencies = {};

  clearModuleCache();

  Object.keys(dependencies).forEach(function(dependencyPath) {
    var instrumentedPath = getInstrumentedPath(dependencyPath, modulePath, basePath);
    instrumentedDependencies[instrumentedPath] = dependencies[dependencyPath];
  });

  proxyquire(modulePath, instrumentedDependencies);
}

function clearModuleCache() {
  moduleCache = m._cache;
  m._cache = {};
}

function getInstrumentedPath(dependencyPath, modulePath, basePath) {
  if (dependencyPath[0] !== '.') {
    return dependencyPath;
  }

  return path.resolve(basePath, modulePath) + '/' + dependencyPath;
}

// `mocks.deregister`
//
// Deregister mock dependencies. You should call this function
// inside afterEach.
function deregisterDependencies() {
  if (moduleCache) {
    m._cache = moduleCache;
    moduleCache = null;
  }
}

