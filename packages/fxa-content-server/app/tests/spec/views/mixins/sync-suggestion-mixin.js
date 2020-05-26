/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import { assert } from 'chai';
import BaseView from 'views/base';
import Cocktail from 'cocktail';
import Constants from 'lib/constants';
import Notifier from 'lib/channels/notifier';
import Relier from 'models/reliers/browser';
import sinon from 'sinon';
import SyncSuggestionMixin from 'views/mixins/sync-suggestion-mixin';

const SyncView = BaseView.extend({
  template: (context) => context.syncSuggestionHTML,
});

Cocktail.mixin(
  SyncView,
  SyncSuggestionMixin({
    entrypoint: 'fxa:signup',
    flowEvent: 'link.signin',
  })
);

describe('views/mixins/sync-suggestion-mixin', () => {
  let notifier;
  let relier;
  let view;

  beforeEach(() => {
    notifier = new Notifier();
    relier = new Relier();

    view = new SyncView({
      notifier,
      relier,
    });

    sinon.stub(view, 'logViewEvent').callsFake(() => {});
  });

  describe('sync suggestion', () => {
    it('displays sync suggestion message if no service', () => {
      relier.set('service', null);
      relier.set('context', 'web');

      return view
        .render()
        .then(() => {
          return view.afterVisible();
        })
        .then(() => {
          assert.lengthOf(view.$('#suggest-sync'), 1);

          const $suggestSyncEl = view.$('#suggest-sync');
          assert.include($suggestSyncEl.text(), 'Looking for Firefox Sync?');
          assert.include($suggestSyncEl.text(), 'Get started here');

          const $getStartedEl = $suggestSyncEl.find('a');
          assert.equal($getStartedEl.attr('rel'), 'noopener noreferrer');

          assert.isTrue(view.logViewEvent.calledWith('sync-suggest.visible'));
        });
    });

    it('does not have sync auth supported', () => {
      relier.set('service', null);
      relier.set('context', 'web');

      sinon.stub(view, 'isSyncAuthSupported').callsFake(() => false);
      return view.render().then(() => {
        const $getStartedEl = view.$('#suggest-sync').find('a');
        assert.equal(
          $getStartedEl.attr('href'),
          Constants.MOZ_ORG_SYNC_GET_STARTED_LINK
        );
      });
    });

    it('has sync auth supported on Firefox for Desktop', () => {
      relier.set('service', null);
      relier.set('context', 'web');

      sinon.stub(view, 'isSyncAuthSupported').callsFake(() => true);
      sinon.stub(view, 'getUserAgent').callsFake(() => {
        return {
          isFirefoxAndroid: () => false,
          isFirefoxDesktop: () => true,
        };
      });
      return view.render().then(() => {
        const $getStartedEl = view.$('#suggest-sync').find('a');
        assert.equal(
          $getStartedEl.attr('href'),
          view.window.location.origin +
            '/?context=fx_desktop_v3&entrypoint=fxa%3Asignup&service=sync&action=email'
        );
      });
    });

    it('has sync auth supported on Firefox for Android', () => {
      relier.set('service', null);
      relier.set('context', 'web');

      sinon.stub(view, 'isSyncAuthSupported').callsFake(() => true);
      sinon.stub(view, 'getUserAgent').callsFake(() => {
        return {
          isFirefoxAndroid: () => true,
          isFirefoxDesktop: () => false,
        };
      });
      return view.render().then(() => {
        const $getStartedEl = view.$('#suggest-sync').find('a');
        assert.equal(
          $getStartedEl.attr('href'),
          view.window.location.origin +
            '/?context=fx_fennec_v1&entrypoint=fxa%3Asignup&service=sync&action=email'
        );
      });
    });

    it('can be dismissed', () => {
      relier.set('service', null);
      relier.set('context', 'web');

      return view.render().then(() => {
        $('#container').html(view.el);
        assert.isTrue(view.$('#suggest-sync').is(':visible'), 'visible');
        view.$('#suggest-sync .dismiss').click();
        assert.isFalse(view.$('#suggest-sync').is(':visible'), 'hidden');
      });
    });

    it('does not display sync suggestion message if there is a relier service', () => {
      relier.set('service', 'sync');
      relier.set('context', 'web');

      return view.render().then(() => {
        assert.lengthOf(view.$('#suggest-sync'), 0);
      });
    });

    it('logs the link.signin event', () => {
      sinon.stub(view, 'isSyncSuggestionEnabled').callsFake(() => true);
      sinon.stub(view, 'logFlowEvent').callsFake(() => {});

      return view.render().then(() => {
        assert.isFalse(view.logFlowEvent.calledWith('link.signin'));
        assert.lengthOf(view.$('a[data-flow-event="link.signin"]'), 1);
        view.$('a[data-flow-event="link.signin"]').click();
        assert.isTrue(view.logFlowEvent.calledWith('link.signin'));
      });
    });
  });
});
