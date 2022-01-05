/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import chai, { assert } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { join } from 'path';
import * as fs from 'fs';
import FluentLocalizer, {
  splitPlainTextLine,
} from '../../../../lib/senders/emails/fluent-localizer';
import { TemplateContext } from '../../../../lib/senders/emails/localizer-bindings';
import { NodeLocalizerBindings } from '../../../../lib/senders/emails/localizer-bindings-node';

chai.use(chaiAsPromised);

describe('fluent localizer', () => {
  describe('key value extraction', () => {
    const pair = {
      key: 'foo_2-Bar',
      val: 'foo - bar',
    };

    it('splits line with default format', () => {
      const { key, val } = splitPlainTextLine(`${pair.key} = "${pair.val}"`);

      assert.equal(key, pair.key);
      assert.equal(val, pair.val);
    });

    it('handles line with trailing whitespace', () => {
      const { key, val } = splitPlainTextLine(
        `  ${pair.key}  =  "${pair.val}"  `
      );
      assert.equal(key, pair.key);
      assert.equal(val, pair.val);
    });

    it('handles compact line format', () => {
      const { key, val } = splitPlainTextLine(`${pair.key}="${pair.val}"`);
      assert.equal(key, pair.key);
      assert.equal(val, pair.val);
    });

    it('handles escaped quote format', () => {
      const { key, val } = splitPlainTextLine(
        `${pair.key}="${pair.val} \"baz\" "`
      );
      assert.equal(key, pair.key);
      assert.equal(val, pair.val + ' "baz" ');
    });

    it('requires value to be quoted string', () => {
      const { key, val } = splitPlainTextLine(`${pair.key} = ${pair.val}`);
      assert.notExists(key);
      assert.notExists(val);
    });
  });

  describe('fluent-localizer', () => {
    const opts = {
      templates: {
        basePath: __dirname,
      },
      ejs: {
        root: __dirname,
      },
      mjml: {
        filePath: __dirname,
      },
      l10n: {
        basePath: join(__dirname, '../../../temp/public/locales'),
      },
    };

    const localizer = new FluentLocalizer(new NodeLocalizerBindings(opts));

    function getTestContext(test: string): TemplateContext {
      return {
        acceptLanguage: 'en',
        template: test,
        layout: 'fxa',
        link: 'xyz',
        subject: `Render - ${test} - { $testTerm }`,
        testTerm: `foobar${test}`,
        privacyUrl: 'xyz',
      };
    }

    function testTemplate(test: string) {
      const template: TemplateContext = getTestContext(test);

      let result: { html: string; text: string; subject: string };

      before(async () => {
        result = await localizer.localizeEmail(template);
      });

      it('renders', () => {
        assert.exists(result);

        assert.exists(result.text);
        assert.exists(result.html);
        assert.exists(result.subject);
      });

      it('localizes subject', () => {
        assert.isFalse(/Not Localized/.test(result.subject));
      });

      it('localizes text', () => {
        assert.isFalse(/Not Localized/.test(result.text));
      });

      it('localizes html', () => {
        assert.isFalse(/Not Localized/.test(result.html));
      });

      it('applies props', () => {
        const reTestTerm = new RegExp(template.testTerm);
        assert.isTrue(reTestTerm.test(result.subject));
        assert.isTrue(reTestTerm.test(result.text));
        assert.isTrue(reTestTerm.test(result.html));
      });

      it('localizes l10n text with variables', () => {
        assert.isTrue(
          new RegExp(`Click Here - ${test} - ${template.testTerm}`).test(
            result.html
          )
        );
      });
    }

    it('creates localizer', async () => {
      assert.exists(localizer);
    });

    describe('test template /test-missing-l10n-id', () => {
      it.skip('fails with missing l10n id', async () => {
        const template: TemplateContext = getTestContext(
          'test-missing-l10n-id'
        );

        await assert.isRejected(
          localizer.localizeEmail(template),
          Error,
          'Missing data-1l0n-id detected. l10n-id=test-missing-l10n-id-title'
        );
      });
    });

    /**
     * Here there are two test folders both of which reference partials/test.
     * There have been issues where different templates using the same partial
     * had errors in the resulting translation. The two folder setup is designed
     * to mimic this behavior.
     */
    describe('test template /test-partials1', () => {
      testTemplate('test-partials1');
    });
    describe('test template /test-partials2', () => {
      testTemplate('test-partials2');
    });
  });
});
