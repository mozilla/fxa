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
  var AttachedClients = require('models/attached-clients');
  var Notifier = require('lib/channels/notifier');
  var p = require('lib/promise');
  var sinon = require('sinon');
  var User = require('models/user');
  var View = require('views/settings/clients');

  describe('views/settings/clients', function () {
    var attachedClients;
    var notifier;
    var parentView;
    var user;
    var view;
    var able;

    function initView () {
      view = new View({
        able: able,
        attachedClients: attachedClients,
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

      attachedClients = new AttachedClients([
        {
          clientType: 'device',
          id: 'device-1',
          isCurrentDevice: false,
          name: 'alpha',
          type: 'tablet'
        },
        {
          clientType: 'device',
          id: 'device-2',
          isCurrentDevice: true,
          name: 'beta',
          type: 'mobile'
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

      it('creates an `AttachedClients` instance if one not passed in', function () {
        assert.ok(view._attachedClients);
      });
    });

    describe('render', function () {
      beforeEach(function () {
        sinon.spy(attachedClients, 'fetch');

        return initView();
      });

      it('does not fetch the device list immediately to avoid startup XHR requests', function () {
        assert.isFalse(attachedClients.fetch.called);
      });

      it('renders attachedClients already in the collection', function () {
        assert.ok(view.$('li.client').length, 2);
      });

      it('renders attachedClients and apps if apps view enabled', function () {
        sinon.stub(view, '_isAppsListVisible', function () {
          return true;
        });
        assert.equal(view.$('#clients .settings-unit-title').text().trim(), 'Devices & apps');
        assert.ok(view.$('#clients').text().trim().indexOf('manage your attachedClients and apps below'));
      });

      it('properly sets the type of the device', function () {
        assert.ok(view.$('#device-1').hasClass('tablet'));
        assert.notOk(view.$('#device-1').hasClass('desktop'));
        assert.ok(view.$('#device-2').hasClass('mobile'));
        assert.notOk(view.$('#device-2').hasClass('desktop'));
      });
    });

    describe('device added to collection', function () {
      beforeEach(function () {
        return setupReRenderTest(function () {
          attachedClients.add({
            clientType: 'device',
            id: 'device-3',
            lastAccessTime: Date.now(),
            lastAccessTimeFormatted: 'a few seconds ago',
            name: 'delta',
            type: 'desktop'
          });
        });
      });

      it('adds new device to list', function () {
        assert.lengthOf(view.$('li.client'), 3);
        assert.include(view.$('#device-3 .client-name').text().trim(), 'delta');
        assert.include(view.$('#device-3 .client-name').attr('title'), 'delta', 'the title attr is correct');
        assert.isTrue(view.$('#device-3 .last-connected').text().trim().indexOf('Last active:') === 0, 'formats last active string');
        assert.isTrue(view.$('#device-3 .last-connected').text().trim().indexOf('a few seconds ago') >= 0, 'formats connected date');
        assert.ok(view.$('#device-3').hasClass('desktop'));
      });
    });

    describe('device removed from collection', function () {
      beforeEach(function () {
        return setupReRenderTest(function () {
          // DOM needs to be written so that device remove animation completes
          $('#container').html(view.el);
          attachedClients.get('device-1').destroy();
        });
      });

      it('removes device from list', function () {
        assert.lengthOf(view.$('li.client'), 1);
        assert.lengthOf(view.$('#device-2'), 1);
      });
    });

    describe('openPanel', function () {
      beforeEach(function () {
        return initView()
          .then(function () {
            sinon.stub(view, '_fetchAttachedClients', function () {
            });
            return view.openPanel();
          });
      });

      it('fetches the device list', function () {
        assert.isTrue(view._fetchAttachedClients.called);
      });
    });

    describe('click to disconnect device', function () {
      beforeEach(function () {
        return initView()
          .then(function () {
            // click events require the view to be in the DOM
            $('#container').html(view.el);

            sinon.spy(view, 'navigate');

            $('#device-2 .client-disconnect').click();
          });
      });

      it('navigates to confirmation dialog', function () {
        assert.isTrue(view.navigate.calledOnce);
        var args = view.navigate.args[0];
        assert.equal(args.length, 2);
        assert.equal(args[0], 'settings/clients/disconnect');
        assert.equal(args[1].clientId, 'device-2');
        assert.equal(args[1].clients, view._attachedClients);
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

        sinon.stub(view, '_fetchAttachedClients', function () {
          return p();
        });

        $('.clients-refresh').click();
        setTimeout(function () {
          // render delayed by device request promises
          assert.isTrue(view.render.called);
          view.render.restore();
          done();
        }, 150);
      });

      it('calls `_fetchAttachedClients` using a button', function () {
        sinon.stub(view, 'isPanelOpen', function () {
          return true;
        });

        sinon.stub(view, '_fetchAttachedClients', function () {
          return p();
        });

        $('.clients-refresh').click();
        assert.isTrue(view._fetchAttachedClients.called);
      });

    });

    describe('_fetchAttachedClients', function () {
      beforeEach(function () {
        sinon.stub(user, 'fetchAccountDevices', function () {
          return p();
        });

        sinon.stub(user, 'fetchAccountOAuthApps', function () {
          return p();
        });

        return initView()
          .then(function () {
            return view._fetchAttachedClients();
          });
      });

      it('delegates to the user to fetch the device list', function () {
        var account = view.getSignedInAccount();
        assert.isTrue(user.fetchAccountDevices.calledWith(account));
      });
    });
  });
});
