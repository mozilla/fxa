#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const server = require('../lib/server');
const config = require('../lib/config').getProperties();
const log = require('../lib/log')(config.log.level, 'customs-server');

log.info({ op: 'config', config: config });

function shutdown(code) {
  process.nextTick(process.exit.bind(null, code));
}

const init = async () => {
  try {
    const api = await server(config, log);
    await api.start();
    log.info({
      op: 'listening',
      host: config.listen.host,
      port: config.listen.port,
    });

    const server_shutdown = async () => {
      await api.stop().then(function (err) {
        if (err) {
          log.warn({ op: 'shutdown', err: err}, 'graceful shutdown failed');
          shutdown(1);
        } else {
          log.info({ op: 'shutdown' }, 'graceful shutdown complete');
          shutdown(0);
        }
      });
    };
    process.on('SIGINT', server_shutdown);
    process.on('SIGTERM', server_shutdown);

    return api;
  } catch (err) {
    log.error({ op: 'customs.bin.error', err: err });
    shutdown(1);
  }
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

return init();
