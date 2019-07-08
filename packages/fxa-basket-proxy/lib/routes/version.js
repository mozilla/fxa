/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Return version info based on package.json, the git sha, and source repo
 *
 * Try to statically determine commitHash, sourceRepo at startup.
 *
 * If commitHash cannot be found from ./config/version.json (i.e., this is not
 * production or stage), then an attempt will be made to determine commitHash
 * and sourceRepo dynamically from `git`. If it cannot be found with `git`,
 * just show UNKNOWN for commitHash and sourceRepo.
 *
 */

var cp = require('child_process');
var path = require('path');
var Promise = require('bluebird');
var logger = require('../logging')('routes.version');

var UNKNOWN = 'unknown';

var versionJsonPath = '../../config/version.json';

function getPkgVersion() {
  return require('../../package.json').version;
}

function getCommitHash() {
  try {
    var versionInfo = require(versionJsonPath);
    var ver = versionInfo.version;
    return ver.hash;
  } catch (e) {
    /* ignore, shell out to `git` for hash */
  }

  var deferred = Promise.defer();

  var gitDir = path.resolve(__dirname, '..', '..', '.git');
  cp.exec('git rev-parse HEAD', { cwd: gitDir }, function(err, stdout) {
    if (err) {
      // ignore the error
      deferred.resolve(UNKNOWN);
      return;
    }

    deferred.resolve((stdout && stdout.trim()) || UNKNOWN);
  });

  return deferred.promise;
}

function getSourceRepo() {
  try {
    var versionInfo = require(versionJsonPath);
    var ver = versionInfo.version;
    return ver.source;
  } catch (e) {
    /* ignore, shell out to `git` for repo */
  }

  var deferred = Promise.defer();

  var gitDir = path.resolve(__dirname, '..', '..', '.git');
  var configPath = path.join(gitDir, 'config');
  var cmd = 'git config --get remote.origin.url';
  cp.exec(cmd, { env: { GIT_CONFIG: configPath } }, function(err, stdout) {
    if (err) {
      // ignore the error
      deferred.resolve(UNKNOWN);
      return;
    }
    deferred.resolve((stdout && stdout.trim()) || UNKNOWN);
  });

  return deferred.promise;
}

var versionPromise;
function getVersionInfo() {
  if (!versionPromise) {
    // only fetch version info if it has not already been fetched.
    versionPromise = Promise.all([
      getSourceRepo(),
      getPkgVersion(),
      getCommitHash(),
    ]).spread(function(sourceRepo, pkgVersion, commitHash) {
      logger.info('source set to', sourceRepo);
      logger.info('version set to', pkgVersion);
      logger.info('commit hash set', commitHash);
      return {
        version: pkgVersion,
        commit: commitHash,
        source: sourceRepo,
      };
    });
  }

  return versionPromise;
}

getVersionInfo();

module.exports = function(req, res) {
  getVersionInfo().then(function(versionInfo) {
    // charset must be set on json responses.
    res.charset = 'utf-8';
    res.type('json').send(JSON.stringify(versionInfo, null, 2) + '\n');
  });
};
