/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import SyncOptionalMixin from 'views/mixins/sync-optional-mixin';
import BaseView from 'views/base';
import Relier from 'models/reliers/base';
import Broker from 'models/auth_brokers/base';
import Notifier from 'lib/channels/notifier';
import Cocktail from 'cocktail';
import sinon from 'sinon';

class View extends BaseView {
  template() {
    return '<a href="#" id="do-not-sync-device">Do not Sync</a>';
  }

  constructor(options) {
    super(options);
    this.onSubmitComplete = options.onSubmitComplete;
  }
}

Cocktail.mixin(View, SyncOptionalMixin);

describe('views/mixins/sync-optional-mixin', function() {
  let broker;
  let view;
  let relier;
  let notifier;

  beforeEach(function() {
    relier = new Relier();
    broker = new Broker();
    notifier = new Notifier();
    view = new View({
      relier,
      broker,
      notifier,
      onSubmitComplete: sinon.spy(),
    });
    view.viewName = 'test';
    sinon.stub(view, 'logFlowEvent').callsFake(() => {});

    return view.render();
  });

  describe('doNotSync', function() {
    it('triggers onSubmitComplete', () => {
      return view.doNotSync().then(() => {
        assert.isTrue(view.onSubmitComplete.calledOnce);
        assert.isFalse(relier.get('syncPreference'));
        assert.isTrue(
          view.logFlowEvent.calledOnceWith('cwts_do_not_sync', 'test')
        );
      });
    });
  });

  describe('disableSync', () => {
    it('logs and event, updates the relier', () => {
      view.disableSync();

      assert.isFalse(relier.get('syncPreference'));
      assert.isTrue(
        view.logFlowEvent.calledOnceWith('cwts_do_not_sync', 'test')
      );
    });
  });

  describe('enableSync', () => {
    it('updates the relier', () => {
      view.enableSync();
      assert.isTrue(relier.get('syncPreference'));
    });
  });
});
