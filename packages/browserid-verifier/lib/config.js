/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var convict = require('convict');

var conf = convict({
  ip: {
    doc: "The IP address to bind.",
    format: "ipaddress",
    default: "127.0.0.1",
    env: "IP_ADDRESS",
  },
  port: {
    doc: "The port to bind.",
    format: "port",
    default: 0,
    env: "PORT"
  },
  httpTimeout: {
    doc: "(s) how long to spend attempting to fetch support documents",
    format: Number,
    default: 8.0,
    env: "HTTP_TIMEOUT"
  },
  insecureSSL: {
    doc: "(testing only) Ignore invalid SSL certificates",
    format: Boolean,
    default: false,
    env: "INSECURE_SSL"
  },
});

// load environment dependent configuration
if (process.env.CONFIG_FILES) {
  var files = process.env.CONFIG_FILES.split(',');
  files.forEach(function(file) {
    conf.loadFile(file);
  });
}

// validation configuration
conf.validate();

module.exports = conf;
