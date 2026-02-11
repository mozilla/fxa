/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import Account from 'models/account';
import { assert } from 'chai';
import sinon from 'sinon';
import User from 'models/user';
import Relier from 'models/reliers/relier';
import View from 'views/subscriptions_product_redirect';
import Notifier from 'lib/channels/notifier';
import WindowMock from '../../mocks/window';
import PaymentServer from 'lib/payment-server';

const PRODUCT_ID = 'pk_8675309';
const SEARCH_QUERY = '?plan=plk_12345';

describe('views/subscriptions_product_redirect', function () {
  let account;
  let relier;
  let user;
  let view;
  let windowMock;
  let config;
  let notifier;
  let getSignedInAccountStub;

  function render() {
    return view.render().then(() => view.afterVisible());
  }

  beforeEach(function () {
    user = new User();
    account = new Account();
    relier = new Relier();
    notifier = new Notifier();
    windowMock = new WindowMock();
    windowMock.location.href = `http://example.com/products${SEARCH_QUERY}`;
    windowMock.location.search = SEARCH_QUERY;

    config = {
      subscriptions: {
        managementClientId: 'MOCK_CLIENT_ID',
        managementScopes: 'MOCK_SCOPES',
        managementTokenTTL: 1800,
        managementUrl: 'http://example.com',
      },
    };

    sinon.stub(user, 'sessionStatus').callsFake(() => Promise.resolve(account));

    view = new View({
      config,
      currentPage: `subscriptions/product/${PRODUCT_ID}`,
      notifier,
      relier,
      user,
      window: windowMock,
    });

    account._fxaClient = {
      isSignedIn: () => Promise.resolve(true),
    };
    getSignedInAccountStub = sinon
      .stub(view, 'getSignedInAccount')
      .returns(account);
    sinon.stub(view, 'initializeFlowEvents');

    sinon
      .stub(PaymentServer, 'navigateToPaymentServer')
      .callsFake(() => Promise.resolve(true));
  });

  afterEach(function () {
    PaymentServer.navigateToPaymentServer.restore();
    $(view.el).remove();
    view.destroy();
    view = null;
    getSignedInAccountStub.restore();
  });

  describe('initialize', () => {
    it('sets subscriptionProductId on relier', () => {
      view.initialize({
        currentPage: `/subscriptions/products/${PRODUCT_ID}`,
      });
      assert.equal(PRODUCT_ID, relier.get('subscriptionProductId'));
    });
  });

  describe('render', () => {
    it('renders, initializes flow metrics, navigates to payments server', () => {
      return render().then(() => {
        assert.lengthOf(view.$('.redirect-loading'), 1);
        assert.isTrue(view.initializeFlowEvents.calledOnce);
        assert.isTrue(
          PaymentServer.navigateToPaymentServer.calledOnceWith(
            view,
            config.subscriptions,
            `products/${PRODUCT_ID}`,
            { plan: 'plk_12345' }
          )
        );
      });
    });

    it('works with a local redirect with no query params', () => {
      windowMock.location.href = `http://localhost:3030/subscriptions/products/${PRODUCT_ID}`;
      windowMock.location.search = '';
      view.initialize({
        currentPage: `/subscriptions/products/${PRODUCT_ID}`,
        config,
      });
      return render().then(() => {
        assert.isTrue(
          PaymentServer.navigateToPaymentServer.calledOnceWith(
            view,
            config.subscriptions,
            `products/pk_8675309`,
            {}
          )
        );
      });
    });

    describe('mustAuth', () => {
      it('is false when isSignedIn=false, allowUnauthenticatedRedirects=true, forceSignin=false', async () => {
        getSignedInAccountStub.returns(null);
        view.initialize({
          currentPage: `/subscriptions/products/${PRODUCT_ID}`,
          config: {
            subscriptions: {
              allowUnauthenticatedRedirects: true,
            },
          },
        });
        await view.render();
        assert.strictEqual(view._redirectPath, `checkout/${PRODUCT_ID}`);
        assert.isFalse(view.mustAuth, 'mustAuth should be false');
      });
      it('is true when isSignedIn=true, allowUnauthenticatedRedirects=true, forceSignin=true', async () => {
        windowMock.location.search = 'signin=true';
        view.initialize({
          currentPage: `/subscriptions/products/${PRODUCT_ID}`,
          config: {
            subscriptions: {
              allowUnauthenticatedRedirects: true,
            },
          },
        });
        await view.render();
        assert.strictEqual(view._redirectPath, `products/${PRODUCT_ID}`);
        assert.isTrue(view.mustAuth, 'mustAuth should be true');
      });
      it('is true when isSignedIn=false, allowUnauthenticatedRedirects=true, forceSignin=true', async () => {
        getSignedInAccountStub.returns(null);
        windowMock.location.search = 'signin=true';
        view.initialize({
          currentPage: `/subscriptions/products/${PRODUCT_ID}`,
          config: {
            subscriptions: {
              allowUnauthenticatedRedirects: true,
            },
          },
        });
        await view.render();
        assert.strictEqual(view._redirectPath, `products/${PRODUCT_ID}`);
        assert.isTrue(view.mustAuth, 'mustAuth should be true');
      });
      it('is true when isSignedIn=false, allowUnauthenticatedRedirects=false, forceSignin=true', async () => {
        getSignedInAccountStub.returns(null);
        windowMock.location.search = 'signin=true';
        await view.render();
        assert.strictEqual(view._redirectPath, `products/${PRODUCT_ID}`);
        assert.isTrue(view.mustAuth, 'mustAuth should be true');
      });
      it('is true when isSignedIn=true, allowUnauthenticatedRedirects=false, forceSignin=true', async () => {
        windowMock.location.search = 'signin=true';
        await view.render();
        assert.strictEqual(view._redirectPath, `products/${PRODUCT_ID}`);
        assert.isTrue(view.mustAuth, 'mustAuth should be true');
      });
      it('is true when isSignedIn=true, allowUnauthenticatedRedirects=false, forceSignin=false', async () => {
        await view.render();
        assert.strictEqual(view._redirectPath, `products/${PRODUCT_ID}`);
        assert.isTrue(view.mustAuth, 'mustAuth should be true');
      });
      it('is true when isSignedIn=true, allowUnauthenticatedRedirects=true, forceSignin=false', async () => {
        view.initialize({
          currentPage: `/subscriptions/products/${PRODUCT_ID}`,
          config: {
            subscriptions: {
              allowUnauthenticatedRedirects: true,
            },
          },
        });
        await view.render();
        assert.strictEqual(view._redirectPath, `products/${PRODUCT_ID}`);
        assert.isTrue(view.mustAuth, 'mustAuth should be true');
      });
      it('is true when (isSignedIn=false, allowUnauthenticatedRedirects=false, forceSignin=false)', async () => {
        getSignedInAccountStub.returns(null);
        await view.render();
        assert.strictEqual(view._redirectPath, `products/${PRODUCT_ID}`);
        assert.isTrue(view.mustAuth, 'mustAuth should be true');
      });
    });
  });
});
