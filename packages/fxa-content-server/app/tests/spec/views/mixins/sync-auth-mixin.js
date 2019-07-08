/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import BaseView from 'views/base';
import Cocktail from 'cocktail';
import Constants from 'lib/constants';
import Relier from 'models/reliers/base';
import sinon from 'sinon';
import SyncAuthMixin from 'views/mixins/sync-auth-mixin';
import Url from 'lib/url';
import UserAgentMixin from 'lib/user-agent-mixin';
import WindowMock from '../../../mocks/window';

const SyncView = BaseView.extend({});

Cocktail.mixin(SyncView, SyncAuthMixin, UserAgentMixin);

describe('views/mixins/sync-auth-mixin', function() {
  let relier;
  let view;
  let windowMock;

  beforeEach(() => {
    relier = new Relier();
    windowMock = new WindowMock();

    view = new SyncView({
      relier,
      window: windowMock,
    });
  });

  describe('_getSyncContext', () => {
    it('returns fx_fennec_v1 for fennec', () => {
      sinon.stub(view, 'getUserAgent').callsFake(() => {
        return {
          isFirefoxAndroid: () => true,
          isFirefoxDesktop: () => false,
        };
      });

      assert.equal(view._getSyncContext(), Constants.FX_FENNEC_V1_CONTEXT);
    });

    it('returns fx_desktop_v3 for desktop users', () => {
      sinon.stub(view, 'getUserAgent').callsFake(() => {
        return {
          isFirefoxAndroid: () => false,
          isFirefoxDesktop: () => true,
        };
      });
      assert.equal(view._getSyncContext(), Constants.FX_DESKTOP_V3_CONTEXT);
    });
  });

  describe('getEscapedSyncUrl', () => {
    const CONTEXT = 'fx_desktop_v3';
    const EMAIL = 'testuser@testuser.com';
    const ENTRYPOINT = 'fxa:signup';
    const ORIGIN = 'https://accounts.firefox.com';
    const PATHNAME = 'signin';

    beforeEach(() => {
      windowMock.location.origin = ORIGIN;
      windowMock.navigator.userAgent =
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:55.0) Gecko/20100101 Firefox/55.0';

      relier.set({
        utmCampaign: 'campaign',
        utmContent: 'content',
        utmMedium: 'medium',
        utmSource: 'source',
        utmTerm: 'term',
      });
    });

    it('returns the expected URL', () => {
      const escapedSyncUrl = view.getEscapedSyncUrl(PATHNAME, ENTRYPOINT, {
        email: EMAIL,
      });

      const search = escapedSyncUrl.split('?')[1];
      const params = Url.searchParams(search);

      assert.deepEqual(params, {
        context: CONTEXT,
        email: EMAIL,
        entrypoint: ENTRYPOINT,
        service: Constants.SYNC_SERVICE,
        /* eslint-disable camelcase */
        utm_campaign: 'campaign',
        utm_content: 'content',
        utm_medium: 'medium',
        utm_source: 'source',
        utm_term: 'term',
        /* eslint-enable camelcase */
      });

      const origin = Url.getOrigin(escapedSyncUrl);
      assert.equal(origin, ORIGIN);
    });
  });

  describe('isSyncAuthSupported', () => {
    let areWebChannelsSupported;

    beforeEach(() => {
      sinon
        .stub(view, '_hasWebChannelSupport')
        .callsFake(() => areWebChannelsSupported);
    });

    it('returns true if web channels are supported', () => {
      areWebChannelsSupported = true;
      assert.isTrue(view.isSyncAuthSupported());
      areWebChannelsSupported = false;
      assert.isFalse(view.isSyncAuthSupported());
    });
  });

  describe('_hasWebChannelSupport', () => {
    it('returns `false` if not Firefox', () => {
      sinon.stub(view, 'getUserAgent').callsFake(() => {
        return {
          browser: {
            version: 52,
          },
          isFirefox: () => false,
          isFirefoxAndroid: () => false,
          isFirefoxDesktop: () => false,
          isFirefoxIos: () => false,
          isIos: () => false,
        };
      });

      assert.isFalse(view._hasWebChannelSupport());
    });

    it('returns `false` if Fx Desktop < 40', () => {
      sinon.stub(view, 'getUserAgent').callsFake(() => {
        return {
          browser: {
            version: 39,
          },
          isFirefox: () => true,
          isFirefoxAndroid: () => false,
          isFirefoxDesktop: () => true,
          isFirefoxIos: () => false,
          isIos: () => false,
        };
      });

      assert.isFalse(view._hasWebChannelSupport());
    });

    it('returns `false` if Fx Desktop < 43', () => {
      sinon.stub(view, 'getUserAgent').callsFake(() => {
        return {
          browser: {
            version: 42,
          },
          isFirefox: () => true,
          isFirefoxAndroid: () => true,
          isFirefoxDesktop: () => false,
          isFirefoxIos: () => false,
          isIos: () => false,
        };
      });

      assert.isFalse(view._hasWebChannelSupport());
    });

    it('returns `false` if Fx for iOS', () => {
      sinon.stub(view, 'getUserAgent').callsFake(() => {
        return {
          browser: {
            version: 6,
          },
          isFirefox: () => true,
          isFirefoxAndroid: () => false,
          isFirefoxDesktop: () => false,
          isFirefoxIos: () => true,
          isIos: () => true,
        };
      });

      assert.isFalse(view._hasWebChannelSupport());
    });

    it('returns true if Fx Desktop >= 40', () => {
      sinon.stub(view, 'getUserAgent').callsFake(() => {
        return {
          browser: {
            version: 40,
          },
          isFirefox: () => true,
          isFirefoxAndroid: () => false,
          isFirefoxDesktop: () => true,
          isFirefoxIos: () => false,
          isIos: () => false,
        };
      });

      assert.isTrue(view._hasWebChannelSupport());
    });

    it('returns true if Fennec >= 43', () => {
      sinon.stub(view, 'getUserAgent').callsFake(() => {
        return {
          browser: {
            version: 43,
          },
          isFirefox: () => true,
          isFirefoxAndroid: () => true,
          isFirefoxDesktop: () => false,
          isFirefoxIos: () => false,
          isIos: () => false,
        };
      });

      assert.isTrue(view._hasWebChannelSupport());
    });
  });
});
