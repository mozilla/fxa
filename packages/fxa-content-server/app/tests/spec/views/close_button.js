/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'sinon',
  'jquery',
  '../../mocks/window',
  '../../lib/helpers',
  'lib/promise',
  'lib/metrics',
  'lib/oauth-errors',
  'views/close_button',
  'models/auth_brokers/oauth'
],
function (chai, sinon, $, WindowMock, TestHelpers, p, Metrics,
      OAuthErrors, View, OAuthBroker) {
  var assert = chai.assert;

  describe('views/close_button', function () {
    var broker;
    var view;
    var metrics;
    var windowMock;

    beforeEach(function () {

      $('#container').html('<div id="fox-logo"></div>');

      broker = new OAuthBroker();
      metrics = new Metrics();
      windowMock = new WindowMock();

      view = new View({
        broker: broker,
        metrics: metrics,
        window: windowMock,
        screenName: 'signup'
      });
    });

    afterEach(function () {
      $('#container').empty();
      view.remove();
      view.destroy();
    });

    describe('render', function () {
      it('adds the close button to the DOM', function () {
        assert.equal($('#close').length, 0);
        return view.render()
          .then(function () {
            assert.equal($('#close').length, 1);
          });
      });
    });

    describe('close', function () {
      it('tells the broker to cancel the OAuth flow', function () {
        sinon.stub(broker, 'cancel', function () {
          return p();
        });

        return view.close()
          .then(function () {
            assert.isTrue(broker.cancel.called);
            assert.isFalse(view.isErrorVisible());
          });
      });

      it('logs an error', function () {
        sinon.stub(broker, 'cancel', function () {
          return p();
        });

        return view.close()
          .then(function () {
            assert.isTrue(TestHelpers.isErrorLogged(
                  metrics, OAuthErrors.toError('USER_CANCELED_OAUTH_LOGIN', view.getScreenName())));
          });
      });

      it('displays any errors the broker returns', function () {
        sinon.stub(broker, 'cancel', function () {
          return p.reject(new Error('uh oh'));
        });

        return view.close()
          .then(function () {
            assert.isTrue(broker.cancel.called);
            assert.isTrue(view.isErrorVisible());
          });
      });
    });
  });
});


