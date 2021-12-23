import { string } from '@hapi/joi';
import { assert } from 'chai';
import { Recoverable } from 'repl';
import FluentLocalizer from '../../lib/senders/emails/fluent-localizer';
import { render, TemplateContext } from '../../lib/senders/emails/renderer';

describe('fluent-localizer', () => {
  const localizer = new FluentLocalizer();

  it('creates localizes', async () => {
    assert.exists(localizer);
  });

  describe('localizes', () => {
    const template: TemplateContext = {
      acceptLanguage: 'en-US',
      template: 'test',
      layout: 'fxa',
      link: 'xyz',
      subject: 'Render test - { $testTerm }',
      testTerm: 'foobarbaz',
      privacyUrl: 'xyz',
    };

    let result: any = {};
    before(async () => {
      result = await localizer.localizeEmail(template);
    });

    it('rendered', () => {
      assert.exists(result);

      assert.exists(result.subject);
      assert.exists(result.text);
      assert.exists(result.html);
    });

    it('localized subject', () => {
      assert.isFalse(/Not Localized/.test(result.subject));
    });

    it('localized text', () => {
      assert.isFalse(/Not Localized/.test(result.text));
    });

    it('localized html', () => {
      assert.isFalse(/Not Localized/.test(result.html));
    });

    it('applied props', () => {
      const reTestTerm = new RegExp(template.testTerm);
      assert.isTrue(reTestTerm.test(result.subject));
      assert.isTrue(reTestTerm.test(result.text));
      assert.isTrue(reTestTerm.test(result.html));
    });

    it('localized dynamic l10n', () => {
      assert.isTrue(
        new RegExp(`Click Here - ${template.testTerm}`).test(result.html)
      );
    });
  });
});
