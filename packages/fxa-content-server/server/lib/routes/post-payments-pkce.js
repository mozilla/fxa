/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const joi = require('joi');
const nodeCookie = require('node-cookie');

module.exports = () => {
  return {
    method: 'post',
    path: '/payments-pkce',
    validate: {
      body: {
        /* eslint-disable camelcase */
        code_verifier: joi.string().min(43).max(128).required(),
        state: joi.string().required(),
        /* eslint-enable camelcase */
      }
    },
    process (req, res) {
      // TODO make the expiry configurable
      const expires = new Date();
      expires.setTime(Date.now() + (5 * 60 * 1000));

      const cookie = JSON.stringify({
        // eslint-disable-next-line camelcase
        code_verifier: req.body.code_verifier,
        state: req.body.state,
      });
      nodeCookie.create(res, '_pkce', cookie, {
        expires,
        httpOnly: true,
        path: '/payments-pkce',
        sameSite: 'lax'
      }, 'YOU MUST CHANGE ME', true);

      res.send({});
    }
  };
};
