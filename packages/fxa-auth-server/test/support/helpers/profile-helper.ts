/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Hapi from '@hapi/hapi';

export interface ProfileHelper {
  port: number;
  url: string;
  close: () => Promise<void>;
}

/**
 * Creates a mock profile server that handles cache invalidation requests.
 * This prevents tests from requiring a real profile server.
 */
export async function createProfileHelper(port: number): Promise<ProfileHelper> {
  const server = new Hapi.Server({
    host: 'localhost',
    port,
  });

  server.route([
    {
      method: 'DELETE',
      path: '/v1/cache/{uid}',
      handler: async (request, h) => {
        return h.response({}).code(200);
      },
    },
    {
      method: 'GET',
      path: '/__heartbeat__',
      handler: async (request, h) => {
        return h.response({ status: 'ok' }).code(200);
      },
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
