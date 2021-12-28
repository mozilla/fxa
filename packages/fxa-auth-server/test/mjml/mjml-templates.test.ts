import { assert } from 'chai';
import FluentLocalizer, {
  splitPlainTextLine,
} from '../../lib/senders/emails/fluent-localizer';
import { TemplateContext } from '../../lib/senders/emails/renderer';

describe('mjml rendering', () => {
  describe.only('line splitter', () => {
    const pair = {
      key: 'foo_2-Bar',
      val: 'foo - bar',
    };

    it('splits default format', () => {
      const { key, val } = splitPlainTextLine(`${pair.key} = "${pair.val}"`);

      assert.equal(key, pair.key);
      assert.equal(val, pair.val);
    });

    it('handles trailing extra whitespace', () => {
      const { key, val } = splitPlainTextLine(
        `  ${pair.key}  =  "${pair.val}"  `
      );
      assert.equal(key, pair.key);
      assert.equal(val, pair.val);
    });

    it('handles compact format', () => {
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

    it('requires quoted string', () => {
      const { key, val } = splitPlainTextLine(`${pair.key} = ${pair.val}`);
      assert.notExists(key);
      assert.notExists(val);
    });
  });

  describe.only('fluent-localizer', () => {
    const localizer = new FluentLocalizer();

    it('creates localizes', async () => {
      assert.exists(localizer);
    });

    // Here we test two folders bot of which reference the partials/test.
    // There have been several bugs were when two diffferent template folders
    // referencing the same partial would give language translation issues.
    for (const test of ['test1', 'test2']) {
      describe(`localizes ${test}`, () => {
        const template: TemplateContext = {
          acceptLanguage: 'en',
          template: test,
          layout: 'fxa',
          link: 'xyz',
          subject: `Render - ${test} - { $testTerm }`,
          testTerm: `foobar${test}`,
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
            new RegExp(`Click Here - ${test} - ${template.testTerm}`).test(
              result.html
            )
          );
        });
      });
    }
  });
});
