/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import BaseView from 'views/base';
import Cocktail from 'cocktail';
import Notifier from 'lib/channels/notifier';
import SignedOutNotificationMixin from 'views/mixins/signed-out-notification-mixin';
import sinon from 'sinon';
import WindowMock from '../../../mocks/window';

const View = BaseView.extend({});
Cocktail.mixin(View, SignedOutNotificationMixin);

describe('views/mixins/signed-out-notification-mixin', () => {
  it('exports correct interface', () => {
    assert.lengthOf(Object.keys(SignedOutNotificationMixin), 3);
    assert.isObject(SignedOutNotificationMixin.notifications);
    assert.isFunction(
      SignedOutNotificationMixin.clearSessionAndNavigateToSignIn
    );
  });

  describe('new View', () => {
    let notifier;
    let view;
    let windowMock;

    beforeEach(() => {
      notifier = new Notifier();
      notifier.on = sinon.spy();
      windowMock = new WindowMock();
      view = new View({
        notifier: notifier,
        window: windowMock,
      });
      view.navigate = sinon.spy();
      view.navigateAway = sinon.spy();
      view.relier = {
        get: sinon.spy(),
      };
      view.user = {
        clearSignedInAccountUid: sinon.spy(),
      };
      notifier.triggerAll = sinon.spy();
    });

    afterEach(() => {
      view.destroy();
    });

    it('has the expected notifications', () => {
      assert.lengthOf(Object.keys(view.notifications), 1);
      assert.isTrue(Notifier.SIGNED_OUT in view.notifications);
    });

    describe('clearSessionAndNavigateToSignIn', () => {
      beforeEach(() => {
        notifier.on.args[0][1]();
      });

      it('calls user.clearSignedInAccountUid correctly', () => {
        assert.equal(view.user.clearSignedInAccountUid.callCount, 1);
        assert.lengthOf(view.user.clearSignedInAccountUid.args[0], 0);
      });

      it('navigated correctly', () => {
        assert.equal(view.navigateAway.callCount, 1);
        assert.equal(view.navigateAway.args[0][0], '/signin');
      });

      it('does not call notifier.triggerAll', () => {
        assert.equal(notifier.triggerAll.callCount, 0);
      });
    });

    describe('clearSessionAndNavigateToSignIn with relier data', () => {
      beforeEach(() => {
        view.relier.get = sinon.spy((key) => `mock_${key}`);
        notifier.on.args[0][1]();
      });

      it('calls user.clearSignedInAccountUid correctly', () => {
        assert.equal(view.user.clearSignedInAccountUid.callCount, 1);
        assert.lengthOf(view.user.clearSignedInAccountUid.args[0], 0);
      });

      it('navigated correctly', () => {
        assert.equal(view.navigateAway.callCount, 1);
        assert.equal(
          view.navigateAway.args[0][0],
          '/signin?' +
            [
              'context=mock_context',
              'entrypoint=mock_entrypoint',
              'entrypoint_experiment=mock_entrypointExperiment',
              'entrypoint_variation=mock_entrypointVariation',
              'service=mock_service',
              'utm_campaign=mock_utmCampaign',
              'utm_content=mock_utmContent',
              'utm_medium=mock_utmMedium',
              'utm_source=mock_utmSource',
              'utm_term=mock_utmTerm',
            ].join('&')
        );
      });
    });
  });
});
