/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Backbone from 'backbone';
import { assert } from 'chai';
import $ from 'jquery';
import Notifier from 'lib/channels/notifier';
import Account from 'models/account';
import AuthBroker from 'models/auth_brokers/base';
import Relier from 'models/reliers/relier';
import User from 'models/user';
import sinon from 'sinon';
import View from 'views/connect_another_device';
import GleanMetrics from '../../../scripts/lib/glean';
import WindowMock from '../../mocks/window';

describe('views/connect_another_device', () => {
  let account;
  let broker;
  let model;
  let notifier;
  let relier;
  let user;
  let view;
  let windowMock;

  const FXA_CONNECTED_SELECTOR = '#fxa-connected-heading';
  const FXA_UNSUPPORTED_HEADER_SELECTOR = '#unsupported-header';

  beforeEach(() => {
    account = new Account();

    relier = new Relier();
    broker = new AuthBroker({ relier });
    broker.setCapability('emailVerificationMarketingSnippet', true);

    model = new Backbone.Model({ account, showSuccessMessage: true });
    windowMock = new WindowMock();

    notifier = new Notifier();
    sinon.spy(notifier, 'trigger');

    user = new User();

    view = new View({
      broker,
      model,
      notifier,
      relier,
      user,
      window: windowMock,
    });
    sinon.spy(view, 'logFlowEvent');
  });

  afterEach(() => {
    view.destroy(true);
    view = null;
  });

  function testIsFlowEventLogged(eventName) {
    assert.isTrue(view.logFlowEvent.calledWith(eventName), eventName);
  }

  describe('render/afterVisible', () => {
    let viewEventStub;
    describe('with a Fx desktop user that is signed in navigate to pair', () => {
      beforeEach(() => {
        viewEventStub = sinon.stub(GleanMetrics.cad, 'view');
        sinon.stub(view, '_isSignedIn').callsFake(() => true);
        sinon.spy(view, 'navigate');

        windowMock.navigator.userAgent =
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:55.0) Gecko/20100101 Firefox/55.0';

        return view.render().then(() => {
          view.afterVisible();
        });
      });

      afterEach(() => {
        viewEventStub.restore();
      });

      it('logs the view event', () => {
        sinon.assert.calledOnce(viewEventStub);
      });

      it('navigates to pair', () => {
        assert.isTrue(view.navigate.calledWith('/pair'));
      });
    });

    [
      'fxa_discoverability_native',
      'preferences',
      'synced-tabs',
      'tabs-sidebar',
      'fxa_app_menu',
    ].forEach((entrypoint) => {
      describe(`with a Fx desktop user that can pair from ${entrypoint}`, () => {
        beforeEach(() => {
          viewEventStub = sinon.stub(GleanMetrics.cad, 'view');
          sinon.stub(view, '_isSignedIn').callsFake(() => true);
          relier.set('entrypoint', entrypoint);
          sinon.spy(view, 'navigate');
          windowMock.navigator.userAgent =
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:55.0) Gecko/20100101 Firefox/55.0';
        });

        afterEach(() => {
          viewEventStub.restore();
        });

        it('does not log a view event', () => {
          sinon.assert.notCalled(viewEventStub);
        });

        describe('with fx_desktop_v3 context', () => {
          beforeEach(() => {
            relier.set('context', 'fx_desktop_v3');
            return view.render().then(() => {
              view.afterVisible();
            });
          });
          it('redirects and shows pairing', () => {
            assert.isTrue(view._isSignedIn.called);
            assert.isTrue(view.navigate.calledWith('/pair'));
          });
        });

        describe('with oauth_webchannel_v1 context', () => {
          beforeEach(() => {
            relier.set('context', 'oauth_webchannel_v1');
            return view.render().then(() => {
              view.afterVisible();
            });
          });
          it('redirects and shows pairing', () => {
            assert.isTrue(view._isSignedIn.called);
            assert.isTrue(view.navigate.calledWith('/pair'));
          });
        });
      });
    });

    [
      'preferences',
      'synced-tabs',
      'tabs-sidebar',
      'fxa_app_menu',
      'fx-view',
    ].forEach((entrypoint) => {
      describe(`with known entrypoint ${entrypoint} and action=email`, () => {
        beforeEach(() => {
          viewEventStub = sinon.stub(GleanMetrics.cad, 'view');
          sinon.stub(view, '_isSignedIn').callsFake(() => true);
          relier.set('entrypoint', entrypoint);
          relier.set('context', 'fx_desktop_v3');
          // These entrypoints without `action=email` redirect. If present, they do not redirect.
          relier.set('action', 'email');
          sinon.spy(view, 'navigate');

          windowMock.location.search = `?entrypoint=${entrypoint}`;
          windowMock.navigator.userAgent =
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:55.0) Gecko/20100101 Firefox/55.0';

          return view.render().then(() => {
            view.afterVisible();
          });
        });

        afterEach(() => {
          viewEventStub.restore();
        });

        it('logs the view event', () => {
          sinon.assert.calledOnce(viewEventStub);
        });

        it('navigates to pair', () => {
          assert.isTrue(view.navigate.calledWith('/pair'));
        });
      });
    });

    describe('with a fennec user that is signed in', () => {
      beforeEach(() => {
        sinon.stub(view, 'getUserAgent').callsFake(() => {
          return {
            isAndroid: () => true,
            isFirefox: () => true,
            isFirefoxAndroid: () => true,
            isFirefoxDesktop: () => false,
            isFirefoxIos: () => false,
            isIos: () => false,
            supportsSvgTransformOrigin: () => true,
            isMobile: () => true,
          };
        });

        sinon.stub(view, '_isSignedIn').callsFake(() => true);

        return view.render().then(() => {
          view.afterVisible();
        });
      });

      it('shows the marketing area, logs appropriately', () => {
        assert.isTrue(view._isSignedIn.called);
        assert.lengthOf(view.$('.marketing-area'), 1);
        testIsFlowEventLogged('signedin.true');
        testIsFlowEventLogged('signin.ineligible');
        testIsFlowEventLogged('install_from.fx_android');
      });

      it('shows unsupported messaging', () => {
        assert.lengthOf(view.$(FXA_UNSUPPORTED_HEADER_SELECTOR), 1);
      });
    });

    describe('with a Fx desktop user that can sign in', () => {
      beforeEach(() => {
        sinon.stub(view, 'getUserAgent').callsFake(() => {
          return {
            isAndroid: () => false,
            isFirefox: () => true,
            isFirefoxAndroid: () => false,
            isFirefoxDesktop: () => true,
            isFirefoxIos: () => false,
            isIos: () => false,
            supportsSvgTransformOrigin: () => true,
            isMobile: () => false,
          };
        });

        account.set('email', 'testuser@testuser.com');
        sinon.stub(view, '_isSignedIn').callsFake(() => false);
        sinon.stub(view, '_canSignIn').callsFake(() => true);

        return view.render().then(() => {
          view.afterVisible();
        });
      });

      it('shows a sign in button with the appropriate link, logs appropriately', () => {
        assert.isTrue(view._isSignedIn.called);
        assert.lengthOf(view.$('#signin'), 1);
        testIsFlowEventLogged('signedin.false');
        testIsFlowEventLogged('signin.eligible');
        testIsFlowEventLogged('signin_from.fx_desktop');
      });

      it('shows the success message', () => {
        assert.lengthOf(view.$('.success'), 1);
      });
    });

    describe('with a fennec user that can sign in', () => {
      beforeEach(() => {
        sinon.stub(view, 'getUserAgent').callsFake(() => {
          return {
            isAndroid: () => true,
            isFirefox: () => true,
            isFirefoxAndroid: () => true,
            isFirefoxDesktop: () => false,
            isFirefoxIos: () => false,
            isIos: () => false,
            supportsSvgTransformOrigin: () => true,
            isMobile: () => true,
          };
        });

        account.set('email', 'testuser@testuser.com');
        sinon.stub(view, '_isSignedIn').callsFake(() => false);
        sinon.stub(view, '_canSignIn').callsFake(() => true);

        return view.render().then(() => {
          view.afterVisible();
        });
      });

      it('shows a sign in button with the appropriate link, logs appropriately', () => {
        assert.isTrue(view._isSignedIn.called);
        assert.lengthOf(view.$('#signin'), 1);
        testIsFlowEventLogged('signedin.false');
        testIsFlowEventLogged('signin.eligible');
        testIsFlowEventLogged('signin_from.fx_android');
      });

      it('shows the success message', () => {
        assert.lengthOf(view.$('.success'), 1);
      });
    });

    describe('with showSuccessMessage set to false', () => {
      beforeEach(() => {
        model.set('showSuccessMessage', false);
        sinon.stub(view, '_isSignedIn').callsFake(() => true);

        windowMock.navigator.userAgent =
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:55.0) Gecko/20100101 Firefox/55.0';

        return view.render().then(() => {
          view.afterVisible();
        });
      });

      it('does not show the success message', () => {
        assert.lengthOf(view.$(FXA_CONNECTED_SELECTOR), 0);
      });
    });

    describe('with a Fx desktop sync declined user', () => {
      beforeEach(() => {
        sinon.stub(view, '_isSignedIn').callsFake(() => true);
        relier.set('syncPreference', false);

        windowMock.navigator.userAgent =
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:55.0) Gecko/20100101 Firefox/55.0';
        sinon.spy(view, 'navigate');
        return view.render().then(() => {
          view.afterVisible();
        });
      });

      it('navigates to pair', () => {
        // Even though Sync isn't enabled, a user can still pair a device
        assert.isTrue(view.navigate.calledWith('/pair'));
      });
    });
  });

  describe('with `redirect_immediately`', () => {
    beforeEach(() => {
      relier.set('context', 'fx_desktop_v3');
      windowMock.location.search = `?redirect_immediately=true&redirect_to=123`;
      sinon.spy(view, 'navigate');
    });

    it('sends the user to /settings when `redirect_immediately` set to true', () => {
      view.beforeRender();
      assert.isTrue(view.navigate.calledWith('/settings'));
    });

    it(`doesn't send the user to /settings if false`, () => {
      windowMock.location.search = `?redirect_immediately=false&redirect_to=123`;
      view.beforeRender();
      assert.isFalse(view.navigate.calledWith('/settings'));
    });
  });

  describe('_isSignedIn', () => {
    it('returns `true` if the account is signed', () => {
      sinon.stub(user, 'isSignedInAccount').callsFake(() => true);
      broker.set('isVerificationSameBrowser', false);

      assert.isTrue(view._isSignedIn());
      assert.isTrue(user.isSignedInAccount.calledOnce);
      assert.isTrue(user.isSignedInAccount.calledWith(account));
    });

    it('returns `true` if verifying in the same browser', () => {
      sinon.stub(user, 'isSignedInAccount').callsFake(() => false);
      broker.set('isVerificationSameBrowser', true);

      assert.isTrue(view._isSignedIn());
    });

    it('returns `false` otherwise', () => {
      sinon.stub(user, 'isSignedInAccount').callsFake(() => false);
      broker.set('isVerificationSameBrowser', false);

      assert.isFalse(view._isSignedIn());
    });
  });

  describe('_canSignIn', () => {
    it('returns `false` if user is signed in', () => {
      sinon.stub(user, 'isSignedInAccount').callsFake(() => true);
      sinon.stub(view, 'isSyncAuthSupported').callsFake(() => true);

      assert.isFalse(view._canSignIn());
    });

    it('returns `false` if sync authentication not supported', () => {
      sinon.stub(user, 'isSignedInAccount').callsFake(() => false);
      sinon.stub(view, 'isSyncAuthSupported').callsFake(() => false);

      assert.isFalse(view._canSignIn());
    });

    it('returns `true` if not signed in, sync authentication supported', () => {
      sinon.stub(user, 'isSignedInAccount').callsFake(() => false);
      sinon.stub(view, 'isSyncAuthSupported').callsFake(() => true);

      assert.isTrue(view._canSignIn());
    });
  });

  describe('_getEscapedSignInUrl', () => {
    const SYNC_URL =
      'https://accounts.firefox.com/?action=email&context=fx_desktop_v3&service=sync&email=testuser@testuser.com';

    beforeEach(() => {
      sinon.stub(view, 'getEscapedSyncUrl').callsFake(() => SYNC_URL);
    });

    it('returns the expected URL', () => {
      assert.equal(
        view._getEscapedSignInUrl('testuser@testuser.com'),
        SYNC_URL
      );

      assert.isTrue(
        view.getEscapedSyncUrl.calledOnceWith('', View.ENTRYPOINT, {
          action: 'email',
          email: 'testuser@testuser.com',
          //eslint-disable-next-line camelcase
          utm_source: 'email',
        })
      );
    });
  });

  describe('clicks', () => {
    beforeEach(() => {
      sinon.stub(view, 'getUserAgent').callsFake(() => {
        return {
          isAndroid: () => false,
          isFirefox: () => true,
          isFirefoxAndroid: () => false,
          isFirefoxDesktop: () => true,
          isFirefoxIos: () => false,
          isIos: () => false,
          supportsSvgTransformOrigin: () => true,
          isMobile: () => false,
        };
      });

      account.set('email', 'testuser@testuser.com');
      sinon.stub(user, 'isSignedInAccount').callsFake(() => false);
      sinon.stub(view, '_canSignIn').callsFake(() => true);

      return view.render().then(() => {
        $('#container').html(view.el);
      });
    });

    describe('click on sign-in', () => {
      beforeEach(() => {
        view.$('#signin').click();
      });

      it('notifies of click', () => {
        testIsFlowEventLogged('link.signin');
      });
    });
  });
});
