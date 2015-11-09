/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// View mixin to get a ResumeToken model in a consistent fashion.

define(function (require, exports, module) {
  'use strict';

  var _ = require('underscore');
  var ResumeToken = require('models/resume-token');

  module.exports = {
    /**
     * Get a ResumeToken model.
     *
     * @method getResumeToken
     * @returns {ResumeToken}
     */
    getResumeToken: function () {
      // there might not be any relier if the resume token is being fetched
      // for an account unlock request caused by changing the password.
      var relierInfo = this.relier && this.relier.pickResumeTokenInfo();
      var userInfo = this.user && this.user.pickResumeTokenInfo();

      // When account or user fields are needed,
      // they can be added as part of the resumeTokenInfo
      var resumeTokenInfo = _.extend(
        {},
        relierInfo,
        userInfo
      );

      return new ResumeToken(resumeTokenInfo);
    },

    /**
     * Get a stringified ResumeToken that can be passed along in an email
     *
     * @method getStringifiedResumeToken
     * @returns {String}
     */
    getStringifiedResumeToken: function () {
      return this.getResumeToken().stringify();
    }
  };
});
