/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* exceptsPaths: jquery-simulate */
define([
  'chai',
  'sinon',
  'jquery-simulate',
  '../../mocks/router',
  '../../mocks/canvas',
  'lib/promise',
  'lib/cropper',
  'lib/ephemeral-messages',
  'views/settings/avatar_crop',
  'models/cropper-image',
  'models/user',
  'models/reliers/relier'
],
function (chai, sinon, jQuerySimulate, RouterMock, CanvasMock, p, Cropper, EphemeralMessages, View,
    CropperImage, User, Relier) {
  'use strict';

  var assert = chai.assert;
  var pngSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVQYV2P4DwABAQEAWk1v8QAAAABJRU5ErkJggg==';

  describe('lib/cropper', function () {
    var view;
    var routerMock;
    var ephemeralMessages;
    var user;
    var relier;

    beforeEach(function () {
      routerMock = new RouterMock();
      ephemeralMessages = new EphemeralMessages();
      ephemeralMessages.set('data', {
        cropImg: new CropperImage({
          src: pngSrc
        })
      });
      user = new User();
      relier = new Relier();

      view = new View({
        router: routerMock,
        ephemeralMessages: ephemeralMessages,
        user: user,
        relier: relier
      });

      view.isUserAuthorized = function () {
        return p(true);
      };
      view.isUserVerified = function () {
        return p(true);
      };
    });

    afterEach(function () {
      $(view.el).remove();
      view.destroy();
      view = null;
    });

    it('creates a cropper', function () {
      return view.render()
        .then(function () {
          var cropper = new Cropper({
            src: pngSrc,
            width: 1,
            height: 1,
            container: view.$('.cropper')
          });

          assert.equal(cropper.src, pngSrc);
        });
    });

    it('creates a cropper and resizes the oversized image', function () {
      return view.render()
        .then(function () {
          var resize = sinon.spy(Cropper.prototype, 'resize');
          var cropper = new Cropper({
            src: pngSrc,
            width: 5000,
            height: 7000,
            container: view.$('.cropper')
          });
          assert.isTrue(resize.calledOnce);
          assert.equal(cropper._originalHeight, 960);
          assert.equal(cropper._originalWidth, 685);
          Cropper.prototype.resize.restore();
        });
    });

    describe('with a cropper', function () {
      var cropper;
      var rotateCb, translateCb, zoomInCb, zoomOutCb, zoomRangeChangeCb;

      beforeEach(function () {
        rotateCb =  sinon.spy();
        translateCb = sinon.spy();
        zoomInCb = sinon.spy();
        zoomOutCb = sinon.spy();
        zoomRangeChangeCb = sinon.spy();
        return view.render()
          .then(function () {
            cropper = new Cropper({
              container: view.$('.cropper'),
              verticalGutter: 0,
              horizontalGutter: 40,
              displayLength: 240,
              exportLength: 480,
              onRotate: rotateCb,
              onTranslate: translateCb,
              onZoomIn: zoomInCb,
              onZoomOut: zoomOutCb,
              onZoomRangeChange: zoomRangeChangeCb
            });

            cropper._wrapperHeight = 240;
            cropper._wrapperWidth = 320;

            cropper.canvas = new CanvasMock();
          });
      });

      afterEach(function () {
        cropper = null;
      });

      it('sets image src after', function () {
        cropper.setImageSrc(pngSrc, 100, 100);

        assert.equal(cropper.yCenter, 120);
        assert.equal(cropper.xCenter, 160);
        assert.equal(cropper.isLandscape, false);
        assert.equal(cropper._originalWidth, 100);
        assert.equal(cropper._originalHeight, 100);
        assert.equal(cropper._height, 240);
        assert.equal(cropper._width, 240);
        assert.equal(cropper.verticalGutter, 0);
        assert.equal(cropper.horizontalGutter, 40);
      });


      it('rotates and sets landscape mode', function () {
        cropper.setImageSrc(pngSrc, 100, 50);

        assert.equal(cropper.isLandscape, true, 'landscape should be true');
        cropper.rotator.trigger('click');
        assert.equal(cropper.isLandscape, false, 'landscape should be false');
      });

      it('change scale with slider', function () {
        cropper.setImageSrc(pngSrc, 100, 50);

        cropper.slider.val(50);
        cropper.slider.trigger('input');
        assert.equal(cropper.scale, 50);
      });

      it('zooms in and out', function () {
        cropper.setImageSrc(pngSrc, 100, 50);

        cropper.container.find('.zoom-in').trigger('click');
        assert.equal(cropper.scale, 10);

        cropper.container.find('.zoom-out').trigger('click');
        assert.equal(cropper.scale, 0);
      });

      it('sets position', function () {
        cropper.setImageSrc(pngSrc, 100, 50);
        cropper.updatePosition({ top: 25, left: 25 });
        assert.equal(cropper.top, 25);
        assert.equal(cropper.left, 25);
        assert.equal(cropper.yCenter, 145);
        assert.equal(cropper.xCenter, 265);
      });

      it('updates size', function () {
        cropper.setImageSrc(pngSrc, 100, 50);

        cropper.updateSize(300);
        assert.equal(cropper._height, 300);
        assert.equal(cropper._width, 600);
      });

      it('gets bounded position', function () {
        cropper.setImageSrc(pngSrc, 100, 50);

        assert.equal(cropper.getBoundedPosition(0, 50).left, 40,
          'left edge does not exceed gutter length');

        assert.equal(cropper.getBoundedPosition(10, 0).top, 0,
          'top edge does not exceed gutter length');

        assert.equal(cropper.getBoundedPosition(0, -220).left, -200,
          'right edge does not exceed gutter length');

        assert.equal(cropper.getBoundedPosition(-10, 0).top, 0,
          'bottom edge does not exceed gutter length');
      });

      it('resize', function () {
        var img = { width: 100, height: 50, src: pngSrc };
        var resized = cropper.resize(img, 0.5);
        assert.equal(resized.src, 'data:image/jpeg');
        assert.equal(resized.width, 50);
        assert.equal(resized.height, 25);
      });

      it('zoom', function () {
        cropper.setImageSrc(pngSrc, 100, 50);

        cropper.zoom(100);
        assert.equal(cropper.scale, 100);
        assert.equal(cropper._width, 960);
        assert.equal(cropper._height, 480);
      });

      it('zoom handles over 100 value', function () {
        cropper.setImageSrc(pngSrc, 100, 50);

        cropper.zoom(101);
        assert.equal(cropper.scale, 100);
        assert.equal(cropper._width, 960);
        assert.equal(cropper._height, 480);
      });

      it('zoom handles negative value', function () {
        cropper.setImageSrc(pngSrc, 100, 50);

        cropper.zoom(-1);
        assert.equal(cropper.scale, 0);
        assert.equal(cropper._width, 480);
        assert.equal(cropper._height, 240);
      });

      it('calculates crop position of image larger than crop area', function () {
        cropper.setImageSrc(pngSrc, 800, 400);

        var pos = cropper.cropPosition();
        assert.equal(pos.top, 0);
        assert.equal(pos.left,  200);
        assert.equal(pos.length, 400);
      });

      it('calculates crop position of image smaller than crop area', function () {
        cropper.setImageSrc(pngSrc, 100, 50);

        var pos = cropper.cropPosition();
        assert.equal(pos.top, 0);
        assert.equal(pos.left,  25);
        assert.equal(pos.length, 50);
      });

      it('gets data url', function () {
        cropper.setImageSrc(pngSrc, 100, 50);

        cropper.toDataURL('image/jpeg', 0.9);
        assert.equal(cropper.canvas._args[0], 'image/jpeg');
        assert.equal(cropper.canvas._args[1], 0.9);
        assert.equal(cropper.canvas._context._args[1], 25);
        assert.equal(cropper.canvas._context._args[2], 0);
        assert.equal(cropper.canvas._context._args[3], 50);
        assert.equal(cropper.canvas._context._args[4], 50);
        assert.equal(cropper.canvas._context._args[7], 480);
        assert.equal(cropper.canvas._context._args[8], 480);
      });

      it('callbacks on translate', function () {
        cropper.setImageSrc(pngSrc, 100, 50);

        cropper.draggable.simulate('drag', { dx: 50, dy: 50 });
        assert.isTrue(translateCb.calledOnce);
      });

      it('callbacks on zoom range change', function () {
        cropper.setImageSrc(pngSrc, 100, 50);

        cropper.slider.val(50);
        cropper.slider.trigger('change');
        assert.isTrue(zoomRangeChangeCb.calledOnce);
      });

      it('callbacks on rotate', function () {
        cropper.setImageSrc(pngSrc, 100, 50);

        cropper.rotator.trigger('click');
        assert.isTrue(rotateCb.calledOnce);
      });

      it('callbacks on zoom in', function () {
        cropper.setImageSrc(pngSrc, 100, 50);

        cropper.container.find('.zoom-in').trigger('click');
        assert.isTrue(zoomInCb.calledOnce);
      });

      it('callbacks on zoom out', function () {
        cropper.setImageSrc(pngSrc, 100, 50);

        cropper.container.find('.zoom-out').trigger('click');
        assert.isTrue(zoomOutCb.calledOnce);
      });
    });
  });
});
