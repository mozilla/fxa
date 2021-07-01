import { DOMLocalization } from '@fluent/dom';
import { FluentBundle, FluentResource } from '@fluent/bundle';
import { JSDOM } from 'jsdom';
import * as fs from 'fs';
import { render, context } from './renderer';

class LocalizeEmails {
  constructor() {}

  async localizeEmail(templateName: string, mailSubject: string) {
    /* @ts-ignore */
    const htmlDocument = render(templateName, context);

    const { document } = new JSDOM(htmlDocument).window;

    const userLocale = 'en-US';

    async function fetchResource(resource: string) {
      const response = fs.readFileSync(`${resource}`, 'utf8');
      return response;
    }

    async function* generateBundles(resourceIds: Array<string>) {
      let bundle = new FluentBundle([userLocale]);
      for (let resourceId of resourceIds) {
        let source = await fetchResource(resourceId);
        let resource = new FluentResource(source);
        bundle.addResource(resource);
      }
      yield bundle;
    }

    const l10n = new DOMLocalization(
      [`./lib/senders/emails/locales/${userLocale}.ftl`],
      generateBundles
    );

    l10n.connectRoot(document.documentElement);

    await l10n.translateRoots();

    const subject = await l10n.formatValue(mailSubject);
    return {
      localizedHTML: document.documentElement.outerHTML,
      /* @ts-ignore */
      localizedText: document.documentElement
        .querySelector('body')
        .textContent.replace(/(^[ \t]*\n)|(^[ \t]*)/gm, ''),
      localizedSubject: subject,
    };
  }
}
module.exports = LocalizeEmails;
