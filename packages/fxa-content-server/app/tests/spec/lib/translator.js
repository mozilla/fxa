/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// test the translation library

import { assert } from 'chai';
import sinon from 'sinon';
import Translator from 'lib/translator';

// translations taken from Persona's db_LB translations.
const TRANSLATIONS = {
  // use one direct translation to prepare for simpler json files.
  '%s, Persona requires cookies to remember you.':
    '%s, Ԁǝɹsouɐ ɹǝbnıɹǝs ɔooʞıǝs ʇo ɹǝɯǝɯqǝɹ ʎon\u02D9',
  'header\u0004%s, Persona requires cookies to remember you.':
    '%s, Ԁǝɹsouɐ ɹǝbnıɹǝs ɔooʞıǝs ʇo ɹǝɯǝɯqǝɹ ʎon\u02D9 - header',
  'Error encountered trying to register: %(email)s.': [
    null,
    'Ǝɹɹoɹ ǝuɔonuʇǝɹǝp ʇɹʎıuƃ ʇo ɹǝƃısʇɹɐʇıou: %(email)s\u02D9',
  ],
  'There was a problem with your signup link. Has this address already been registered?': [
    null,
    '\u22A5ɥǝɹǝ ʍɐs ɐ dɹoqʅǝɯ ʍıʇɥ ʎonɹ sıƃund ʅıuʞ\u02D9 Hɐs ʇɥıs ɐppɹǝss ɐʅɹǝɐpʎ qǝǝu ɹǝƃısʇǝɹǝp\xBF',
  ],
};

describe('lib/translator', () => {
  let translator;
  let xhr;

  beforeEach(() => {
    xhr = {
      getJSON: sinon.spy(() => Promise.resolve(TRANSLATIONS)),
    };
    // Bringing back the David Bowie's Labrynth
    translator = new Translator({ xhr });
    return translator.fetch();
  });

  afterEach(() => {
    translator = null;
  });

  describe('fetch', () => {
    it('is called on startup if translations are not already set', () => {
      assert.isTrue(xhr.getJSON.calledOnce);
      assert.isTrue(xhr.getJSON.calledWith('/i18n/client.json'));
    });

    it('is not called on startup if translations are already set', () => {
      xhr.getJSON.resetHistory();
      translator = new Translator({ xhr });
      translator.set(TRANSLATIONS);
      return translator.fetch().then(() => {
        assert.isFalse(xhr.getJSON.called);
      });
    });
  });

  describe('get', () => {
    it('returns translated string when it exists', () => {
      var stringToTranslate =
        'There was a problem with your signup link. Has this address already been registered?';
      var translation = translator.get(stringToTranslate);
      assert.equal(
        translation,
        '⊥ɥǝɹǝ ʍɐs ɐ dɹoqʅǝɯ ʍıʇɥ ʎonɹ sıƃund ʅıuʞ˙ Hɐs ʇɥıs ɐppɹǝss ɐʅɹǝɐpʎ qǝǝu ɹǝƃısʇǝɹǝp¿'
      );
    });

    it('msgctxt annotation', () => {
      const stringToTranslate = '%s, Persona requires cookies to remember you.';
      let translation = translator.get(stringToTranslate, {
        msgctxt: 'header',
      });
      assert.equal(
        translation,
        '%s, Ԁǝɹsouɐ ɹǝbnıɹǝs ɔooʞıǝs ʇo ɹǝɯǝɯqǝɹ ʎon\u02D9 - header'
      );

      translation = translator.get(stringToTranslate);
      assert.equal(
        translation,
        '%s, Ԁǝɹsouɐ ɹǝbnıɹǝs ɔooʞıǝs ʇo ɹǝɯǝɯqǝɹ ʎon\u02D9'
      );

      translation = translator.get(stringToTranslate, {
        msgctxt: 'non existent',
      });
      assert.equal(
        translation,
        '%s, Ԁǝɹsouɐ ɹǝbnıɹǝs ɔooʞıǝs ʇo ɹǝɯǝɯqǝɹ ʎon\u02D9'
      );
    });

    it('returns untranslated string when translation does not exist', () => {
      var stringToTranslate = 'this string is untranslated';
      var translation = translator.get(stringToTranslate);
      assert.equal(translation, stringToTranslate);
    });

    it('can do string interpolation on unnamed `%s` when given array context', () => {
      var stringToTranslate = '%s, Persona requires cookies to remember you.';
      var translation = translator.get(stringToTranslate, [
        'testuser@testuser.com',
      ]);
      assert.equal(
        translation,
        'testuser@testuser.com, Ԁǝɹsouɐ ɹǝbnıɹǝs ɔooʞıǝs ʇo ɹǝɯǝɯqǝɹ ʎon˙'
      );
    });

    it('can do string interpolation on named `%(name)s` when given array context', () => {
      var stringToTranslate =
        'Error encountered trying to register: %(email)s.';
      var translation = translator.get(stringToTranslate, {
        email: 'testuser@testuser.com',
      });
      assert.equal(
        translation,
        'Ǝɹɹoɹ ǝuɔonuʇǝɹǝp ʇɹʎıuƃ ʇo ɹǝƃısʇɹɐʇıou: testuser@testuser.com˙'
      );
    });

    it('can do interpolation multiple times with an array', () => {
      var stringToTranslate = 'Hi %s, you have been signed in since %s';
      var translation = translator.get(stringToTranslate, [
        'testuser@testuser.com',
        'noon',
      ]);

      assert.equal(
        translation,
        'Hi testuser@testuser.com, you have been signed in since noon'
      );
    });

    it('can do interpolation multiple times with an object', () => {
      var stringToTranslate =
        'Hi %(email)s, you have been signed in since %(time)s';
      var translation = translator.get(stringToTranslate, {
        email: 'testuser@testuser.com',
        time: 'noon',
      });

      assert.equal(
        translation,
        'Hi testuser@testuser.com, you have been signed in since noon'
      );
    });

    it('does no replacement on %s and %(name)s if not in context', () => {
      var stringToTranslate = 'Hi %s, you have been signed in since %(time)s';
      var translation = translator.get(stringToTranslate);

      assert.equal(translation, stringToTranslate);
    });

    it('leaves remaining %s if not enough items in context', () => {
      var stringToTranslate = 'Hi %s, you have been signed in since %s';
      var translation = translator.get(stringToTranslate, [
        'testuser@testuser.com',
      ]);

      assert.equal(
        translation,
        'Hi testuser@testuser.com, you have been signed in since %s'
      );
    });
  });
});
