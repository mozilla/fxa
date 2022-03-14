/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use strict';

const { URLSearchParams } = require('url');

module.exports = function () {
  return {
    method: 'post',
    path: '/post_verify/third_party_auth/callback',
    process: (req, res) => {
      const urlParameters = new URLSearchParams(req.body);
      // As part of Sign-in with Apple feature, they POST oauth params
      // to a url to be verified. If/when we have other oauth providers
      // that do something similar, we can update this route to be more generic.
      urlParameters.set('provider', 'apple');
      res.redirect(
        301,
        `/post_verify/third_party_auth/callback?${urlParameters.toString()}`
      );
    },
  };
};
