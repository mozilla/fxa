/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This module handles communication with the fxa-profile-server.

'use strict';

define([
  'lib/xhr',
  'underscore',
  'lib/config-loader',
  'lib/oauth-client',
  'lib/assertion',
  'lib/profile-errors'
],
function (xhr, _, ConfigLoader, OAuthClient, Assertion, ProfileErrors) {

  function ProfileClient(options) {
    options = options || {};
    this.profileUrl = options.profileUrl;
  }

  ProfileClient.prototype._request = function (path, type, accessToken, data, headers) {
    var url = this.profileUrl;

    var request = {
      url: url + path,
      type: type,
      headers: {
        Authorization: 'Bearer ' + accessToken,
        Accept: 'application/json'
      }
    };

    if (data) {
      request.data = data;
    }
    if (headers) {
      _.extend(request.headers, headers);
    }

    if (typeof Blob !== 'undefined' && data instanceof Blob) {
      request.processData = false;
    }

    return xhr.ajax(request)
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
  // including: email, uid
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

  ProfileClient.Errors = ProfileErrors;

  return ProfileClient;
});

