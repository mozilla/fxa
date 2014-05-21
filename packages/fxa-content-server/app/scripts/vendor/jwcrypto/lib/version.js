define(function(require,module,exports){
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// tracking the version number in a separate location so we
// don't have circular dependencies.

var SUPPORTED_DATA_FORMATS = ['2012.08.15', ''];

// XXX - upgrade this to 2012.08.15 when we're ready
var DEFAULT_DATA_FORMAT_VERSION = '';
var DATA_FORMAT_VERSION = DEFAULT_DATA_FORMAT_VERSION;

exports.setDataFormatVersion = function(version) {
  if (version === undefined) {
    version = DEFAULT_DATA_FORMAT_VERSION;
  }

  if (SUPPORTED_DATA_FORMATS.indexOf(version) === -1) {
    throw new Error("no such version " + version + ", only supported versions are " + SUPPORTED_DATA_FORMATS.join(","));
  }

  DATA_FORMAT_VERSION = version;
};

exports.getDataFormatVersion = function() {
  return DATA_FORMAT_VERSION;
};

// this immediately dispatches to the versioned function based on
// the indicated version
function dispatchOnDataFormatVersion(obj, coreFunctionName, version) {
  var currentVersionString = version || 'LEGACY';
  currentVersionString = currentVersionString.replace(/\./g, '');
  var methodName = "_" + currentVersionString + "_" + coreFunctionName;

  if (!obj[methodName]) {
    console.log(obj);
    throw new Error("object has no method called " + methodName);
  }

  // invoke
  return obj[methodName].apply(obj, Array.prototype.slice.call(arguments).slice(3));
}

// this creates a function that dispatches to the versioned function,
// based on the version number that the library is set to
function versionDispatcher(coreFunctionName) {
  return function() {
    dispatchOnDataFormatVersion.apply(null, Array.prototype.concat([this, coreFunctionName, exports.getDataFormatVersion()], Array.prototype.slice.call(arguments)));
  };
}

exports.dispatchOnDataFormatVersion = dispatchOnDataFormatVersion;
exports.versionDispatcher = versionDispatcher;
return exports;
});

