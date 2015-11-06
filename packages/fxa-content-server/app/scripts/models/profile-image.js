/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This model abstracts profile images

define(function (require, exports, module) {
  'use strict';

  var Backbone = require('backbone');
  var ImageLoader = require('lib/image-loader');
  var p = require('lib/promise');
  var ProfileErrors = require('lib/profile-errors');

  var ProfileImage = Backbone.Model.extend({
    defaults: {
      id: undefined,
      img: undefined,
      url: undefined
    },

    fetch: function () {
      var self = this;
      if (! self.has('url')) {
        return p();
      }
      return ImageLoader.load(self.get('url'))
        .then(function (img) {
          self.set('img', img);
        }, function () {
          var err = ProfileErrors.toError('IMAGE_LOAD_ERROR');
          // Set the context to the image's URL. This will be logged.
          err.context = self.get('url');
          return p.reject(err);
        });
    },

    isDefault: function () {
      return ! (this.has('url') && this.has('id') && this.has('img'));
    }
  });

  module.exports = ProfileImage;
});
