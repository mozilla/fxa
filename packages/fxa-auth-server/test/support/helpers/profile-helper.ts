/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Hapi from '@hapi/hapi';

export interface ProfileHelper {
  port: number;
  url: string;
  close: () => Promise<void>;
}

export async function createProfileHelper(port: number): Promise<ProfileHelper> {
  const server = new Hapi.Server({
    host: 'localhost',
    port,
  });

  server.route([
    {
      method: 'DELETE',
      path: '/v1/cache/{uid}',
      handler: (_request, h) => h.response({}).code(200),
    },
    {
      method: 'GET',
      path: '/__heartbeat__',
      handler: (_request, h) => h.response({ status: 'ok' }).code(200),
    },
  ]);

  await server.start();

  return {
    port,
    url: `http://localhost:${port}`,
    close: async () => {
      await server.stop();
    },
  };
}
