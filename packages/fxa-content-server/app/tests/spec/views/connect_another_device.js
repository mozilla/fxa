/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const $ = require('jquery');
  const Account = require('models/account');
  const { assert } = require('chai');
  const AuthBroker = require('models/auth_brokers/base');
  const Backbone = require('backbone');
  const Constants = require('lib/constants');
  const Notifier = require('lib/channels/notifier');
  const Relier = require('models/reliers/relier');
  const sinon = require('sinon');
  const Url = require('lib/url');
  const User = require('models/user');
  const View = require('views/connect_another_device');
  const WindowMock = require('../../mocks/window');

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
      broker = new AuthBroker( { relier });
      broker.setCapability('emailVerificationMarketingSnippet', true);

      model = new Backbone.Model({ account });
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
        window: windowMock
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
          sinon.stub(user, 'isSignedInAccount', () => true);

          return view.render()
            .then(() => {
              view.afterVisible();
            });
        });

        it('shows the marketing area, logs appropriately', () => {
          assert.lengthOf(view.$('.marketing-area'), 1);
          testIsFlowEventLogged('signedin.true');
          testIsFlowEventLogged('signin.ineligible');
          testIsFlowEventLogged('install_from.fx_desktop');
        });
      });

      describe('with a fennec user that is signed in', () => {
        beforeEach(() => {
          sinon.stub(view, '_getUap', () => {
            return {
              isAndroid: () => true,
              isFirefox: () => true,
              isFirefoxAndroid: () => true,
              isFirefoxDesktop: () => false,
              isFirefoxIos: () => false,
              isIos: () => false
            };
          });

          sinon.stub(user, 'isSignedInAccount', () => true);

          return view.render()
            .then(() => {
              view.afterVisible();
            });
        });

        it('shows the marketing area, logs appropriately', () => {
          assert.lengthOf(view.$('.marketing-area'), 1);
          testIsFlowEventLogged('signedin.true');
          testIsFlowEventLogged('signin.ineligible');
          testIsFlowEventLogged('install_from.fx_android');
        });
      });

      describe('with a Fx desktop user that can sign in', () => {
        beforeEach(() => {
          sinon.stub(view, '_getUap', () => {
            return {
              isAndroid: () => false,
              isFirefox: () => true,
              isFirefoxAndroid: () => false,
              isFirefoxDesktop: () => true,
              isFirefoxIos: () => false,
              isIos: () => false
            };
          });

          account.set('email', 'testuser@testuser.com');
          sinon.stub(user, 'isSignedInAccount', () => false);
          sinon.stub(view, '_canSignIn', () => true);

          return view.render()
            .then(() => {
              view.afterVisible();
            });
        });

        it('shows a sign in button with the appropriate link, logs appropriately', () => {
          assert.lengthOf(view.$('#signin'), 1);
          testIsFlowEventLogged('signedin.false');
          testIsFlowEventLogged('signin.eligible');
          testIsFlowEventLogged('signin_from.fx_desktop');
        });
      });

      describe('with a fennec user that can sign in', () => {
        beforeEach(() => {
          sinon.stub(view, '_getUap', () => {
            return {
              isAndroid: () => true,
              isFirefox: () => true,
              isFirefoxAndroid: () => true,
              isFirefoxDesktop: () => false,
              isFirefoxIos: () => false,
              isIos: () => false
            };
          });

          account.set('email', 'testuser@testuser.com');
          sinon.stub(user, 'isSignedInAccount', () => false);
          sinon.stub(view, '_canSignIn', () => true);

          return view.render()
            .then(() => {
              view.afterVisible();
            });
        });

        it('shows a sign in button with the appropriate link, logs appropriately', () => {
          assert.lengthOf(view.$('#signin'), 1);
          testIsFlowEventLogged('signedin.false');
          testIsFlowEventLogged('signin.eligible');
          testIsFlowEventLogged('signin_from.fx_android');
        });
      });

      describe('with a user that cannot sign in', () => {
        beforeEach(() => {
          sinon.stub(user, 'isSignedInAccount', () => false);
          sinon.stub(view, '_canSignIn', () => false);
        });

        it('shows FxiOS help text, no marketing area to users on FxiOS', () => {
          sinon.stub(view, '_getUap', () => {
            return {
              isAndroid: () => false,
              isFirefox: () => true,
              isFirefoxAndroid: () => false,
              isFirefoxDesktop: () => false,
              isFirefoxIos: () => true,
              isIos: () => true,
            };
          });

          return view.render()
            .then(() => {
              view.afterVisible();

              assert.lengthOf(view.$('#signin-fxios'), 1);
              assert.lengthOf(view.$('.marketing-area'), 0);
              testIsFlowEventLogged('signin_from.fx_ios');
            });
        });

        it('shows iOS text, marketing area to users on iOS', () => {
          sinon.stub(view, '_getUap', () => {
            return {
              isAndroid: () => false,
              isFirefox: () => false,
              isFirefoxAndroid: () => false,
              isFirefoxDesktop: () => false,
              isFirefoxIos: () => false,
              isIos: () => true,
            };
          });

          return view.render()
            .then(() => {
              view.afterVisible();

              assert.lengthOf(view.$('#install-mobile-firefox-ios'), 1);
              assert.lengthOf(view.$('.marketing-area'), 1);
              testIsFlowEventLogged('install_from.other_ios');
            });
        });

        it('shows Android text, marketing area to users on Android', () => {
          sinon.stub(view, '_getUap', () => {
            return {
              isAndroid: () => true,
              isFirefox: () => false,
              isFirefoxAndroid: () => false,
              isFirefoxDesktop: () => false,
              isFirefoxIos: () => false,
              isIos: () => false
            };
          });

          return view.render()
            .then(() => {
              view.afterVisible();

              assert.lengthOf(view.$('#install-mobile-firefox-android'), 1);
              assert.lengthOf(view.$('.marketing-area'), 1);
              testIsFlowEventLogged('install_from.other_android');
            });
        });

        it('shows FxDesktop text, marketing area to Fx Desktop users', () => {
          sinon.stub(view, '_getUap', () => {
            return {
              isAndroid: () => false,
              isFirefox: () => true,
              isFirefoxAndroid: () => false,
              isFirefoxDesktop: () => true,
              isFirefoxIos: () => false,
              isIos: () => false
            };
          });

          return view.render()
            .then(() => {
              view.afterVisible();

              assert.lengthOf(view.$('#install-mobile-firefox-desktop'), 1);
              assert.lengthOf(view.$('.marketing-area'), 1);
              testIsFlowEventLogged('install_from.fx_desktop');
            });
        });

        it('shows Other text, marketing area to everyone else', () => {
          sinon.stub(view, '_getUap', () => {
            return {
              isAndroid: () => false,
              isFirefox: () => false,
              isFirefoxAndroid: () => false,
              isFirefoxDesktop: () => false,
              isFirefoxIos: () => false,
              isIos: () => false
            };
          });

          return view.render()
            .then(() => {
              view.afterVisible();

              assert.lengthOf(view.$('#install-mobile-firefox-other'), 1);
              assert.lengthOf(view.$('.marketing-area'), 1);
              testIsFlowEventLogged('install_from.other');
            });
        });
      });
    });

    describe('_isSignedIn', () => {
      it('delegates to user.isSignedInAccount', () => {
        sinon.stub(user, 'isSignedInAccount', () => true);

        assert.isTrue(view._isSignedIn());
        assert.isTrue(user.isSignedInAccount.calledOnce);
        assert.isTrue(user.isSignedInAccount.calledWith(account));
      });
    });

    describe('_canSignIn', () => {
      it('returns `false` if user is signed in', () => {

        sinon.stub(user, 'isSignedInAccount', () => true);
        sinon.stub(view, '_hasWebChannelSupport', () => true);


        assert.isFalse(view._canSignIn());
      });

      it('returns `false` if no web channel support', () => {
        sinon.stub(user, 'isSignedInAccount', () => false);
        sinon.stub(view, '_hasWebChannelSupport', () => false);

        assert.isFalse(view._canSignIn());
      });

      it('returns `true` if not signed in, has web channel support', () => {
        sinon.stub(user, 'isSignedInAccount', () => false);
        sinon.stub(view, '_hasWebChannelSupport', () => true);

        assert.isTrue(view._canSignIn());
      });
    });

    describe('_hasWebChannelSupport', () => {
      it('returns `false` if not Firefox', () => {
        sinon.stub(view, '_getUap', () => {
          return {
            browser: {
              version: 52
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
        sinon.stub(view, '_getUap', () => {
          return {
            browser: {
              version: 39
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
        sinon.stub(view, '_getUap', () => {
          return {
            browser: {
              version: 42
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
        sinon.stub(view, '_getUap', () => {
          return {
            browser: {
              version: 6
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
        sinon.stub(view, '_getUap', () => {
          return {
            browser: {
              version: 40
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
        sinon.stub(view, '_getUap', () => {
          return {
            browser: {
              version: 43
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

    describe('_getSignInContext', () => {
      it('returns fx_fennec_v1 for fennec', () => {
        sinon.stub(view, '_getUap', () => {
          return {
            isFirefoxAndroid: () => true,
            isFirefoxDesktop: () => false,
          };
        });

        assert.equal(view._getSignInContext(), Constants.FX_FENNEC_V1_CONTEXT);
      });

      it('returns fx_desktop_v3 for desktop users', () => {
        sinon.stub(view, '_getUap', () => {
          return {
            isFirefoxAndroid: () => false,
            isFirefoxDesktop: () => true
          };
        });
        assert.equal(view._getSignInContext(), Constants.FX_DESKTOP_V3_CONTEXT);
      });
    });

    describe('_getEscapedSignInUrl', () => {
      const CONTEXT = 'fx_desktop_v3';
      const ORIGIN = 'https://accounts.firefox.com';

      beforeEach(() => {
        windowMock.location.origin = ORIGIN;
        relier.set({
          utmCampaign: 'campaign',
          utmContent: 'content',
          utmMedium: 'medium',
          utmSource: 'source',
          utmTerm: 'term'
        });
      });

      describe('with email', () => {
        it('URL has email query param', () => {
          const escapedSignInUrl
            = view._getEscapedSignInUrl(CONTEXT, 'testuser@testuser.com');

          const search = escapedSignInUrl.split('?')[1];
          const params = Url.searchParams(search);

          assert.deepEqual(params, {
            context: CONTEXT,
            email: 'testuser@testuser.com',
            entrypoint: View.ENTRYPOINT,
            service: Constants.SYNC_SERVICE,
            /* eslint-disable camelcase */
            utm_campaign: 'campaign',
            utm_content: 'content',
            utm_medium: 'medium',
            utm_source: 'source',
            utm_term: 'term'
            /* eslint-enable camelcase */
          });

          const origin = Url.getOrigin(escapedSignInUrl);
          assert.equal(origin, ORIGIN);
        });
      });

      describe('without an email', () => {
        it('URL does not have email query param', () => {
          const escapedSignInUrl = view._getEscapedSignInUrl(CONTEXT);
          const search = escapedSignInUrl.split('?')[1];
          const params = Url.searchParams(search);
          assert.notProperty(params, 'email');
        });
      });
    });

    describe('clicks', () => {
      beforeEach(() => {
        sinon.stub(view, '_getUap', () => {
          return {
            isAndroid: () => false,
            isFirefox: () => true,
            isFirefoxAndroid: () => false,
            isFirefoxDesktop: () => true,
            isFirefoxIos: () => false,
            isIos: () => false
          };
        });

        account.set('email', 'testuser@testuser.com');
        sinon.stub(user, 'isSignedInAccount', () => false);
        sinon.stub(view, '_canSignIn', () => true);

        return view.render()
          .then(() => {
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
  });
});
