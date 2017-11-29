/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This model abstracts profile images

define(function (require, exports, module) {
  'use strict';

  const Backbone = require('backbone');
  const ImageLoader = require('../lib/image-loader');
  const ProfileErrors = require('../lib/profile-errors');

  var ProfileImage = Backbone.Model.extend({
    defaults: {
      id: undefined,
      img: undefined,
      url: undefined
    },

    fetch () {
      if (! this.has('url')) {
        return Promise.resolve();
      }
      return ImageLoader.load(this.get('url'))
        .then((img) => this.set('img', img), () => {
          var err = ProfileErrors.toError('IMAGE_LOAD_ERROR');
          // Set the context to the image's URL. This will be logged.
          err.context = this.get('url');
          return Promise.reject(err);
        });
    },

    isDefault () {
      return ! (this.has('url') && this.has('id') && this.has('img'));
    }
  });

  module.exports = ProfileImage;
});
