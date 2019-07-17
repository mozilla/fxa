/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as hapi from '@hapi/hapi';
import { Logger } from 'mozlog';

import * as api from './api';

export type ServerConfig = api.SupportConfig & {
  listen: {
    host: string;
    port: number;
  };
};

export function init(config: ServerConfig, logger: Logger): hapi.Server {
  const server = new hapi.Server({
    debug: { request: ['error'] },
    host: config.listen.host,
    port: config.listen.port
  });

  api.init(logger, config, server);

  return server;
}
