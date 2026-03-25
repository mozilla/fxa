/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FluentBundle } from '@fluent/bundle';
import { Localization } from '@fluent/dom';
import Localizer from './index';
import { LocalizerBindings } from './bindings';

describe('Localizer', () => {
  describe('fetches bundles', () => {
    const localizerBindings = new LocalizerBindings();
    const localizer = new Localizer(localizerBindings);

    it('fails with a bad localizer ftl basePath', () => {
      expect(() => {
        const bindings = new LocalizerBindings({
          translations: { basePath: '/not/a/apth' },
        });
        new Localizer(bindings); // eslint-disable-line no-new
      }).toThrow('Invalid ftl translations basePath');
    });

    it('selects the proper locale', async () => {
      const { selectedLocale } = await localizer.setupLocalizer(
        'de-DE,en-US;q=0.7,en;q=0.3'
      );
      expect(selectedLocale).toBe('de');
    });

    it('generates a proper bundle', async () => {
      const { generateBundles } = await localizer.getLocalizerDeps('de,en');

      const bundles: Array<FluentBundle> = [];
      for await (const bundle of generateBundles(['de'])) {
        bundles.push(bundle);
      }

      expect(bundles).toHaveLength(1);
      expect(bundles[0].locales).toContain('de');
    });

    describe('localizes properly', () => {
      it('localizes properly with preferred language', async () => {
        const { l10n } = await localizer.setupLocalizer(
          'de-DE,en-US;q=0.7,en;q=0.3'
        );

        const result = await l10n.formatValue(
          'subscriptionAccountReminderSecond-title-2',
          {}
        );

        expect(result).toBe('Willkommen bei Mozilla!');
      });

      it('localizes properly with preferred Dialect', async () => {
        const { l10n } = await localizer.setupLocalizer(
          'en-GB,en-CA;q=0.7,en;q=0.3'
        );

        const result = await l10n.formatValue(
          'fraudulentAccountDeletion-content-part2-v2',
          {}
        );

        expect(result).toContain('authorised');
        expect(result).toContain('cancelled');
      });
    });
  });

  describe('localizeStrings', () => {
    const localizer = new Localizer(new LocalizerBindings());

    it('localizes a string correctly', async () => {
      const result = await localizer.localizeStrings('it', [
        { id: 'subplat-cancel', message: 'Cancel subscription' },
      ]);

      expect(result['subplat-cancel']).toBeTruthy();
      expect(result['subplat-cancel']).not.toBe('Cancel subscription');
    });

    it('localizes multiple strings correctly', async () => {
      const result = await localizer.localizeStrings('it', [
        { id: 'subplat-cancel', message: 'Cancel subscription' },
        { id: 'subplat-legal', message: 'Legal' },
      ]);

      expect(result['subplat-cancel']).toBeTruthy();
      expect(result['subplat-cancel']).not.toBe('Cancel subscription');
      expect(result['subplat-legal']).toBeTruthy();
      expect(result['subplat-legal']).not.toBe('Legal');
    });

    it('uses the original message if formatValue resolves as undefined', async () => {
      const result = await localizer.localizeStrings('it', [
        {
          id: 'this-id-definitely-doesnt-exist',
          message: 'My fake message',
        },
      ]);

      expect(result).toEqual({
        'this-id-definitely-doesnt-exist': 'My fake message',
      });
    });

    it('uses the original message if formatValue rejects', async () => {
      const localizerMock = new Localizer(new LocalizerBindings());
      localizerMock.setupLocalizer = () =>
        Promise.resolve({
          l10n: {
            formatValue: () => Promise.reject(new Error('foo')),
          } as unknown as Localization,
          selectedLocale: '',
        });
      const result = await localizerMock.localizeStrings('it', [
        {
          id: 'this-id-definitely-doesnt-exist',
          message: 'My fake message',
        },
      ]);

      expect(result).toEqual({
        'this-id-definitely-doesnt-exist': 'My fake message',
      });
    });

    it('can handle optional arguments to be interpolated into the localized string', async () => {
      const code = 'abc123';
      const result = await localizer.localizeStrings('en', [
        {
          id: 'recovery-phone-setup-sms-body',
          message: `This is a fallback message that includes the code: ${code}`,
          vars: { code },
        },
      ]);

      expect(result).toEqual({
        'recovery-phone-setup-sms-body':
          'abc123 is your Mozilla verification code. Expires in 5 minutes.',
      });
    });

    it('can handle missing localized strings with optional arguments', async () => {
      const code = 'abc123';
      const result = await localizer.localizeStrings('en', [
        {
          id: 'recovery-phone-setup-sms-body-does-not-exist',
          message: `This is a fallback message that includes the code: ${code}`,
          vars: { code },
        },
      ]);

      expect(result).toEqual({
        'recovery-phone-setup-sms-body-does-not-exist':
          'This is a fallback message that includes the code: abc123',
      });
    });
  });
});
