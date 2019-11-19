/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import sinon from 'sinon';
import FormView from 'views/form';
import Cocktail from 'cocktail';
import EmailAutocompleteDomainsMixin, {
  DOMAINS,
  EMAIL_SELECTOR,
  DATALIST_OPTIONS_SELECTOR,
  FOCUS_HACK_SELECTOR,
} from 'views/mixins/email-autocomplete-domains-mixin';

describe('views/mixins/email-autocomplete-domains-mixin', () => {
  let view;

  const EmailDatalistView = FormView.extend({
    template: context => context.unsafeEmailAutocompleteDomainsHTML,
  });

  Cocktail.mixin(EmailDatalistView, EmailAutocompleteDomainsMixin);

  beforeEach(() => {
    view = new EmailDatalistView();
    sinon.stub(view, 'getUserAgent').callsFake(() => ({
      isAndroid: () => false,
      isChrome: () => false,
      isEdge: () => false,
    }));
    return view.render();
  });

  afterEach(() => {
    view.remove();
    view.destroy();
    view = null;
  });

  describe('renders correctly', () => {
    it('contains `option` elements the same length as the domains array', () => {
      assert.lengthOf(view.$(DATALIST_OPTIONS_SELECTOR), DOMAINS.length);
    });
    it('contains #focus-hack element for cross-browser compatibility', () => {
      assert.lengthOf(view.$(FOCUS_HACK_SELECTOR), 1);
    });
  });

  describe('_toggleDomainAutocomplete', () => {
    it('renders datalist with options from domains list on keyup when "@" is present', () => {
      view
        .$(EMAIL_SELECTOR)
        .val('foo@')
        .trigger('keyup');
      assert.isTrue(
        view.$(EMAIL_SELECTOR).attr('list') === 'autocomplete-domain'
      );
      assert.isTrue(
        view.$(DATALIST_OPTIONS_SELECTOR)[0].getAttribute('value') ===
          `foo@${DOMAINS[0]}`
      );
      assert.isTrue(
        view
          .$(DATALIST_OPTIONS_SELECTOR)
          [DOMAINS.length - 1].getAttribute('value') ===
          `foo@${DOMAINS[DOMAINS.length - 1]}`
      );
    });

    it('does nothing if conditions are not met,', () => {
      // input is too short
      view
        .$(EMAIL_SELECTOR)
        .val('a')
        .trigger('keyup');
      assert.isTrue(view.$(EMAIL_SELECTOR).attr('list') === undefined);

      // "@" is not present
      view
        .$(EMAIL_SELECTOR)
        .val('foo')
        .trigger('keyup');
      assert.isTrue(view.$(EMAIL_SELECTOR).attr('list') === undefined);

      // username doesn't change but user keeps typing
      view
        .$(EMAIL_SELECTOR)
        .val('foo@')
        .trigger('keyup');
      view
        .$(EMAIL_SELECTOR)
        .val('foo@gmail')
        .trigger('keyup');
      assert.isTrue(
        view.$(DATALIST_OPTIONS_SELECTOR)[0].getAttribute('value') ===
          `foo@${DOMAINS[0]}`
      );
    });

    it('updates options on username change when "@" sign is present', () => {
      view
        .$(EMAIL_SELECTOR)
        .val('foo')
        .trigger('keyup');
      assert.isTrue(
        view.$(DATALIST_OPTIONS_SELECTOR)[0].getAttribute('value') === null
      );
      view
        .$(EMAIL_SELECTOR)
        .val('foo@')
        .trigger('keyup');
      view
        .$(EMAIL_SELECTOR)
        .val('fo@')
        .trigger('keyup');
      assert.isTrue(
        view.$(DATALIST_OPTIONS_SELECTOR)[0].getAttribute('value') ===
          `fo@${DOMAINS[0]}`
      );
    });

    it('clears options when "@" is present and then removed', () => {
      view
        .$(EMAIL_SELECTOR)
        .val('foo@')
        .trigger('keyup');
      view
        .$(EMAIL_SELECTOR)
        .val('foo')
        .trigger('keyup');
      assert.isTrue(view.$(EMAIL_SELECTOR).attr('list') === undefined);
      assert.isTrue(
        view.$(DATALIST_OPTIONS_SELECTOR)[0].getAttribute('value') === null
      );
    });
  });
});
