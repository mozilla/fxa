/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const db = require('../../db');

const EMPTY = Object.create(null);
function avatarOrEmpty(avatar) {
  if (avatar) {
    return {
      avatar: avatar.url
    };
  }
  return EMPTY;
}

module.exports = {
  auth: {
    strategy: 'oauth',
    scope: ['profile', 'profile:avatar']
  },
  handler: function avatar(req, reply) {
    db.getSelectedAvatar(req.auth.credentials.user)
      .then(avatarOrEmpty)
      .done(reply, reply);
  }
};

