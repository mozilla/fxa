/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import $ from 'jquery';
import Account from 'models/account';
import Backbone from 'backbone';
import Metrics from 'lib/metrics';
import Relier from 'models/reliers/relier';
import View from 'views/push/completed';
import _ from 'underscore';
import sinon from 'sinon';

describe('views/push/completed', () => {
  let account;
  let model;
  let relier;
  let view;
  let notifier;
  let metrics;

  beforeEach(() => {
    account = new Account({
      email: 'a@a.com',
      uid: 'uid',
    });

    relier = new Relier({});
    model = new Backbone.Model({
      account,
    });

    notifier = _.extend({}, Backbone.Events);
    metrics = new Metrics({ notifier });

    view = new View({
      model,
      relier,
      notifier,
      metrics,
    });

    sinon.stub(view, 'getSignedInAccount').callsFake(() => account);

    return view.render().then(() => $('#container').html(view.$el));
  });

  afterEach(() => {
    view.remove();
    view.destroy();
    view = null;
  });

  describe('render', () => {
    it('renders the view', () => {
      assert.lengthOf(view.$('#push-auth-complete-header'), 1);
      assert.include(
        view.$('.verification-message').text(),
        'Please close this page'
      );
    });

    describe('without an account', () => {
      beforeEach(() => {
        account = new Account({});
        sinon.spy(view, 'navigate');
        return view.render();
      });

      it('redirects to the email first page', () => {
        assert.isTrue(view.navigate.calledWith('/'));
      });
    });
  });
});
