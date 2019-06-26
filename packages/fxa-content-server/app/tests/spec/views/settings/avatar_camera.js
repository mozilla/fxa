/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import AuthBroker from 'models/auth_brokers/base';
import AuthErrors from 'lib/auth-errors';
import CanvasMock from '../../../mocks/canvas';
import chai from 'chai';
import Metrics from 'lib/metrics';
import Notifier from 'lib/channels/notifier';
import ProfileMock from '../../../mocks/profile';
import Relier from 'models/reliers/relier';
import sinon from 'sinon';
import TestHelpers from '../../../lib/helpers';
import User from 'models/user';
import View from 'views/settings/avatar_camera';
import WebRTC from 'webrtc';
import WindowMock from '../../../mocks/window';

var assert = chai.assert;

function mockVideo(w, h) {
  return {
    play: sinon.spy(),
    videoHeight: h,
    videoWidth: w,
  };
}

describe('views/settings/avatar/camera', function() {
  var account;
  var broker;
  var metrics;
  var notifier;
  var profileClientMock;
  var relier;
  var user;
  var view;
  var windowMock;

  beforeEach(function() {
    notifier = new Notifier();
    metrics = new Metrics({ notifier });
    relier = new Relier();
    user = new User();
    windowMock = new WindowMock();

    broker = new AuthBroker({
      relier: relier,
    });

    view = new View({
      broker: broker,
      metrics: metrics,
      notifier: notifier,
      relier: relier,
      user: user,
      window: windowMock,
    });

    account = user.initAccount({
      accessToken: 'abc123',
      email: 'a@a.com',
      verified: true,
    });
  });

  afterEach(function() {
    $(view.el).remove();
    view.destroy();
    view = null;
    windowMock = null;
    profileClientMock = null;
  });

  describe('with session', function() {
    beforeEach(function() {
      sinon.stub(view, 'checkAuthorization').callsFake(function() {
        return Promise.resolve(true);
      });
      sinon.stub(view, 'getSignedInAccount').callsFake(function() {
        return account;
      });
    });

    describe('render', function() {
      describe('without browser support', function() {
        beforeEach(function() {
          windowMock.navigator.getUserMedia = null;
          windowMock.navigator.mediaDevices = null;

          sinon.spy(view, 'navigate');

          return view.render();
        });

        it('redirects to `settings/avatar/change`', function() {
          assert.isTrue(view.navigate.calledWith('settings/avatar/change'));
        });
      });

      describe('success', function() {
        beforeEach(function() {
          sinon.spy(view, 'startStream');

          return view.render();
        });

        it('finds the video element', function() {
          assert.ok(view.video);
        });

        it('attempts to start streaming', function() {
          assert.isFalse(view.streaming);
          assert.isTrue(view.startStream.called);
        });

        describe('when stream starts', function() {
          beforeEach(function() {
            var ev = document.createEvent('HTMLEvents');
            ev.initEvent('loadedmetadata', true, true);

            return new Promise((resolve, reject) => {
              windowMock.on('stream', function() {
                view.video.dispatchEvent(ev);
                resolve();
              });
            });
          });

          it('sets the stream', function() {
            assert.ok(view.stream, 'stream is set');
          });

          it('starts streaming', function() {
            assert.isTrue(view.streaming, 'is streaming');
          });
        });
      });
    });

    it('logs video dimension error', function() {
      return view.render().then(function() {
        sinon.spy(view, 'logError');
        view.video = mockVideo(0, 0);
        view.onLoadedMetaData();
        assert.isTrue(
          AuthErrors.is(view.logError.args[0][0], 'INVALID_CAMERA_DIMENSIONS')
        );
      });
    });

    it('does not log video dimension error', function() {
      return view.render().then(function() {
        sinon.spy(view, 'logError');
        view.video = mockVideo(1, 1);
        view.onLoadedMetaData();
        assert.isFalse(view.logError.called);
      });
    });

    it('computes height width correctly for landscape video', function() {
      var expectedWidth = 640 / (480 / view.displayLength);
      return view.render().then(function() {
        sinon.spy(view, 'logError');
        view.video = mockVideo(640, 480);
        view.onLoadedMetaData();
        assert.equal(view.height, view.displayLength);
        assert.equal(view.width, expectedWidth);
      });
    });

    it('computes height width correctly for portrait video', function() {
      var expectedHeight = 640 / (480 / view.displayLength);
      return view.render().then(function() {
        sinon.spy(view, 'logError');
        view.video = mockVideo(480, 640);
        view.onLoadedMetaData();
        assert.equal(view.width, view.displayLength);
        assert.equal(view.height, expectedHeight);
      });
    });

    it('centered position is accurate', function() {
      var pos = view.centeredPos(600, 300, 200);
      assert.equal(pos.left, -200);
      assert.equal(pos.top, 0);
    });

    it('centered position is accurate for portrait', function() {
      var pos = view.centeredPos(300, 600, 200);
      assert.equal(pos.top, -200);
      assert.equal(pos.left, 0);
    });

    it('submits', function(done) {
      profileClientMock = new ProfileMock();

      view = new View({
        broker: broker,
        displayLength: 240,
        exportLength: 600,
        metrics: metrics,
        notifier: notifier,
        relier: relier,
        user: user,
        window: windowMock,
      });

      view.isUserAuthorized = function() {
        return Promise.resolve(true);
      };

      sinon.stub(view, 'getSignedInAccount').callsFake(function() {
        return account;
      });

      sinon.stub(account, 'profileClient').callsFake(function() {
        return Promise.resolve(profileClientMock);
      });

      sinon.stub(profileClientMock, 'uploadAvatar').callsFake(function() {
        return Promise.resolve({
          id: 'foo',
          url: 'test',
        });
      });

      sinon.stub(view, 'updateProfileImage').callsFake(function() {
        return Promise.resolve();
      });

      sinon.stub(view, 'stopAndDestroyStream').callsFake(sinon.spy());

      sinon.spy(view, 'navigate');
      sinon.spy(view, 'logFlowEvent');

      view
        .render()
        .then(function() {
          view.canvas = new CanvasMock();

          var ev = document.createEvent('HTMLEvents');
          ev.initEvent('loadedmetadata', true, true);

          windowMock.on('stream', function() {
            view.video.dispatchEvent(ev);
            assert.ok(view.stream, 'stream is set');

            assert.equal(view.logFlowEvent.callCount, 0);

            view.submit().then(function(result) {
              assert.isTrue(view.stopAndDestroyStream.called);

              assert.equal(result.url, 'test');
              assert.equal(result.id, 'foo');

              assert.isTrue(view.updateProfileImage.called);
              assert.equal(
                view.updateProfileImage.args[0][0].get('url'),
                result.url
              );
              assert.equal(view.updateProfileImage.args[0][1], account);
              assert.isTrue(
                TestHelpers.isEventLogged(
                  metrics,
                  'settings.avatar.camera.submit.new'
                )
              );

              // check canvas drawImage args
              assert.equal(view.canvas._context._args[0], view.video);
              assert.equal(view.canvas._context._args[7], view.exportLength);
              assert.equal(view.canvas._context._args[8], view.exportLength);

              assert.isTrue(view.navigate.calledWith('settings'));

              assert.equal(view.logFlowEvent.callCount, 1);
              const args = view.logFlowEvent.args[0];
              assert.lengthOf(args, 1);
              const eventParts = args[0].split('.');
              assert.lengthOf(eventParts, 4);
              assert.equal(eventParts[0], 'timing');
              assert.equal(eventParts[1], 'avatar');
              assert.equal(eventParts[2], 'upload');
              assert.match(eventParts[3], /^[0-9]+$/);

              done();
            }, done);
          });
        })
        .catch(done);
    });

    it('tracks new and change events for avatars', function(done) {
      profileClientMock = new ProfileMock();

      sinon.stub(account, 'profileClient').callsFake(function() {
        return Promise.resolve(profileClientMock);
      });

      sinon.stub(view, 'updateProfileImage').callsFake(function() {
        return Promise.resolve();
      });

      function mockStream() {
        view.stream = {
          stop() {},
        };
      }

      view
        .render()
        .then(function() {
          mockStream();
          return view.submit();
        })
        .then(function() {
          assert.isTrue(
            TestHelpers.isEventLogged(
              metrics,
              'settings.avatar.camera.submit.new'
            )
          );
          assert.isFalse(
            TestHelpers.isEventLogged(
              metrics,
              'settings.avatar.camera.submit.change'
            )
          );
          mockStream();
          account.set('hadProfileImageSetBefore', true);

          return view.submit();
        })
        .then(function() {
          assert.isTrue(
            TestHelpers.isEventLogged(
              metrics,
              'settings.avatar.camera.submit.change'
            )
          );
          done();
        }, done);
    });
  });

  describe('startStream', function() {
    beforeEach(function() {
      return view.render();
    });

    describe('success', function() {
      beforeEach(function() {
        sinon.spy(windowMock.navigator.mediaDevices, 'getUserMedia');
        sinon.spy(WebRTC, 'attachMediaStream');

        view.video = mockVideo(1, 1);

        return view.startStream();
      });

      afterEach(function() {
        WebRTC.attachMediaStream.restore();
      });

      it('initializes the device camera', function() {
        assert.isTrue(
          windowMock.navigator.mediaDevices.getUserMedia.calledWith({
            audio: false,
            video: true,
          })
        );
      });

      it('stores the returned stream', function() {
        assert.ok(view.stream);
      });

      it('attaches the media stream', function() {
        assert.isTrue(
          WebRTC.attachMediaStream.calledWith(view.video, view.stream)
        );
      });

      it('starts playing the video', function() {
        assert.isTrue(view.video.play.called);
      });
    });

    describe('error', function() {
      beforeEach(function() {
        sinon
          .stub(windowMock.navigator.mediaDevices, 'getUserMedia')
          .callsFake(function() {
            return Promise.reject(AuthErrors.toError('NO_CAMERA'));
          });

        sinon.spy(view, 'displayError');
        sinon.spy(view._avatarProgressIndicator, 'done');

        return view.startStream();
      });

      it('displays the `NO_CAMERA` error', function() {
        var err = view.displayError.args[0][0];
        assert.isTrue(AuthErrors.is(err, 'NO_CAMERA'));
      });

      it('hides the progress indicator', function() {
        assert.isTrue(view._avatarProgressIndicator.done.called);
      });
    });
  });

  describe('stopAndDestroyStream', function() {
    beforeEach(function() {
      return view.render();
    });

    describe('with a stream that supports getTracks (newest spec)', function() {
      var track;

      beforeEach(function() {
        track = {
          stop: sinon.spy(),
        };

        view.stream = {
          getTracks: sinon.spy(function() {
            return [track];
          }),
        };

        return view.stopAndDestroyStream();
      });

      it('stops each track', function() {
        assert.isTrue(track.stop.called);
      });
    });

    describe('with a stream that supports stop', function() {
      var stream;

      beforeEach(function() {
        stream = {
          stop: sinon.spy(),
        };

        view.stream = stream;

        return view.stopAndDestroyStream();
      });

      it('stops the stream', function() {
        assert.isTrue(stream.stop.called);
      });
    });

    describe('with a video element that supports pause and mozSrcObject (Fx 18)', function() {
      beforeEach(function() {
        view.video = {
          mozSrcObject: {},
          pause: sinon.spy(),
        };

        view.stream = {};

        return view.stopAndDestroyStream();
      });

      it('pauses the video', function() {
        assert.isTrue(view.video.pause.called);
      });

      it('clears the mozSrcObject reference', function() {
        assert.isNull(view.video.mozSrcObject);
      });
    });
  });

  describe('destroy', function() {
    beforeEach(function() {
      sinon.spy(view, 'stopAndDestroyStream');

      return view.destroy();
    });

    it('stops the stream', function() {
      assert.isTrue(view.stopAndDestroyStream.called);
    });
  });
});
