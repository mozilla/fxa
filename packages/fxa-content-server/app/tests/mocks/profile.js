/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// stub out the router object for testing.

function Profile() {}

[
  'getProfile',
  'getAvatar',
  'deleteAvatar',
  'uploadAvatar',
  'getRemoteImage',
].forEach(function (method) {
  Profile.prototype[method] = function () {};
});

export default Profile;
