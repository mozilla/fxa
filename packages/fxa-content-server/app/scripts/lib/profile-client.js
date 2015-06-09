/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This module handles communication with the fxa-profile-server.

define([
  'lib/xhr',
  'lib/profile-errors'
],
function (xhr, ProfileErrors) {
  'use strict';

  function ProfileClient(options) {
    options = options || {};
    this.profileUrl = options.profileUrl;
  }

  ProfileClient.prototype._request = function (path, type, accessToken, data, headers) {
    var request = {
      url: this.profileUrl + path,
      type: type,
      accessToken: accessToken,
      data: data,
      headers: headers
    };

    return xhr.oauthAjax(request)
      .then(function (result) {
        if (result.error) {
          throw ProfileErrors.toError(result);
        }
        return result;
      }, function (xhr) {
        throw ProfileErrors.normalizeXHRError(xhr);
      });
  };

  // Returns the user's profile data
  // including: email, uid, displayName, avatar
  ProfileClient.prototype.getProfile = function (accessToken) {
    return this._request('/v1/profile', 'get', accessToken);
  };

  ProfileClient.prototype.getAvatar = function (accessToken) {
    return this._request('/v1/avatar', 'get', accessToken);
  };

  ProfileClient.prototype.getAvatars = function (accessToken) {
    return this._request('/v1/avatars', 'get', accessToken);
  };

  ProfileClient.prototype.postAvatar = function (accessToken, url, selected) {
    return this._request('/v1/avatar', 'post', accessToken, {
      url: url,
      selected: selected
    });
  };

  ProfileClient.prototype.deleteAvatar = function (accessToken, id) {
    return this._request('/v1/avatar/' + id, 'delete', accessToken);
  };

  ProfileClient.prototype.uploadAvatar = function (accessToken, data) {
    return this._request('/v1/avatar/upload', 'post', accessToken, data, {
      'Content-type': data.type
    });
  };

  ProfileClient.prototype.getDisplayName = function (accessToken) {
    return this._request('/v1/display_name', 'get', accessToken);
  };

  ProfileClient.prototype.postDisplayName = function (accessToken, displayName) {
    return this._request('/v1/display_name', 'post', accessToken, {
      displayName: displayName
    });
  };

  ProfileClient.Errors = ProfileErrors;

  return ProfileClient;
});

