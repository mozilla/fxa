/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const { assert } = require('chai');
  const Backbone = require('backbone');
  const FormView = require('views/form');
  const Cocktail = require('cocktail');
  const FormPrefillMixin = require('views/mixins/form-prefill-mixin');

  const View = FormView.extend({
    template: () => `
      <input class="nameless" />
      <input id="id-only" />
      <input name="already-filled" value="this is filled in" />
      <input name="has-data-novalue" data-novalue />
      <input name="name-only" />
      <input name="name-preferred" id="id-ignored" />
      <input name="not-filled-but-saved" autocomplete="off" />
      <textarea name="textarea" />
    `
  });
  Cocktail.mixin(
    View,
    FormPrefillMixin
  );

  describe('views/mixins/form-prefill-mixin', () => {
    let formPrefill;
    let view;

    beforeEach(() => {
      formPrefill = new Backbone.Model({
        'id-only': 'id only value',
        'already-filled': 'a different already-filled value', //eslint-disable-line
        'has-data-novalue': 'has-data-novalue value',
        'name-only': 'name only value',
        'name-preferred': 'name preferred',
        'not-filled-but-saved': 'should not be filled',
        'textarea': 'the value for the text area'
      });

      view = new View({
        formPrefill
      });

      return view.render();
    });

    it('pre-fills input elements w/ name/id without `autocomplete=off` attribute', () => {
      assert.equal(view.$('.nameless').val(), '');
      assert.equal(view.$('#id-only').val(), 'id only value');
      assert.equal(view.$('[name="already-filled"]').val(), 'this is filled in');
      assert.equal(view.$('[name="has-data-novalue"]').val(), '');
      assert.equal(view.$('[name="name-only"]').val(), 'name only value');
      assert.equal(view.$('[name="name-preferred"]').val(), 'name preferred');
      assert.equal(view.$('[name="not-filled-but-saved"]').val(), '');
      assert.equal(view.$('[name="textarea"]').val(), 'the value for the text area');
    });

    it('formPrefill saves all input elements w/ name/id', () => {
      view.$('[name="has-data-novalue"]').val('has-data-novalue value updated');
      view.$('[name="name-only"]').val('name only value updated');
      view.$('#id-only').val('id only value updated');
      view.$('[name="name-preferred"]').val('name preferred updated');
      view.$('.nameless').val('updated');
      view.$('[name="not-filled-but-saved"]').val('not filled but saved updated');
      view.$('[name="textarea"]').val('the value for the text area updated');

      view.destroy();
      assert.deepEqual(formPrefill.toJSON(), {
        'id-only': 'id only value updated',
        'already-filled': 'this is filled in', //eslint-disable-line
        'has-data-novalue': 'has-data-novalue value',
        'name-only': 'name only value updated',
        'name-preferred': 'name preferred updated',
        'not-filled-but-saved': 'not filled but saved updated',
        'textarea': 'the value for the text area updated'
      });
    });
  });
});
