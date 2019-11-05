/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var isBlockBelow = function(config, reputation) {
  return reputation > 0 && reputation < config.reputationService.blockBelow;
};

var isSuspectBelow = function(config, reputation) {
  return reputation > 0 && reputation < config.reputationService.suspectBelow;
};

var alwaysFalse = function() {
  return false;
};

function getRequestTime(result) {
  if (! (result && result.timingPhases && result.timingPhases.total)) {
    return 0;
  }
  var ret = Number.parseFloat(result.timingPhases.total).toFixed(2);
  if (isNaN(ret)) {
    return 0;
  }
  return ret;
}

var report = function(log, ipClient, ip, action) {
  return ipClient
    .sendViolation(ip, action)
    .then(function(result) {
      var statusCode = result && result.statusCode;
      log.info({
        op: action + '.sendViolation',
        ip: ip,
        statusCode: statusCode,
        rtime: getRequestTime(result),
      });
    })
    .catch(function(err) {
      log.error({ op: action + '.sendViolation', ip: ip, err: err });
    });
};

var get = function(log, ipClient, ip) {
  return ipClient
    .get(ip)
    .then(function(response) {
      if (response && response.body && response.statusCode === 200) {
        log.info({
          op: 'fetchIPReputation',
          ip: ip,
          reputation: response.body.reputation,
          rtime: getRequestTime(response),
        });
        return response.body.reputation;
      }

      if (response.statusCode === 404) {
        log.info({
          op: 'fetchIPReputation',
          ip: ip,
          err: 'Reputation not found for IP.',
          rtime: getRequestTime(response),
        });
      } else {
        log.error({
          err: response.body,
          ip,
          op: 'fetchIPReputation',
          rtime: getRequestTime(response),
          statusCode: response.statusCode,
        });
      }

      return null;
    })
    .catch(function(err) {
      log.error({ op: 'fetchIPReputation', ip: ip, err: String(err) });
      return null;
    });
};

module.exports = function(config, log) {
  var mod = {
    isBlockBelow: alwaysFalse,
    isSuspectBelow: alwaysFalse,
    report: alwaysFalse,
    get: alwaysFalse,
  };
  if (config.reputationService.enable) {
    var IPReputationClient = require('ip-reputation-js-client');
    var ipClient = new IPReputationClient({
      serviceUrl: config.reputationService.baseUrl,
      id: config.reputationService.hawkId,
      key: config.reputationService.hawkKey,
      timeout: config.reputationService.timeout,
    });
    mod.report = report.bind(null, log, ipClient);

    if (config.reputationService.enableCheck) {
      mod.isBlockBelow = isBlockBelow.bind(null, config);
      mod.isSuspectBelow = isSuspectBelow.bind(null, config);
      mod.get = get.bind(null, log, ipClient);
    }
  }
  return mod;
};
