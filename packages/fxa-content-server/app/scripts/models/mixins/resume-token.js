/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A model mixin to work with ResumeTokens.
 *
 * A model should set the array `resumeTokenFields` to add/change
 * fields that are saved to and populated from the ResumeToken.
 */

define(function (require, exports, module) {
  'use strict';

  var ResumeToken = require('models/resume-token');

  module.exports = {
    /**
     * Get an object of values that should be stored in a ResumeToken
     *
     * @method pickResumeTokenInfo
     * @returns {Object}
     */
    pickResumeTokenInfo: function () {
      if (this.resumeTokenFields) {
        return this.pick(this.resumeTokenFields);
      }
    },

    /**
     * Sets model properties from a stringified ResumeToken. A stringified
     * ResumeToken is generally one passed in the `resume` query parameter.
     *
     * @method populateFromStringifiedResumeToken
     * @param {String} stringifiedResumeToken
     */
    populateFromStringifiedResumeToken: function (stringifiedResumeToken) {
      if (this.resumeTokenFields) {
        var resumeToken =
          ResumeToken.createFromStringifiedResumeToken(stringifiedResumeToken);

        this.populateFromResumeToken(resumeToken);
      }
    },

    /**
     * Sets model properties from a ResumeToken.
     *
     * @method populateFromResumeToken
     * @param {ResumeToken} resumeToken
     */
    populateFromResumeToken: function (resumeToken) {
      if (this.resumeTokenFields) {
        this.set(resumeToken.pick(this.resumeTokenFields));
      }
    }
  };
});

