/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* eslint-disable no-console */
const Server = require('../lib/server');
const config = require('../lib/config').getProperties();

function TestServer(configUpdates) {
  this.url = 'http://127.0.0.1:' + configUpdates.listen.port;
  this.server = null;
  this.config = Object.assign({}, config, configUpdates);
  this.log = {
    info: () => {},
    error: () => {},
  };
}

TestServer.prototype.start = async function() {
  if (!this.server) {
    this.server = await Server(this.config, this.log);
    await this.server.start();
  }
};

TestServer.prototype.stop = async function() {
  if (this.server) {
    await this.server.stop();
    this.server = null;
    process.nextTick(process.exit.bind(null, 0));
  }
};

module.exports = TestServer;
