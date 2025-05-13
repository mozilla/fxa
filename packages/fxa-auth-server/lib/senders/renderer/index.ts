/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { DOMLocalization, Localization } from '@fluent/dom';
import { RendererBindings, TemplateContext, RendererContext } from './bindings';
import Localizer, { FtlIdMsg } from '../../l10n';

const RTL_LOCALES = [
  'ar',
  'ckb',
  'dv',
  'he',
  'ks',
  'ps',
  'fa',
  'syr',
  'ur',
  'ug',
  'pa',
];

export interface GlobalTemplateValues {
  subject: FtlIdMsg;
  action?: FtlIdMsg;
  preview?: FtlIdMsg;
}

class Renderer extends Localizer {
  protected readonly bindings: RendererBindings;

  constructor(bindings: RendererBindings) {
    super(bindings);
    this.bindings = bindings;
  }

  async localizeAndRender(
    l10n: DOMLocalization | Localization | undefined,
    string: FtlIdMsg,
    context: RendererContext
  ) {
    // l10n will only be undefined in tests
    if (!l10n) {
      l10n = (await super.setupLocalizer(context.acceptLanguage || '')).l10n;
    }

    const localizedString =
      (await l10n.formatValue(string.id, flattenNestedObjects(context))) ||
      string.message;
    return localizedString.includes('<%')
      ? this.bindings.renderEjs(localizedString, context)
      : localizedString;
  }

  /**
   * Renders and localizes an MJML/EJS email.
   * @param templateContext Contains either values sent through mailer.send or mock values from Storybook
   * @returns html HTML transformed from MJML that is rendered through EJS and localized
   * @returns text Plaintext rendered through EJS and localized
   * @returns subject Localized subject, for mailer use
   */
  async renderEmail(templateContext: TemplateContext) {
    const { acceptLanguage, template, layout } = templateContext;
    const { l10n, selectedLocale } = await super.setupDomLocalizer(
      acceptLanguage || ''
    );

    const context = {
      ...templateContext.templateValues,
      ...templateContext,
      cssPath: this.bindings.opts.templates.cssPath,
      // subject will always be set later but initialize with a string to make TS happy
      subject: '',
    } as RendererContext;

    if (template !== '_storybook') {
      /*
       * 'Subject' and 'action' must be localized BEFORE the email is rendered because:
       * 1) These values are needed in layout files and aren't easily localized, since
       * `subject` goes inside `mj-title` and `action` goes in a script in `metadata.mjml`
       * 2) We need to return a localized `subject` back to the mailer
       */
      const { subject, action, preview } =
        await this.getGlobalTemplateValues(context);
      const localizeAndRenderSubject = this.localizeAndRender(
        l10n,
        subject,
        context
      );

      context.subject = await localizeAndRenderSubject;

      if (action) {
        const localizedAction = await this.localizeAndRender(
          l10n,
          action,
          context
        );
        context.action = localizedAction;
      }

      if (preview) {
        const localizedPreview = await this.localizeAndRender(
          l10n,
          preview,
          context
        );
        context.preview = localizedPreview;
      }
    }

    const { text, rootElement } = await this.bindings.renderTemplate(
      template || '',
      context,
      layout
    );

    l10n.connectRoot(rootElement);
    await l10n.translateRoots();

    const isLocaleRenderedRtl = RTL_LOCALES.includes(selectedLocale);
    if (isLocaleRenderedRtl) {
      const body = rootElement.getElementsByTagName('body')[0];
      body.classList.add('rtl');
    }

    const localizedPlaintext = await this.localizePlaintext(
      text,
      context,
      l10n
    );

    return {
      html: rootElement.outerHTML,
      text: localizedPlaintext,
      subject: context.subject,
      preview: context.preview || '',
    };
  }

  private async getGlobalTemplateValues(
    context: RendererContext
  ): Promise<GlobalTemplateValues> {
    // We must use 'require' here, 'import' causes an 'unknown file extension .ts'
    // error. Might be a config option to make it work?
    // eslint-disable-next-line no-useless-catch
    try {
      // make this a switch statement on 'template' if more cases arise?
      if (context.template === 'lowRecoveryCodes') {
        return (
          await require(`../emails/templates/${context.template}/includes`)
        ).getIncludes(context.numberRemaining);
      }
      if (context.template === 'newDeviceLogin') {
        return (
          await require(`../emails/templates/${context.template}/includes`)
        ).getIncludes(context.clientName);
      }
      return require(`../emails/templates/${context.template}/includes.json`);
    } catch (e) {
      throw e;
    }
  }

  protected async localizePlaintext(
    text: string,
    context: TemplateContext | RendererContext,
    l10n?: DOMLocalization | Localization
  ): Promise<string> {
    if (!l10n) {
      l10n = (await super.setupLocalizer(context.acceptLanguage)).l10n;
    }
    const ftlContext = flattenNestedObjects(context);

    const plainTextArr = text.split('\n');
    for (const i in plainTextArr) {
      // match the lines that are of format key = "value" since we will be extracting the key
      // to pass down to fluent
      const { key, val } = splitPlainTextLine(plainTextArr[i]);

      if (key && val) {
        plainTextArr[i] = (await l10n.formatValue(key, ftlContext)) || val;
      }
    }
    // convert back to string and strip excessive line breaks
    return plainTextArr.join('\n').replace(/(\n){2,}/g, '\n\n');
  }
}

const reSplitLine = /(?<key>[a-zA-Z0-9-_]+)\s*=\s*"(?<val>.*)?"/;
export function splitPlainTextLine(plainText: string) {
  const matches = reSplitLine.exec(plainText);
  const key = matches?.groups?.key;
  const val = matches?.groups?.val;

  return { key, val };
}

/*
 * We flatten objects coming from the mailer when localizing because Fluent expects to be passed
 * a simple object containing variable names and their values, not an object containing objects
 *
 * NOTE: if in the future, any template value is an _array_ of objects containing strings needing
 * l10n, we will need to account for those variable names differently to ensure the same EJS
 * variable matches the variable name we pass to Fluent. Right now `subscriptions` containing
 * `productName`s is the only array of objects and since we don't localize `productName`
 * that case isn't handled since we don't need to (yet).
 */
export function flattenNestedObjects(
  context: RendererContext | Record<string, any>
): Record<string, string | number> {
  const flattenedObj = {} as any;

  for (const templateVar in context) {
    const varValue = context[templateVar];
    if (typeof varValue === 'object' && varValue !== null) {
      Object.assign(flattenedObj, flattenNestedObjects(varValue));
    } else {
      flattenedObj[templateVar] = varValue;
    }
  }

  return flattenedObj;
}

export default Renderer;
