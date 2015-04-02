/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore'
],
function (_) {
  var DEFAULT_DISPLAY_LENGTH = 240;
  var DEFAULT_EXPORT_LENGTH = 480;
  var DEFAULT_GUTTER = 40;

  /*
   * options: {
   *  container: The jQuery UI object of the cropper's container element. Required.
   *  src: The image source. Data URIs are okay.
   *  width: The image width. Required if src is set.
   *  height: The image height. Required if src is set.
   *  horizontalGutter: The amount of space between the crop zone and the sides of the wrapper
   *  verticalGutter: The amount of space between the crop zone and the top/bottom of the wrapper
   *  displayLength: The length of the crop square during cropping
   *  exportLength: The length of the final cropped image
   * }
   */
  function Cropper (options) {

    this.displayLength = options.displayLength || DEFAULT_DISPLAY_LENGTH;
    this.exportLength = options.exportLength || DEFAULT_EXPORT_LENGTH;

    this.top = 0;
    this.left = 0;
    this.yCenter = 0;
    this.xCenter = 0;
    this.verticalGutter = _.result(options, 'verticalGutter', DEFAULT_GUTTER);
    this.horizontalGutter = _.result(options, 'horizontalGutter', DEFAULT_GUTTER);

    if (! options.container) {
      throw new Error('A container element is required');
    }
    this._setupElements(options.container);

    if (options.src) {
      this.setImageSrc(options.src, options.width, options.height);
    }
  }

  Cropper.prototype._setupElements = function (container) {
    var self = this;

    this.container = container;
    this.img = container.find('img');
    this.wrapper = container.find('.wrapper');
    this.canvas = container.find('canvas')[0];

    this.draggable = container.find('.drag-overlay');
    this.draggable.draggable({
      drag: function (e, ui) {
        var pos = self.getBoundedPosition(self.top + ui.position.top, self.left + ui.position.left);
        self.img.css(pos);
      },
      stop: function (e, ui) {
        var pos = self.img.position();
        self.updatePosition(pos);
        ui.helper.css({ top: 0, left: 0 });
      }
    });

    this.slider = container.find('[type=range]');
    this.slider.on('input', function () {
      self.resize(parseInt(this.value, 10));
    });
    this.scale = parseInt(this.slider.val() || 0, 10);

    this.rotator = container.find('.rotate');
    this.rotator.on('click', function () {
      var data = self.rotate(90);
      self.setImageSrc(data, self._originalHeight, self._originalWidth);
    });

    container.find('.zoom-out').on('click', function () {
      self.resize(self.scale - 10);
      self.slider.val(self.scale);
    });

    container.find('.zoom-in').on('click', function () {
      self.resize(self.scale + 10);
      self.slider.val(self.scale);
    });

    // Cache some invariants
    this._wrapperHeight = this.wrapper.height();
    this._wrapperWidth = this.wrapper.width();

  };

  Cropper.prototype.updatePosition = function (pos) {
    this.yCenter = pos.top + this._height / 2;
    this.xCenter = pos.left + this._width / 2;

    this.top = pos.top;
    this.left = pos.left;
  };

  Cropper.prototype.setImageSrc = function (src, width, height) {
    var img = this.img;

    this.src = src;

    // reset the image position and dimensions
    img.css({
      width: '',
      height: '',
      top: 0,
      left: 0
    });

    this.slider.val(this.scale);

    img.attr('src', this.src);

    // initialize the center to the middle of the wrapper
    this.yCenter = this._wrapperHeight / 2;
    this.xCenter = this._wrapperWidth / 2;

    if (typeof width !== 'number' || typeof height !== 'number' ||
        width <= 0 || height <= 0) {
      throw new Error('Height and width must be > 0.');
    }

    this._originalWidth = width;
    this._originalHeight = height;

    this.isLandscape = this._originalHeight < this._originalWidth;

    this.resize(this.scale);
  };

  Cropper.prototype.updateSize = function (length) {
    if (this.isLandscape) {
      this._height = length;
      this._width = length * this._originalWidth / this._originalHeight;
    } else {
      this._width = length;
      this._height = length * this._originalHeight / this._originalWidth;
    }
    this.img.height(this._height);
    this.img.width(this._width);
  };

  Cropper.prototype.getBoundedPosition = function (top, left) {
    var w = this._width;
    var h = this._height;
    var wh = this._wrapperHeight;
    var ww = this._wrapperWidth;

    // keep the left edge of the image within the crop zone
    if (left > this.horizontalGutter) {
      left = this.horizontalGutter;
    }

    // keep the right edge of the image within the crop zone
    if (left + w < ww - this.horizontalGutter) {
      left =  ww - this.horizontalGutter - w;
    }

    // keep the top edge of the image within the crop zone
    if (top > this.verticalGutter) {
      top = this.verticalGutter;
    }

    // keep the bottom edge of the image within the crop zone
    if (top + h < wh - this.verticalGutter) {
      top = wh - this.verticalGutter - h;
    }

    return { top: top, left: left };
  };

  Cropper.prototype.resize = function resize(scale) {
    if (scale < 0) {
      scale = 0;
    }
    if (scale > 100) {
      scale = 100;
    }

    var factor = 1 + scale / 100;
    var length = this.displayLength * factor;
    this.scale = scale;

    this.updateSize(length);

    var pos = this.getBoundedPosition(this.yCenter - this._height / 2, this.xCenter - this._width / 2);
    this.updatePosition(pos);
    this.img.css(pos);
  };

  // Return new image data for the image rotated by a number of degrees
  Cropper.prototype.rotate = function (degrees) {
    var canvas = this.canvas;
    var context = canvas.getContext('2d');

    // Switch height and width to fit rotated image
    canvas.width = this._originalHeight;
    canvas.height = this._originalWidth;

    // move to the center of the canvas
    context.translate(canvas.width / 2, canvas.height / 2);

    // rotate the canvas to the specified degrees
    context.rotate(degrees * Math.PI / 180);

    // draw the image
    // since the context is rotated, the image will be rotated also
    context.drawImage(this.img[0], -this._originalWidth / 2, -this._originalHeight / 2);

    return canvas.toDataURL('image/png');
  };

  // Get the scaled position of the crop square over the source image
  Cropper.prototype.cropPosition = function () {
    var scale = this.isLandscape ?
                  this._originalHeight / this.displayLength :
                  this._originalWidth / this.displayLength;
    var oscale = 1 + this.scale / 100;
    var sourceLength = this.displayLength / oscale * scale;

    return {
      left: (-this.left + this.horizontalGutter) / oscale * scale,
      top: (-this.top + this.verticalGutter) / oscale * scale,
      length: sourceLength
    };
  };

  // Get the final cropped image data
  Cropper.prototype._export = function () {
    var context = this.canvas.getContext('2d');
    var sourcePos = this.cropPosition();
    var destLength = this.exportLength;

    this.canvas.width = destLength;
    this.canvas.height = destLength;


    context.drawImage(
      this.img[0],
      sourcePos.left,
      sourcePos.top,
      sourcePos.length,
      sourcePos.length,
      0, 0, destLength, destLength
    );
  };

  // Get the final cropped image data as a datauri
  Cropper.prototype.toDataURL = function (type, quality) {
    this._export();
    return this.canvas.toDataURL(type, quality);
  };

  // Get the final cropped image data as a blob
  Cropper.prototype.toBlob = function (cb, type, quality) {
    this._export();
    return this.canvas.toBlob(cb, type, quality);
  };

  return Cropper;
});

