/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import _ from 'underscore';

var DEFAULT_DISPLAY_LENGTH = 240;
var DEFAULT_EXPORT_LENGTH = 480;

/*
 * options: {
 *  container: The jQuery UI object of the cropper's container element. Required.
 *  src: The image source. Data URIs are okay.
 *  width: The image width. Required if src is set.
 *  height: The image height. Required if src is set.
 *  displayLength: The length of the crop square during cropping
 *  exportLength: The length of the final cropped image
 *  onRotate: Function to call back when the rotation button is clicked
 *  onTranslate: Function to call back when the image is dragged
 *  onZoomIn: Function to call back when the zoom-in button is clicked
 *  onZoomOut: Function to call back when the zoom-out button is clicked
 *  onZoomRangeChange: Function to call back when the zoom range input is changed
 * }
 */
function Cropper(options) {
  this.displayLength = options.displayLength || DEFAULT_DISPLAY_LENGTH;
  this.exportLength = options.exportLength || DEFAULT_EXPORT_LENGTH;

  this.top = 0;
  this.left = 0;
  this.yCenter = 0;
  this.xCenter = 0;
  this.onRotate = options.onRotate || _.noop;
  this.onTranslate = options.onTranslate || _.noop;
  this.onZoomIn = options.onZoomIn || _.noop;
  this.onZoomOut = options.onZoomOut || _.noop;
  this.onZoomRangeChange = options.onZoomRangeChange || _.noop;

  this.resizeAdjustment = _.throttle(() => {
    this.updateMeasurements();

    const pos = this.updatePosition();
    this.img.css(pos);
  }, 300);

  if (!options.container) {
    throw new Error('A container element is required');
  }

  this._setupElements(options.container);

  window.addEventListener('resize', this.resizeAdjustment);

  if (options.src) {
    let img = options;

    // we want the extra resolution to be able to zoom in later (up to 200%)
    const maxLength = this.exportLength * 2;
    if (img.width > maxLength || img.height > maxLength) {
      const scale = maxLength / Math.max(img.width, img.height);
      img = this.resize(img, scale);
    }
    this.setImageSrc(img.src, img.width, img.height);
  }

  // There is an issue where `this.updateMeasurements` is called before
  // the DOM is finished laying out elements, so we're forcing the cropper
  // to perform its checks after initial layout and execution is finished.
  setTimeout(() => {
    this.updateMeasurements();

    const pos = this.updatePosition();
    this.img.css(pos);
  });
}

Cropper.prototype._setupElements = function(container) {
  this.container = container;
  this.img = container.find('img');
  this.wrapper = container.find('.wrapper');
  this.canvas = container.find('canvas')[0];

  this.draggable = container.find('.drag-overlay');
  this.draggable.draggable({
    drag: (e, ui) => {
      var pos = this.getBoundedPosition(
        this.top + ui.position.top,
        this.left + ui.position.left
      );
      this.img.css(pos);
    },
    stop: (e, ui) => {
      var pos = this.img.position();
      this.updatePosition(pos);
      ui.helper.css({ left: 0, top: 0 });
      this.onTranslate();
    },
  });

  const $sliderEl = (this.slider = container.find('[type=range]'));

  $sliderEl.on('input', () => {
    this.zoom(parseInt($sliderEl.val(), 10));
  });
  $sliderEl.on('change', () => {
    this.onZoomRangeChange();
  });
  this.scale = parseInt($sliderEl.val() || 0, 10);

  this.rotator = container.find('.rotate');
  this.rotator.on('click', () => {
    var data = this.rotate(90);
    this.setImageSrc(data, this._originalHeight, this._originalWidth);
    this.onRotate();
  });

  container.find('.zoom-out').on('click', () => {
    this.zoom(this.scale - 10);
    $sliderEl.val(this.scale);
    this.onZoomOut();
  });

  container.find('.zoom-in').on('click', () => {
    this.zoom(this.scale + 10);
    $sliderEl.val(this.scale);
    this.onZoomIn();
  });
};

Cropper.prototype.destroy = function() {
  window.removeEventListener('resize', this.resizeAdjustment);
};

Cropper.prototype.updateMeasurements = function() {
  this._wrapperHeight = this.wrapper.outerHeight();
  this._wrapperWidth = this.wrapper.outerWidth();

  this.verticalGutter = (this._wrapperHeight - DEFAULT_DISPLAY_LENGTH) / 2;
  this.horizontalGutter = (this._wrapperWidth - DEFAULT_DISPLAY_LENGTH) / 2;

  // initialize the center to the middle of the wrapper
  this.yCenter = this._wrapperHeight / 2;
  this.xCenter = this._wrapperWidth / 2;
};

Cropper.prototype.updatePosition = function(_pos) {
  const pos =
    _pos ||
    this.getBoundedPosition(
      this.yCenter - this._height / 2,
      this.xCenter - this._width / 2
    );

  this.yCenter = pos.top + this._height / 2;
  this.yCenter = pos.top + this._height / 2;
  this.xCenter = pos.left + this._width / 2;
  this.xCenter = pos.left + this._width / 2;

  this.top = pos.top;
  this.top = pos.top;
  this.left = pos.left;
  this.left = pos.left;

  return pos;
};

Cropper.prototype.setImageSrc = function(src, width, height) {
  var img = this.img;

  this.src = src;

  // reset the image position and dimensions
  img.css({
    height: '',
    left: 0,
    top: 0,
    width: '',
  });

  this.slider.val(this.scale);

  img.attr('src', this.src);

  if (
    typeof width !== 'number' ||
    typeof height !== 'number' ||
    width <= 0 ||
    height <= 0
  ) {
    throw new Error('Height and width must be > 0.');
  }

  this._originalWidth = width;
  this._originalHeight = height;

  this.isLandscape = this._originalHeight < this._originalWidth;

  this.zoom(this.scale);
};

Cropper.prototype.updateSize = function(length) {
  if (this.isLandscape) {
    this._height = length;
    this._width = (length * this._originalWidth) / this._originalHeight;
  } else {
    this._width = length;
    this._height = (length * this._originalHeight) / this._originalWidth;
  }
  this.img.height(this._height);
  this.img.width(this._width);
};

Cropper.prototype.getBoundedPosition = function(top, left) {
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
    left = ww - this.horizontalGutter - w;
  }

  // keep the top edge of the image within the crop zone
  if (top > this.verticalGutter) {
    top = this.verticalGutter;
  }

  // keep the bottom edge of the image within the crop zone
  if (top + h < wh - this.verticalGutter) {
    top = wh - this.verticalGutter - h;
  }

  return { left: left, top: top };
};

Cropper.prototype.resize = function(img, scale) {
  var canvas = this.canvas;
  var context = canvas.getContext('2d');
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;

  this.img.attr('src', img.src);
  context.drawImage(this.img[0], 0, 0, canvas.width, canvas.height);
  var src = canvas.toDataURL();
  return { height: canvas.height, src: src, width: canvas.width };
};

Cropper.prototype.zoom = function zoom(scale) {
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

  const pos = this.updatePosition();
  this.img.css(pos);
};

// Return new image data for the image rotated by a number of degrees
Cropper.prototype.rotate = function(degrees) {
  var canvas = this.canvas;
  var context = canvas.getContext('2d');

  // Switch height and width to fit rotated image
  canvas.width = this._originalHeight;
  canvas.height = this._originalWidth;

  // move to the center of the canvas
  context.translate(canvas.width / 2, canvas.height / 2);

  // rotate the canvas to the specified degrees
  context.rotate((degrees * Math.PI) / 180);

  // draw the image
  // since the context is rotated, the image will be rotated also
  context.drawImage(
    this.img[0],
    -this._originalWidth / 2,
    -this._originalHeight / 2
  );

  return canvas.toDataURL('image/png');
};

// Get the scaled position of the crop square over the source image
Cropper.prototype.cropPosition = function() {
  var scale = this.isLandscape
    ? this._originalHeight / this.displayLength
    : this._originalWidth / this.displayLength;
  var oscale = 1 + this.scale / 100;
  var sourceLength = (this.displayLength / oscale) * scale;
  sourceLength = this.isLandscape
    ? Math.min(sourceLength, this._originalHeight)
    : Math.min(sourceLength, this._originalWidth);

  return {
    left: ((-this.left + this.horizontalGutter) / oscale) * scale,
    length: sourceLength,
    top: ((-this.top + this.verticalGutter) / oscale) * scale,
  };
};

// Get the final cropped image data
Cropper.prototype._export = function() {
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
    0,
    0,
    destLength,
    destLength
  );
};

// Get the final cropped image data as a datauri
Cropper.prototype.toDataURL = function(type, quality) {
  this._export();
  return this.canvas.toDataURL(type, quality);
};

// Get the final cropped image data as a blob
Cropper.prototype.toBlob = function(cb, type, quality) {
  this._export();
  return this.canvas.toBlob(cb, type, quality);
};

export default Cropper;
