/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import chai from 'chai';
import Metrics from 'lib/metrics';
import Notifier from 'lib/channels/notifier';
import Relier from 'models/reliers/relier';
import sinon from 'sinon';
import TestHelpers from '../../../lib/helpers';
import User from 'models/user';
import View from 'views/settings/display_name';

var assert = chai.assert;

describe('views/settings/display_name', function() {
  var view;
  var metrics;
  var user;
  var email;
  var account;
  var relier;
  var notifier;

  beforeEach(function() {
    email = TestHelpers.createEmail();
    user = new User();
    relier = new Relier();
    notifier = new Notifier();
    metrics = new Metrics({ notifier });
    account = user.initAccount({
      email: email,
      sessionToken: 'fake session token',
      uid: 'uid',
      verified: true,
    });
  });

  afterEach(function() {
    metrics.destroy();

    view.remove();
    view.destroy();

    view = metrics = null;
  });

  function initView() {
    view = new View({
      metrics: metrics,
      notifier: notifier,
      relier: relier,
      user: user,
    });

    sinon.stub(view, 'getSignedInAccount').callsFake(function() {
      return account;
    });

    sinon.stub(view, 'checkAuthorization').callsFake(function() {
      return Promise.resolve(true);
    });
    sinon.stub(account, 'fetchProfile').callsFake(function() {
      return Promise.resolve();
    });
    sinon.stub(user, 'setAccount').callsFake(function() {
      return Promise.resolve();
    });

    return view.render().then(function() {
      $('#container').html(view.el);
    });
  }

  describe('renders', function() {
    it('renders the displayName correctly', function() {
      var name = 'joe cool';
      account.set('displayName', name);

      return initView().then(function() {
        assert.isTrue(account.fetchProfile.called);
        assert.isTrue(user.setAccount.calledWith(account));
        assert.equal(view.getElementValue('input.display-name'), name);
      });
    });

    it('onProfileUpdate', function() {
      return initView().then(function() {
        sinon.stub(view, 'render').callsFake(function() {
          return Promise.resolve();
        });
        view.onProfileUpdate();
        assert.isTrue(view.render.called);
      });
    });
  });

  describe('with session', function() {
    it('has no display name set', function() {
      account.set('displayName', null);
      return initView().then(function() {
        assert.equal(view.$('.add-button').length, 1);
        assert.equal(view.$('.settings-unit-toggle.primary-button').length, 1);
      });
    });

    it('has a display name set', function() {
      account.set('displayName', 'joe');
      return initView().then(function() {
        assert.equal(view.$('.change-button').length, 1);
        assert.equal(
          view.$('.settings-unit-toggle.secondary-button').length,
          1
        );
      });
    });
  });

  describe('isValidStart', function() {
    it('validates the display name field for changes', function() {
      account.set('displayName', 'joe');
      return initView().then(function() {
        view.$('.display-name').val('joe');
        assert.equal(view.isValidStart(), false, 'name did not change');

        view.$('.display-name').val('joe change');
        assert.equal(view.isValidStart(), true, 'name changed');
      });
    });

    it('validates the display name field when it is not set', function() {
      account.set('displayName', null);
      return initView().then(function() {
        view.$('.display-name').val('');
        assert.equal(view.isValidStart(), false, 'name did not change');

        view.$('.display-name').val('changed');
        assert.equal(view.isValidStart(), true, 'name changed');
      });
    });
  });

  describe('submit', function() {
    it('submits correctly', function() {
      var name = '  joe cool  ';
      sinon.stub(account, 'postDisplayName').callsFake(function() {
        return Promise.resolve();
      });

      return initView()
        .then(() => {
          sinon.stub(view, 'updateDisplayName').callsFake(function() {
            return Promise.resolve();
          });
          sinon.stub(view, 'displaySuccess').callsFake(function() {
            return Promise.resolve();
          });
          sinon.spy(view, 'logFlowEvent');
          sinon.spy(view, 'render');
          sinon.spy(view, 'navigate');

          view.$('input.display-name').val(name);
          return view.submit();
        })
        .then(() => {
          const expectedName = name.trim();
          assert.isTrue(account.postDisplayName.calledWith(expectedName));
          assert.isTrue(view.updateDisplayName.calledWith(expectedName));
          assert.isTrue(view.displaySuccess.called);
          assert.isTrue(
            TestHelpers.isEventLogged(metrics, 'settings.display-name.success')
          );
          assert.isTrue(view.navigate.calledWith('settings'));

          assert.equal(view.logFlowEvent.callCount, 1);
          const args = view.logFlowEvent.args[0];
          assert.lengthOf(args, 1);
          const eventParts = args[0].split('.');
          assert.lengthOf(eventParts, 4);
          assert.equal(eventParts[0], 'timing');
          assert.equal(eventParts[1], 'displayName');
          assert.equal(eventParts[2], 'change');
          assert.match(eventParts[3], /^[0-9]+$/);
        });
    });
  });
});
