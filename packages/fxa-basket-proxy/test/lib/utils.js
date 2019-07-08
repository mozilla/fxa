/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const Promise = require('bluebird');

/* Temporarily set environment variables while executing a function.
 */
module.exports.withEnviron = function withEnviron(env, cb) {
  const origEnv = {};
  Object.keys(env).forEach(key => {
    if (process.env.hasOwnProperty(key)) {
      origEnv[key] = process.env[key];
    }
    process.env[key] = env[key];
  });
  return Promise.resolve()
    .then(() => {
      return cb();
    })
    .finally(() => {
      Object.keys(env).forEach(key => {
        if (origEnv.hasOwnProperty(key)) {
          process.env[key] = origEnv[key];
        } else {
          delete process.env[key];
        }
      });
    });
};

/* Temporarily clear module cache while executing a function.
 */
module.exports.withFreshModules = function withFreshModules(
  require,
  modules,
  cb
) {
  const origModules = {};
  modules.forEach(module => {
    const path = require.resolve(module);
    origModules[path] = require.cache[path];
    delete require.cache[path];
  });
  return Promise.resolve()
    .then(() => {
      return cb();
    })
    .finally(() => {
      modules.forEach(module => {
        const path = require.resolve(module);
        require.cache[path] = origModules[path];
      });
    });
};
