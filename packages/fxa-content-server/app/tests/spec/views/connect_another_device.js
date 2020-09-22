/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import Account from 'models/account';
import { assert } from 'chai';
import AuthBroker from 'models/auth_brokers/base';
import Backbone from 'backbone';
import Notifier from 'lib/channels/notifier';
import Relier from 'models/reliers/relier';
import sinon from 'sinon';
import User from 'models/user';
import View from 'views/connect_another_device';
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
    describe('with a Fx desktop user that is signed in', () => {
      beforeEach(() => {
        sinon.stub(view, '_isSignedIn').callsFake(() => true);

        windowMock.navigator.userAgent =
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:55.0) Gecko/20100101 Firefox/55.0';

        return view.render().then(() => {
          view.afterVisible();
        });
      });

      it('shows the marketing area, logs appropriately', () => {
        assert.isTrue(view._isSignedIn.called);
        assert.lengthOf(view.$('.marketing-area'), 1);
        testIsFlowEventLogged('signedin.true');
        testIsFlowEventLogged('signin.ineligible');
        testIsFlowEventLogged('install_from.fx_desktop');
      });

      it('shows the success message', () => {
        assert.lengthOf(view.$('.success'), 1);
      });
    });

    ['fxa_discoverability_native', 'fxa_app_menu', 'preferences'].forEach(
      (entrypoint) => {
        describe(`with a Fx desktop user that can pair from ${entrypoint}`, () => {
          beforeEach(() => {
            sinon.stub(view, '_isSignedIn').callsFake(() => true);
            relier.set('entrypoint', entrypoint);
            relier.set('context', 'fx_desktop_v3');
            sinon.spy(view, 'navigate');

            windowMock.navigator.userAgent =
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:55.0) Gecko/20100101 Firefox/55.0';

            return view.render().then(() => {
              view.afterVisible();
            });
          });

          it('shows pairing', () => {
            assert.isTrue(view._isSignedIn.called);
            assert.isTrue(view.navigate.calledWith('/pair'));
          });
        });
      }
    );

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

      it('shows the success message', () => {
        assert.lengthOf(view.$('.success'), 1);
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

    describe('with a user that cannot sign in', () => {
      beforeEach(() => {
        sinon.stub(view, '_isSignedIn').callsFake(() => false);
        sinon.stub(view, '_canSignIn').callsFake(() => false);
      });

      it('shows FxiOS help text, and marketing area to users on FxiOS', () => {
        sinon.stub(view, 'getUserAgent').callsFake(() => {
          return {
            isAndroid: () => false,
            isFirefox: () => true,
            isFirefoxAndroid: () => false,
            isFirefoxDesktop: () => false,
            isFirefoxIos: () => true,
            isIos: () => true,
            supportsSvgTransformOrigin: () => true,
          };
        });

        return view.render().then(() => {
          view.afterVisible();
          assert.isTrue(view._isSignedIn.called);

          assert.lengthOf(view.$('#signin-fxios'), 1);
          assert.lengthOf(view.$('.marketing-area'), 1);
          testIsFlowEventLogged('signin_from.fx_ios');
        });
      });

      it('shows iOS text, marketing area to users on iOS', () => {
        sinon.stub(view, 'getUserAgent').callsFake(() => {
          return {
            isAndroid: () => false,
            isFirefox: () => false,
            isFirefoxAndroid: () => false,
            isFirefoxDesktop: () => false,
            isFirefoxIos: () => false,
            isIos: () => true,
            supportsSvgTransformOrigin: () => true,
          };
        });

        return view.render().then(() => {
          view.afterVisible();

          assert.lengthOf(view.$('#install-mobile-firefox-ios'), 1);
          assert.lengthOf(view.$('.marketing-area'), 1);
          testIsFlowEventLogged('install_from.other_ios');
        });
      });

      it('shows Android text, marketing area to users on Android', () => {
        sinon.stub(view, 'getUserAgent').callsFake(() => {
          return {
            isAndroid: () => true,
            isFirefox: () => false,
            isFirefoxAndroid: () => false,
            isFirefoxDesktop: () => false,
            isFirefoxIos: () => false,
            isIos: () => false,
            supportsSvgTransformOrigin: () => true,
          };
        });

        return view.render().then(() => {
          view.afterVisible();

          assert.lengthOf(view.$('#install-mobile-firefox-android'), 1);
          assert.lengthOf(view.$('.marketing-area'), 1);
          testIsFlowEventLogged('install_from.other_android');
        });
      });

      it('shows FxDesktop text, marketing area to Fx Desktop users', () => {
        sinon.stub(view, 'getUserAgent').callsFake(() => {
          return {
            isAndroid: () => false,
            isFirefox: () => true,
            isFirefoxAndroid: () => false,
            isFirefoxDesktop: () => true,
            isFirefoxIos: () => false,
            isIos: () => false,
            supportsSvgTransformOrigin: () => true,
          };
        });

        return view.render().then(() => {
          view.afterVisible();

          assert.lengthOf(view.$('#install-mobile-firefox-desktop'), 1);
          assert.lengthOf(view.$('.marketing-area'), 1);
          testIsFlowEventLogged('install_from.fx_desktop');
        });
      });

      it('shows Other text, marketing area to everyone else', () => {
        sinon.stub(view, 'getUserAgent').callsFake(() => {
          return {
            isAndroid: () => false,
            isFirefox: () => false,
            isFirefoxAndroid: () => false,
            isFirefoxDesktop: () => false,
            isFirefoxIos: () => false,
            isIos: () => false,
            supportsSvgTransformOrigin: () => true,
          };
        });

        return view.render().then(() => {
          view.afterVisible();

          assert.lengthOf(view.$('#install-mobile-firefox-other'), 1);
          assert.lengthOf(view.$('.marketing-area'), 1);
          testIsFlowEventLogged('install_from.other');
        });
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
        assert.lengthOf(view.$('.success'), 0);
      });
    });

    describe('with showSuccessMessage in the search params', () => {
      beforeEach(() => {
        sinon.stub(view, '_isSignedIn').callsFake(() => true);

        windowMock.navigator.userAgent =
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:55.0) Gecko/20100101 Firefox/55.0';
        windowMock.location.search = 'showSuccessMessage=true';

        return view.render().then(() => {
          view.afterVisible();
        });
      });

      it('shows the success message', () => {
        assert.lengthOf(view.$('.success'), 1);
      });
    });

    describe('with a Fx desktop sync declined user', () => {
      beforeEach(() => {
        sinon.stub(view, '_isSignedIn').callsFake(() => true);
        relier.set('syncPreference', false);

        windowMock.navigator.userAgent =
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:55.0) Gecko/20100101 Firefox/55.0';

        return view.render().then(() => {
          view.afterVisible();
        });
      });

      it('shows the marketing area, logs appropriately', () => {
        assert.isTrue(view._isSignedIn.called);
        assert.lengthOf(view.$('.marketing-area'), 1);
        testIsFlowEventLogged('signedin.true');
        testIsFlowEventLogged('signin.ineligible');
        testIsFlowEventLogged('install_from.fx_desktop');
      });

      it('shows the success message', () => {
        assert.lengthOf(view.$('.success'), 1);
      });
    });

    describe('with a Fx desktop user that completed sign-in', () => {
      beforeEach(() => {
        sinon.stub(view, 'isSignIn').callsFake(() => true);
        sinon.stub(view, '_areSmsRequirementsMet').callsFake(() => true);
        sinon.spy(view, 'replaceCurrentPage');

        windowMock.navigator.userAgent =
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:55.0) Gecko/20100101 Firefox/55.0';

        return view.render().then(() => {
          view.afterVisible();
        });
      });

      it('shows qr code cad', () => {
        assert.isTrue(view.isSignIn.called);
        assert.isTrue(
          view.replaceCurrentPage.calledWith(
            '/post_verify/cad_qr/get_started',
            { account }
          )
        );
      });
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

    describe('click on `why`', () => {
      beforeEach(() => {
        view.$('a[href="/connect_another_device/why"]').click();
      });

      it('notifies of click', () => {
        testIsFlowEventLogged('link.why');
      });
    });
  });

  describe('svg-graphic', () => {
    const userAgentObj = {
      isAndroid: () => false,
      isFirefox: () => true,
      isFirefoxAndroid: () => false,
      isFirefoxDesktop: () => true,
      isFirefoxIos: () => false,
      isIos: () => false,
      supportsSvgTransformOrigin: () => true,
    };

    beforeEach(() => {
      account.set('email', 'testuser@testuser.com');
      sinon.stub(user, 'isSignedInAccount').callsFake(() => false);
      sinon.stub(view, '_canSignIn').callsFake(() => true);
      return view.render();
    });

    it('shows animated hearts where supportsSvgTransformOrigin is supported', () => {
      sinon.stub(view, 'getUserAgent').callsFake(() => userAgentObj);
      assert.equal(
        view.$el.find('.graphic-connect-another-device-hearts').length,
        1
      );
      assert.equal(view.$el.find('.graphic-connect-another-device').length, 0);
    });

    it('shows non-animated hearts where supportsSvgTransformOrigin is not supported', () => {
      userAgentObj.supportsSvgTransformOrigin = () => false;
      sinon.stub(view, 'getUserAgent').callsFake(() => userAgentObj);
      return view.render().then(() => {
        assert.equal(
          view.$el.find('.graphic-connect-another-device-hearts').length,
          0
        );
        assert.equal(
          view.$el.find('.graphic-connect-another-device').length,
          1
        );
      });
    });
  });
});
