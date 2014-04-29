/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const
os = require('os'),
util = require('util'),
intel = require('intel');

// Global logging info that is included in every record.

var logRecordInfo = {
  v: 1, // log format version
  hostname: os.hostname()
};


// Custom formatter producing JSON records to be consumed by heka.
function JsonFormatter(options) {
  intel.Formatter.call(this, options);
}
util.inherits(JsonFormatter, intel.Formatter);

JsonFormatter.prototype.format = function jsonFormat(record) {
  // we use super.format() because intel has circular de-refencing
  var rec = {
    op: record.op || record.name,
    name: record.name,
    time: record.timestamp,
    pid: record.pid
  };
  for (var k in logRecordInfo) {
    rec[k] = logRecordInfo[k];
  }
  if (typeof record.args[0] === 'string') {
    rec.message = record.message;
  } else {
    for (k in record.args[0]) {
      rec[k] = record.args[0][k];
    }
  }
  return intel.Formatter.prototype.format.call(this, rec);
};

module.exports = JsonFormatter;
