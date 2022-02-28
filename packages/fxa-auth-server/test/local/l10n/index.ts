/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FluentBundle } from '@fluent/bundle';
import chai, { assert } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Localizer, { parseAcceptLanguage } from '../../../lib/l10n';
import { LocalizerBindings } from '../../../lib/l10n/bindings';

chai.use(chaiAsPromised);

describe('Localizer', () => {
  describe('fetches bundles', () => {
    let localizerBindings = new LocalizerBindings();
    let localizer = new Localizer(localizerBindings);

    it('fails with a bad localizer ftl basePath', () => {
      assert.throws(() => {
        let localizerBindings = new LocalizerBindings({
          translations: {
            basePath: '/not/a/apth',
          },
        });
        new Localizer(localizerBindings);
      }, 'Invalid ftl translations basePath');
    });

    it('produces the current locales', async () => {
      const { currentLocales } = await localizer.getLocalizerDeps(
        'de-CH,it;q=0.8,en-US;q=0.5,en;q=0.3'
      );

      assert.deepEqual(currentLocales, ['de', 'it', 'en-US', 'en']);
    });

    it('selects the proper locale', async () => {
      const { selectedLocale } = await localizer.setupLocalizer(
        'de-DE,en-US;q=0.7,en;q=0.3'
      );

      assert.equal(selectedLocale, 'de');
    });

    it('generates a proper bundle', async () => {
      const { generateBundles } = await localizer.getLocalizerDeps('de,en');

      const bundles: Array<FluentBundle> = [];
      for await (const bundle of generateBundles(['de'])) {
        bundles.push(bundle);
      }

      assert.lengthOf(bundles, 1);
      assert.include(bundles[0].locales, 'de');
    });

    describe('localizes properly', () => {
      it('localizes properly with preferred language', async () => {
        const { l10n } = await localizer.setupLocalizer(
          'de-DE,en-US;q=0.7,en;q=0.3'
        );

        const result = await l10n.formatValue(
          'subscriptionAccountReminderFirst-action',
          {}
        );

        assert.equal(result, 'Passwort erstellen');
      });

      it('localizes properly with preferred Dialect', async () => {
        const { l10n } = await localizer.setupLocalizer(
          'en-GB,en-CA;q=0.7,en;q=0.3'
        );

        const result = await l10n.formatValue('unblockCode-prompt', {});

        assert.equal(
          result,
          'If yes, here is the authorisation code you need:'
        );
      });
    });
  });

  describe('language negotiation', () => {
    it('handles empty case', () => {
      const result = parseAcceptLanguage('');

      assert.deepEqual(result, ['en']);
    });

    it('ignores unknown language', () => {
      const result = parseAcceptLanguage('zy');
      assert.deepEqual(result, ['en']);
    });

    it('handles en case', () => {
      const result = parseAcceptLanguage('en');

      // Note: We are using the 'filtering' mode for negotiate languages so all are going to be provided
      assert.deepEqual(result, ['en']);
    });

    it('handles en-* case', () => {
      const result = parseAcceptLanguage('en-US');

      // Note: We are using the 'filtering' mode for negotiate languages so all are english dialects are going to be provided
      assert.deepEqual(result, ['en-US', 'en']);
    });

    it('handles alias to en-GB', () => {
      const result = parseAcceptLanguage('en-NZ');

      assert.deepEqual(result, ['en-GB', 'en']);
    });

    it('always has default language, en, present', () => {
      const result = parseAcceptLanguage('de');

      assert.deepEqual(result, ['de', 'en']);
    });

    it('is falls back to root language if dialect is missing', () => {
      const result = parseAcceptLanguage('fr-FR');

      assert.deepEqual(result, ['fr', 'en']);
    });

    it('resolves dialects', () => {
      const result = parseAcceptLanguage('es-MX');

      assert.deepEqual(result, ['es-MX', 'en']);
    });

    it('handles multiple languages', () => {
      const result = parseAcceptLanguage('ja, de-CH, en-US, en');

      assert.deepEqual(result, ['ja', 'de', 'en-US', 'en']);
    });

    it('handles multiple languages with en-GB alias', () => {
      const result = parseAcceptLanguage('en-NZ, en-GB, en-MY');

      assert.deepEqual(result, ['en-GB', 'en']);
    });
  });
});
