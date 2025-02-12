/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FluentBundle } from '@fluent/bundle';
import { Localization } from '@fluent/dom';
import chai, { assert } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Localizer from '../../../lib/l10n';
import { LocalizerBindings } from '../../../lib/l10n/bindings';

chai.use(chaiAsPromised);

describe('Localizer', () => {
  describe('fetches bundles', () => {
    const localizerBindings = new LocalizerBindings();
    const localizer = new Localizer(localizerBindings);

    it('fails with a bad localizer ftl basePath', () => {
      assert.throws(() => {
        const localizerBindings = new LocalizerBindings({
          translations: {
            basePath: '/not/a/apth',
          },
        });
        // eslint-disable-next-line no-new
        new Localizer(localizerBindings);
      }, 'Invalid ftl translations basePath');
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
          'subscriptionAccountFinishSetup-action-2',
          {}
        );

        assert.equal(result, 'Einführung');
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

  describe('localizeStrings', () => {
    const localizer = new Localizer(new LocalizerBindings());

    it('localizes a string correctly', async () => {
      const result = await localizer.localizeStrings('it', [
        {
          id: 'manage-account',
          message: 'Manage account',
        },
      ]);

      assert.deepEqual(result, {
        'manage-account': 'Gestisci account',
      });
    });

    it('localizes multiple strings correctly', async () => {
      const result = await localizer.localizeStrings('it', [
        {
          id: 'manage-account',
          message: 'Manage account',
        },
        {
          id: 'manage-account-plaintext',
          message: 'Manage account:',
        },
      ]);

      assert.deepEqual(result, {
        'manage-account': 'Gestisci account',
        'manage-account-plaintext': 'Gestisci account:',
      });
    });

    it('uses the original message if formatValue resolves as undefined', async () => {
      const result = await localizer.localizeStrings('it', [
        {
          id: 'this-id-definitely-doesnt-exist',
          message: 'My fake message',
        },
      ]);

      assert.deepEqual(result, {
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

      assert.deepEqual(result, {
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

      assert.deepEqual(result, {
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

      assert.deepEqual(result, {
        'recovery-phone-setup-sms-body-does-not-exist':
          'This is a fallback message that includes the code: abc123',
      });
    });
  });
});
