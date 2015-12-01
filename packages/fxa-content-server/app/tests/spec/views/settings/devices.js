/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');
  var _ = require ('underscore');
  var Able = require('lib/able');
  var assert = require('chai').assert;
  var BaseView = require('views/base');
  var Devices = require('models/devices');
  var Notifier = require('lib/channels/notifier');
  var p = require('lib/promise');
  var sinon = require('sinon');
  var User = require('models/user');
  var View = require('views/settings/devices');

  describe('views/settings/devices', function () {
    var devices;
    var notifier;
    var parentView;
    var user;
    var view;
    var able;

    function initView () {
      view = new View({
        able: able,
        devices: devices,
        notifier: notifier,
        parentView: parentView,
        user: user
      });

      return view.render();
    }

    function setupReRenderTest(testAction) {
      return initView()
        .then(function () {
          var deferred = p.defer();

          view.on('rendered', deferred.resolve.bind(deferred));

          if (_.isFunction(testAction)) {
            testAction();
          }

          return deferred.promise;
        });
    }

    beforeEach(function () {
      able = new Able();
      sinon.stub(able, 'choose', function () {
        return true;
      });
      notifier = new Notifier();
      parentView = new BaseView();
      user = new User();

      devices = new Devices([
        {
          id: 'device-1',
          isCurrentDevice: false,
          name: 'alpha'
        },
        {
          id: 'device-2',
          isCurrentDevice: true,
          name: 'beta'
        }
      ], {
        notifier: notifier
      });
    });

    afterEach(function () {
      view.remove();
      view.destroy();

      view = null;
    });

    describe('constructor', function () {
      beforeEach(function () {
        view = new View({
          notifier: notifier,
          parentView: parentView,
          user: user
        });
      });

      it('creates a `Devices` instance if one not passed in', function () {
        assert.ok(view._devices);
      });
    });

    describe('render', function () {
      beforeEach(function () {
        sinon.spy(devices, 'fetch');

        return initView();
      });

      it('does not fetch the device list immediately to avoid startup XHR requests', function () {
        assert.isFalse(devices.fetch.called);
      });

      it('renders devices already in the collection', function () {
        assert.ok(view.$('li.device').length, 2);
      });
    });

    describe('device added to collection', function () {
      beforeEach(function () {
        return setupReRenderTest(function () {
          devices.add({
            id: 'device-3',
            name: 'delta'
          });
        });
      });

      it('adds new device to list', function () {
        assert.lengthOf(view.$('li.device'), 3);
        assert.include(view.$('#device-3 .device-name').text().trim(), 'delta');
      });
    });

    describe('device removed from collection', function () {
      beforeEach(function () {
        return setupReRenderTest(function () {
          // DOM needs written so that device remove animation completes
          $('#container').html(view.el);
          devices.get('device-1').destroy();
        });
      });

      it('removes device from list', function () {
        assert.lengthOf(view.$('li.device'), 1);
        assert.lengthOf(view.$('#device-2'), 1);
      });
    });

    describe('openPanel', function () {
      beforeEach(function () {
        return initView()
          .then(function () {
            sinon.stub(view, '_fetchDevices', function () {
            });
            return view.openPanel();
          });
      });

      it('fetches the device list', function () {
        assert.isTrue(view._fetchDevices.called);
      });
    });

    describe('click to disconnect device', function () {
      beforeEach(function () {
        return initView()
          .then(function () {
            // click events require the view to be in the DOM
            $('#container').html(view.el);

            sinon.stub(view, '_destroyDevice', function () {
              return p();
            });

            $('#device-2 .device-disconnect').click();
          });
      });

      it('calls `_destroyDevice` with the deviceId', function () {
        assert.isTrue(view._destroyDevice.calledWith('device-2'));
      });
    });

    describe('refresh list behaviour', function () {
      beforeEach(function () {
        return initView()
          .then(function () {
            // click events require the view to be in the DOM
            $('#container').html(view.el);
          });
      });

      it('calls `render` when refreshed', function (done) {
        sinon.spy(view, 'render');
        sinon.stub(view, 'isPanelOpen', function () {
          return true;
        });

        sinon.stub(view.user, 'fetchAccountDevices', function () {
          return p();
        });

        $('.devices-refresh').click();
        setTimeout(function () {
          // render delayed by device request promises
          assert.isTrue(view.render.called);
          view.render.restore();
          done();
        }, 150);
      });

      it('calls `_fetchDevices` using a button', function () {
        sinon.stub(view, 'isPanelOpen', function () {
          return true;
        });

        sinon.stub(view, '_fetchDevices', function () {
          return p();
        });

        $('.devices-refresh').click();
        assert.isTrue(view._fetchDevices.called);
      });

    });

    describe('_fetchDevices', function () {
      beforeEach(function () {
        sinon.stub(user, 'fetchAccountDevices', function () {
          return p();
        });

        return initView()
          .then(function () {
            return view._fetchDevices();
          });
      });

      it('delegates to the user to fetch the device list', function () {
        var account = view.getSignedInAccount();
        assert.isTrue(user.fetchAccountDevices.calledWith(account, devices));
      });
    });

    describe('_destroyDevice', function () {
      var deviceToDestroy;

      beforeEach(function () {
        sinon.stub(user, 'destroyAccountDevice', function () {
          return p();
        });

        return initView()
          .then(function () {
            deviceToDestroy = devices.get('device-1');
            return view._destroyDevice('device-1');
          });
      });

      it('delegates to the user to destroy the device', function () {
        var account = view.getSignedInAccount();
        assert.isTrue(
          user.destroyAccountDevice.calledWith(account, deviceToDestroy));
      });
    });
  });
});
