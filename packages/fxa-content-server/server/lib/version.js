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
var logger = require('mozlog')('server.version');

var pkgVersion = require('../../package.json').version;

const UNKNOWN = 'unknown';

var commitHash;
var sourceRepo;
var l10nVersion = UNKNOWN;
var tosPpVersion = UNKNOWN;

// commitHash and sourceRepo
(function () {
  try {
    var versionJsonPath = '../../config/version.json';
    var versionInfo = require(versionJsonPath);
    var ver = versionInfo.version;
    commitHash = ver.hash;
    sourceRepo = ver.source;
    if (commitHash) {
      logger.info('source set to: %s', sourceRepo);
      logger.info('commit hash set to: %s', commitHash);
    }
  } catch(e) {
    /* ignore */
  }
})();

// l10nVersion
(function () {
  try {
    var bowerPath = '../../app/bower_components/fxa-content-server-l10n/.bower.json';
    var bowerInfo = require(bowerPath);
    l10nVersion = bowerInfo && bowerInfo._release;
  } catch(e) {
    /* ignore */
  }
})();

// tosPpVersion
(function () {
  try {
    var bowerPath = '../../app/bower_components/tos-pp/.bower.json';
    var bowerInfo = require(bowerPath);
    tosPpVersion = bowerInfo && bowerInfo._release;
  } catch(e) {
    /* ignore */
  }
})();


(function getCommitHashFromGit() {
  // Only if we haven't figured out the value of commitHash,
  // try to read commitHash and sourceRepo with `git`.
  if (commitHash) {
    return;
  }

  // ignore errors and default to UNKNOWN if not found
  cp.exec('git rev-parse HEAD', function (err, stdout1) {
    cp.exec('git config --get remote.origin.url', function (err, stdout2) {
      commitHash = (stdout1 && stdout1.trim()) || UNKNOWN;
      sourceRepo = (stdout2 && stdout2.trim()) || UNKNOWN;
      logger.info('source set to: %s', sourceRepo);
      logger.info('commit hash set to: %s', commitHash);
    });
  });
})();

logger.info('version set to: %s', pkgVersion);
logger.info('fxa-content-server-l10n commit hash set to: %s', l10nVersion);
logger.info('tos-pp (legal-docs) commit hash set to: %s', tosPpVersion);

exports.process = function (req, res) {
  var versionInfo = {
    source: sourceRepo,
    version: pkgVersion,
    commit: commitHash,
    l10n: l10nVersion,
    tosPp: tosPpVersion
  };

  // charset must be set on json responses.
  res.charset = 'utf-8';
  res.json(versionInfo);
};
