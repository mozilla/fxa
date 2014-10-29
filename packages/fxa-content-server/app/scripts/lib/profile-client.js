/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'lib/xhr',
  'underscore',
  'lib/session',
  'lib/config-loader',
  'lib/oauth-client',
  'lib/assertion',
  'lib/auth-errors'
],
function (xhr, _, Session, ConfigLoader, OAuthClient, Assertion, AuthErrors) {

  function ProfileClient(options) {
    this.profileUrl = options.profileUrl;

    // an OAuth access token
    this.token = options.token;
  }

  ProfileClient.prototype._request = function (path, type, data, headers) {
    var url = this.profileUrl;

    var request = {
      url: url + path,
      type: type,
      headers: {
        Authorization: 'Bearer ' + this.token,
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
  ProfileClient.prototype.getProfile = function () {
    return this._request('/v1/profile', 'get');
  };

  ProfileClient.prototype.getAvatar = function () {
    return this._request('/v1/avatar', 'get');
  };

  ProfileClient.prototype.getAvatars = function () {
    return this._request('/v1/avatars', 'get');
  };

  ProfileClient.prototype.postAvatar = function (url, selected) {
    return this._request('/v1/avatar', 'post', {
      url: url,
      selected: selected
    });
  };

  ProfileClient.prototype.deleteAvatar = function (id) {
    return this._request('/v1/avatar/' + id, 'delete');
  };

  ProfileClient.prototype.uploadAvatar = function (data) {
    return this._request('/v1/avatar/upload', 'post', data, {
      'Content-type': data.type
    });
  };

  // Returns remote image data
  // TODO #1581 refactor this to use new remote image proxy
  ProfileClient.prototype.getRemoteImage = function (url) {
    return this._request('/v1/remote_image/' + encodeURIComponent(url), 'get');
  };

  var t = function (msg) {
    return msg;
  };

  var ERROR_TO_CODE = {
    UNAUTHORIZED: 100,
    INVALID_PARAMETER: 101,
    UNSUPPORTED_PROVIDER: 102,
    IMAGE_PROCESSING_ERROR: 103,

    // local only errors.
    SERVICE_UNAVAILABLE: 998,
    UNEXPECTED_ERROR: 999
  };

  var CODE_TO_MESSAGES = {
    // errors returned by the profile server
    100: t('Unauthorized'),
    101: t('Invalid parameter in request body: %(param)s'),
    102: t('Unsupported image provider'),
    103: t('Image processing error'),

    // local only errors.
    998: t('System unavailable, try again soon'),
    999: t('Unexpected error')
  };

  var ProfileErrors = ProfileClient.Errors = _.extend({}, AuthErrors, {
    ERROR_TO_CODE: ERROR_TO_CODE,
    CODE_TO_MESSAGES: CODE_TO_MESSAGES,
    NAMESPACE: 'profile'
  });

  return ProfileClient;
});

