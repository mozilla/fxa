/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import configModule from "../config";
const config = configModule.getProperties();
import hapi from '@hapi/hapi';
import url from 'url';

export default () => {
  return new Promise((resolve, reject) => {
    const api = new hapi.Server({
      host: url.parse(config.profileServer.url).hostname,
      port: parseInt(url.parse(config.profileServer.url).port),
    });

    api.route([
      {
        method: 'DELETE',
        path: '/v1/cache/{uid}',
        handler: async function (request, h) {
          return h.response({}).code(200);
        },
      },
    ]);

    api.start().then((err) => {
      if (err) {
        console.log(err); // eslint-disable-line no-console
        return reject(err);
      }
      resolve({
        close() {
          return new Promise((resolve, reject) => {
            api.stop().then((err) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          });
        },
      });
    });
  });
};
