/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import { assert } from 'chai';
import BaseView from 'views/base';
import Broker from 'models/auth_brokers/base';
import Cocktail from 'cocktail';
import OpenWebmailMixin from 'views/mixins/open-webmail-mixin';
import sinon from 'sinon';
import Template from 'templates/test_template.mustache';

const EMAIL = 'testuser@gmail.com';

const ConfirmView = BaseView.extend({
  template: Template,

  setInitialContext(context) {
    context.set('email', EMAIL);
  },
});

Cocktail.mixin(ConfirmView, OpenWebmailMixin);

describe('views/mixins/open-webmail-mixin', function () {
  let broker;
  let view;

  beforeEach(function () {
    broker = new Broker();
    broker.setCapability('openWebmailButtonVisible', true);

    view = new ConfirmView({
      broker: broker,
    });
  });

  afterEach(function () {
    view.remove();
    view.destroy();
  });

  describe('test buttons visibility without broker support', function () {
    beforeEach(function () {
      broker.unsetCapability('openWebmailButtonVisible');
    });

    it('returns false even for chosen email addresses', function () {
      assert.isFalse(view.isOpenWebmailButtonVisible('testuser@gmail.com'));
      assert.isFalse(view.isOpenWebmailButtonVisible('testuser@hotmail.com'));
      assert.isFalse(view.isOpenWebmailButtonVisible('testuser@yahoo.com'));
      assert.isFalse(view.isOpenWebmailButtonVisible('testuser@restmail.net'));
    });
  });

  describe('link and visibility', function () {
    describe('with broker support', function () {
      beforeEach(function () {
        broker.setCapability('openWebmailButtonVisible', true);
      });

      describe('getWebmailLink get the right link', function () {
        it('checks href', function () {
          assert.include(
            view.getWebmailLink('testuser@gmail.com'),
            'https://mail.google.com/mail/u/?authuser=testuser%40gmail.com'
          );
          assert.include(
            view.getWebmailLink('testuser@restmail.net'),
            'http://restmail.net/mail/testuser@restmail.net'
          );
          assert.include(
            view.getWebmailLink('testuser@hotmail.com'),
            'https://outlook.live.com/'
          );
          assert.include(
            view.getWebmailLink('testuser@yahoo.com'),
            'https://mail.yahoo.com'
          );
        });
      });

      describe("with an address that has valid provider that isn't", function () {
        it('returns false', function () {
          assert.isFalse(
            view.isOpenWebmailButtonVisible('testuser@mygmail.com')
          );
          assert.isFalse(
            view.isOpenWebmailButtonVisible('gmail.com@hyahoo.com')
          );
        });
      });

      describe('with a gmail or hotmail or yahoo address', function () {
        it('returns true', function () {
          assert.isTrue(view.isOpenWebmailButtonVisible('testuser@gmail.com'));
          assert.isTrue(
            view.isOpenWebmailButtonVisible('testuser@hotmail.com')
          );
          assert.isTrue(view.isOpenWebmailButtonVisible('testuser@yahoo.com'));
          assert.isTrue(
            view.isOpenWebmailButtonVisible('testuser@restmail.net')
          );
        });
      });
    });
  });

  describe('button l10n', () => {
    const TRANSLATED_BUTTON_TEXT = 'Ouvrir Gmail';

    beforeEach(() => {
      view.translator = {
        get: (untranslatedText) => {
          if (untranslatedText === 'Open Gmail') {
            return TRANSLATED_BUTTON_TEXT;
          }

          return untranslatedText;
        },
      };

      return view.render();
    });

    it('translates the button', () => {
      assert.equal(view.$('#open-webmail').text(), TRANSLATED_BUTTON_TEXT);
    });
  });

  describe('click on `open-webmail` button', function () {
    beforeEach(function () {
      sinon.stub(view, '_webmailTabOpened').callsFake((event) => {
        // prevent default or else the test redirects
        event.preventDefault();
      });

      return view
        .render()
        .then(function () {
          $('#container').html(view.el);
        })
        .then(function () {
          $('#open-webmail').click();
        });
    });

    it('calls _webmailTabOpened', function () {
      assert.isTrue(view._webmailTabOpened.calledOnce);
    });
  });

  describe('_webmailTabOpened', () => {
    it('logs the event click', () => {
      sinon.spy(view, 'logViewEvent');
      return view.render().then(() => {
        const $targetEl = view.$('#open-webmail');
        view._webmailTabOpened({ target: $targetEl });
        assert.isTrue(view.logViewEvent.calledOnce);
        assert.isTrue(view.logViewEvent.calledWith('gmail_clicked'));
      });
    });
  });
});
