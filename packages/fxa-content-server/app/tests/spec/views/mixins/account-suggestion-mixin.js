/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import { assert } from 'chai';
import BaseView from 'views/base';
import Cocktail from 'cocktail';
import Notifier from 'lib/channels/notifier';
import Relier from 'models/reliers/browser';
import sinon from 'sinon';
import AccountSuggestionMixin from 'views/mixins/account-suggestion-mixin';

const AccountSuggestView = BaseView.extend({
  template: (context) => context.accountSuggestionHTML,
});

Cocktail.mixin(AccountSuggestView, AccountSuggestionMixin);

describe('views/mixins/account-suggestion-mixin', () => {
  let notifier;
  let relier;
  let view;

  beforeEach(() => {
    notifier = new Notifier();
    relier = new Relier();

    view = new AccountSuggestView({
      notifier,
      relier,
    });

    sinon.stub(view, 'logViewEvent').callsFake(() => {});
  });

  describe('account suggestion', async () => {
    it('displays account suggestion message if Pocket client', async () => {
      relier.set('clientId', '749818d3f2e7857f');

      await view.render();

      view.afterVisible();

      assert.lengthOf(view.$('#suggest-account'), 1);

      const $suggestAccountEl = view.$('#suggest-account');
      assert.include(
        $suggestAccountEl.text(),
        'Why do I need to create this account?'
      );
      assert.include($suggestAccountEl.text(), 'Find out here');

      const $getStartedEl = $suggestAccountEl.find('a');
      assert.equal($getStartedEl.attr('rel'), 'noopener noreferrer');

      assert.isTrue(view.logViewEvent.calledWith('account-suggest.visible'));
    });

    it('not pocket client', async () => {
      relier.set('service', null);

      sinon.stub(view, 'isAccountSuggestionEnabled').callsFake(() => false);
      await view.render();

      view.afterVisible();

      assert.lengthOf(view.$('#suggest-account'), 0);
    });

    it('can be dismissed', async () => {
      relier.set('clientId', '749818d3f2e7857f');

      await view.render();

      $('#container').html(view.el);
      assert.isTrue(view.$('#suggest-account').is(':visible'), 'visible');
      view.$('#suggest-account .dismiss').click();
      assert.isFalse(view.$('#suggest-account').is(':visible'), 'hidden');
    });

    it('does not display account suggestion message if there is a subscription product ID set', async () => {
      relier.set('service', null);
      relier.set('subscriptionProductId', 'prod_8675309');

      await view.render();
      assert.lengthOf(view.$('#suggest-account'), 0);
    });
  });
});
