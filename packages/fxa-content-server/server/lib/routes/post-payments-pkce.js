/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const joi = require('joi');

module.exports = () => {
  console.log('setting up payments-pkce');
  return {
    method: 'post',
    path: '/payments-pkce',
    validate: {
      body: {
        /* eslint-disable camelcase */
        code_verifier: joi
          .string()
          .min(43)
          .max(128)
          .required(),
        state: joi.string().required(),
        /* eslint-enable camelcase */
      },
    },
    process(req, res) {
      const cookieData = JSON.stringify({
        // eslint-disable-next-line camelcase
        code_verifier: req.body.code_verifier,
        state: req.body.state,
      });
      console.log('cookieData', cookieData);
      res.cookie('_pkce', cookieData, {
        httpOnly: true,
        maxAge: 5 * 60 * 1000, // 5 minutes in ms, same as an OAuth code
        path: '/payments-pkce',
      });

      res.send({});
    },
  };
};
