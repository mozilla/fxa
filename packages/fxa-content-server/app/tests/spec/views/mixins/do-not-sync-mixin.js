/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import DoNotSyncMixin from 'views/mixins/do-not-sync-mixin';
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

Cocktail.mixin(View, DoNotSyncMixin);

describe('views/mixins/do-not-sync-mixin', function() {
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
        assert.isTrue(relier.get('doNotSync'));
        assert.isTrue(view.logFlowEvent.calledOnce);
        assert.isTrue(view.logFlowEvent.calledWith('cwts_do_not_sync', 'test'));
      });
    });
  });
});
