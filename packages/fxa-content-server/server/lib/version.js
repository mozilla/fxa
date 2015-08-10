/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Return version info based on package.json, the git sha, and source repo
 *
 * Try to statically determine commitHash, sourceRepo, l10nVersion, and
 * tosPpVersion at startup.
 *
 * If l10nVersion and tosPpVersion cannot be loaded statically from the
 * content in ../../app/bower_components, then just show UNKNOWN.
 *
 * If commitHash cannot be found from ./config/version.json (i.e., this is not
 * production or stage), then an attempt will be made to determine commitHash
 * and sourceRepo dynamically from `git`. If it cannot be found with `git`,
 * just show UNKNOWN for commitHash and sourceRepo.
 *
 */

var cp = require('child_process');
var Promise = require('bluebird');
var logger = require('mozlog')('server.version');

const UNKNOWN = 'unknown';

var versionJsonPath = '../../config/version.json';

function getPkgVersion () {
  return require('../../package.json').version;
}

// commitHash and sourceRepo
function getCommitHash () {
  try {
    var versionInfo = require(versionJsonPath);
    var ver = versionInfo.version;
    return ver.hash;
  } catch(e) {
    /* ignore, shell out to `git` for hash */
  }

  var deferred = Promise.defer();

  cp.exec('git rev-parse HEAD', function (err, stdout) {
    if (err) {
      // ignore the error
      deferred.resolve(UNKNOWN);
      return;
    }

    deferred.resolve((stdout && stdout.trim()) || UNKNOWN);
  });

  return deferred.promise;
}

function getSourceRepo () {
  try {
    var versionInfo = require(versionJsonPath);
    var ver = versionInfo.version;
    return ver.source;
  } catch(e) {
    /* ignore, shell out to `git` for repo */
  }

  var deferred = Promise.defer();
  cp.exec('git config --get remote.origin.url', function (err, stdout) {
    if (err) {
      // ignore the error
      deferred.resolve(UNKNOWN);
      return;
    }
    deferred.resolve((stdout && stdout.trim()) || UNKNOWN);
  });

  return deferred.promise;
}

function getL10nVersion () {
  try {
    var bowerPath = '../../app/bower_components/fxa-content-server-l10n/.bower.json';
    var bowerInfo = require(bowerPath);
    return bowerInfo && bowerInfo._release;
  } catch(e) {
    /* ignore */
  }
}

function getTosPpVersion () {
  try {
    var bowerPath = '../../app/bower_components/tos-pp/.bower.json';
    var bowerInfo = require(bowerPath);
    return bowerInfo && bowerInfo._release;
  } catch(e) {
    /* ignore */
  }
}


var versionPromise;
function getVersionInfo() {
  if (! versionPromise) {
    // only fetch version info if it has not already been fetched.
    versionPromise = Promise.all([
      getSourceRepo(),
      getPkgVersion(),
      getCommitHash(),
      getL10nVersion(),
      getTosPpVersion()
    ]).spread(function (sourceRepo, pkgVersion, commitHash, l10nVersion, tosPpVersion) {
      logger.info('source set to: ' + sourceRepo);
      logger.info('version set to: ' + pkgVersion);
      logger.info('commit hash set to: ' + commitHash);
      logger.info('fxa-content-server-l10n commit hash set to: ' + l10nVersion);
      logger.info('tos-pp (legal-docs) commit hash set to: ' + tosPpVersion);

      return {
        source: sourceRepo,
        version: pkgVersion,
        commit: commitHash,
        l10n: l10nVersion,
        tosPp: tosPpVersion
      };
    });
  }

  return versionPromise;
}

getVersionInfo();

exports.process = function (req, res) {
  getVersionInfo()
    .then(function (versionInfo) {
      // charset must be set on json responses.
      res.charset = 'utf-8';
      res.json(versionInfo);
    });
};
