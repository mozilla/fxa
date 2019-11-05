/* eslint-disable id-blacklist */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * This module contains all the functionality needed to initialize, load
 * and check an ip blocklist. The ip blocklist file must contain
 * at least one column that has ip addresses or an ip address range
 * in the following formats, 192.168.0.0 or 192.168.0.0/32. The blocklist
 * polls for any file changes and reloads itself if needed.
 *
 */
var Promise = require('bluebird');
var readFile = Promise.promisify(require('fs').readFile);
var statFile = Promise.promisify(require('fs').stat);
var path = require('path');
var ip = require('ip');

module.exports = function(log, config) {
  function getBaseIp(addr, prefixLength) {
    return ip.mask(addr, ip.fromPrefixLen(prefixLength));
  }

  function parseRow(ipColumn) {
    // Ignore # lines
    if (ipColumn.length > 0 && ipColumn[0] === '#') {
      return;
    }

    // Parse row for ip address components, supports 1.10.16.0/20 or 1.10.16.0.
    // Converts them to a base IP address and a prefix length.
    var tokens = ipColumn.split('/');
    if (tokens.length === 2) {
      var prefixLength = parseInt(tokens[1], 10);
      return {
        baseIp: getBaseIp(tokens[0], prefixLength),
        prefixLength: prefixLength,
      };
    }

    return {
      baseIp: tokens[0],
      prefixLength: 32,
    };
  }

  function IPBlocklist() {
    this.prefixLengths = [];
    this.ipsByPrefixLength = {};
    this.fileLastModified = 0;
    this.pollInterval = null;
  }

  IPBlocklist.prototype.load = function(listPath) {
    var self = this;

    var newIpsByPrefixLength = {};
    var newPrefixLengths = [];

    // Resolve file path to an absolute location
    // Resolve file path to an absolute location
    var filePath = path.resolve(listPath);
    self.listPath = listPath;
    self.filePath = filePath;
    self.fileName = path.basename(filePath);

    var startTime = Date.now();
    return statFile(filePath)
      .then(function(fileStats) {
        self.fileLastModified = fileStats.mtime.getTime();
        self.fileSize = fileStats.size;
        return readFile(filePath, 'utf8');
      })
      .then(function(data) {
        // split into rows, filter out any comments, i.e., rows starting with #
        return data
          .toString()
          .split('\n')
          .map(line => line.trim())
          .filter(line => {
            return line.length && !/^#/.test(line);
          });
      })
      .then(function(rows) {
        return Promise.each(rows, function(row, idx) {
          var parsedData = parseRow(row);

          if (parsedData) {
            if (! newIpsByPrefixLength[parsedData.prefixLength]) {
              newPrefixLengths.push(parsedData.prefixLength);
              newIpsByPrefixLength[parsedData.prefixLength] = {};
            }
            newIpsByPrefixLength[parsedData.prefixLength][
              parsedData.baseIp
            ] = true;
          }

          // Every 1000 rows, yield process
          if (idx % 1000 === 0) {
            return new Promise(resolve => {
              setImmediate(resolve);
            });
          }
        });
      })
      .then(function() {
        // Update map to new values
        self.ipsByPrefixLength = newIpsByPrefixLength;
        self.prefixLengths = newPrefixLengths;

        var endTime = Date.now();
        log.info({
          op: 'fxa.customs.blocklist.load',
          fileName: self.fileName,
          fileSize: self.fileSize,
          loadedIn: endTime - startTime,
        });
      });
  };

  IPBlocklist.prototype.clear = function() {
    this.prefixLengths = [];
    this.ipsByPrefixLength = {};
  };

  IPBlocklist.prototype.contains = function(ipAddress) {
    var self = this;

    var startTime = Date.now();
    var endTime;

    log.info({
      op: 'fxa.customs.blocklist.check',
      ip: ipAddress,
      fileName: self.fileName,
      fileSize: self.fileSize,
    });

    try {
      return self.prefixLengths.some(function(prefixLength) {
        var result =
          getBaseIp(ipAddress, prefixLength) in
          self.ipsByPrefixLength[prefixLength];

        // If `hit` log metrics on time taken
        if (result) {
          endTime = Date.now();
          log.info({
            op: 'fxa.customs.blocklist.hit',
            ip: ipAddress,
            fileName: self.fileName,
            fileSize: self.fileSize,
            foundIn: endTime - startTime,
          });
        }

        return result;
      });
    } catch (err) {
      // On any error, fail closed and reject request. These errors could be
      // malformed ip address, etc
      log.error({
        op: 'fxa.customs.blocklist.error',
        fileName: self.fileName,
        fileSize: self.fileSize,
        err: err,
      });

      throw err;
    }
  };

  IPBlocklist.prototype.pollForUpdates = function() {
    this.stopPolling();
    this.pollInterval = setInterval(
      this.refresh.bind(this),
      config.ipBlocklist.updatePollInterval * 1000
    );
    this.pollInterval.unref();
  };

  IPBlocklist.prototype.stopPolling = function() {
    clearInterval(this.pollInterval);
  };

  IPBlocklist.prototype.refresh = function() {
    var self = this;

    log.trace({
      op: 'fxa.customs.blocklist.refreshList',
      fileName: self.fileName,
      fileSize: self.fileSize,
    });

    return statFile(self.filePath)
      .then(function(fileStats) {
        var mtime = fileStats.mtime.getTime();
        if (mtime > self.fileLastModified) {
          return self.load(self.filePath);
        }
      })
      .catch(function(err) {
        log.error(err);
      });
  };

  return IPBlocklist;
};
