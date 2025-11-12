/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { JSDOM } from 'jsdom';
import * as ejs from 'ejs';
import mjml2html from 'mjml';
import {
  LocalizerDom,
  determineDirection,
  LocalizerServer,
} from '@fxa/shared/l10n/dom';
import {
  EmailRenderResult,
  GlobalTemplateValues,
  LocalizedEmailMetadata,
  RendererContext,
  // RenderEmailOptions,
  MJMLComponent,
  FtlIdMsg,
} from './emailTemplate.types';

type RenderEmailOptions<T extends Record<string, any>> = {
  template: string;
  layout: string;
  acceptLanguage: string;
  selectedLocale?: string;
  subject: string;
  args: T & Record<string, any>;
};

type SubscriptionFirstInvoiceArgs = {
  email: string;
  uid: string;
  productId: string;
  planId: string;
  planEmailIconURL: string;
  productName: string;
  creditAppliedInCents: string;
  invoiceAmountDueInCents: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceLink: string;
  invoiceTotalInCents: string;
  invoiceTotalCurrency: string;
  invoiceStartingBalance: string;
  invoiceSubtotalInCents: string;
  invoiceDiscountAmountInCents: string;
  invoiceTaxAmountInCents: string;
  offeringPriceInCents: string;
  payment_provider: string;
  cardType: string;
  lastFour: string;
  nextInvoiceDate: string;
  remainingAmountInCents: string;
  showTaxAmount: string;
  unusedAmountTotalInCents: string;
  discountType: string;
  discountDuration: string;
};

@Injectable()
export class EmailTemplateManager {
  private readonly templateBasePath: string;
  private readonly cssPath: string;
  private templateCache: Map<string, MJMLComponent> = new Map();
  private layoutCache: Map<string, MJMLComponent> = new Map();

  constructor(
    @Inject(LocalizerServer) private localizerServer: LocalizerServer
  ) {
    this.templateBasePath = join(__dirname, '../templates');
    this.cssPath = join(
      __dirname,
      '../../../../../packages/fxa-auth-server/lib/senders/emails/css'
    );
  }

  // emailTemplateManager.renderEmail(renewalEmail, args) should enforce typing on args

  // async renderEmail(options: RenderEmailOptions): Promise<EmailRenderResult> {
  async renderEmail<T extends Record<string, any>>(
    options: RenderEmailOptions<T>
  ): Promise<EmailRenderResult> {
    const {
      template,
      layout,
      acceptLanguage,
      selectedLocale,
      args: templateValues,
    } = options;
    const { l10n } =
      await this.localizerServer.setupDomLocalization(acceptLanguage);

    const localizedGlobalTemplateValues = await this.getLocalizedEjsLocalValues(
      template,
      l10n,
      templateValues
    );

    const rendererContext: RendererContext = {
      ...templateValues,
      ...localizedGlobalTemplateValues,
      template,
      layout,
      acceptLanguage,
      selectedLocale,
      cssPath: this.cssPath,
    };

    const { templateComponent, layoutComponent } = await this.loadFiles(
      template,
      layout
    );

    const { renderedTemplate, plaintext } = this.renderEjsContent(
      templateComponent,
      layoutComponent,
      rendererContext
    );

    const html = mjml2html(renderedTemplate, {
      filePath: rendererContext.cssPath,
      validationLevel: 'strict',
      keepComments: false,
    });

    const dom = new JSDOM(html.html);
    const rootElement = dom.window.document.documentElement;

    l10n.connectRoot(rootElement);
    await l10n.translateRoots();

    const direction = determineDirection(
      acceptLanguage || selectedLocale || 'en'
    );
    const isRtl = direction === 'rtl';
    if (isRtl) {
      const body = rootElement.getElementsByTagName('body')[0];
      if (body) {
        body.classList.add('rtl');
      }
    }

    const localizedPlaintext = await this.localizeDomPlaintext(
      plaintext,
      rendererContext,
      l10n
    );

    return {
      html: rootElement.outerHTML,
      text: localizedPlaintext,
      subject: rendererContext.subject,
      action: rendererContext.action || '',
      preview: rendererContext.preview || '',
    };
  }

  // Load MJML and plaintext template/layout files, with caching
  async loadFiles(template: string, layout: string) {
    let templateComponent = this.templateCache.get(template);
    let layoutComponent = this.layoutCache.get(layout);
    this.templateCache.has(template);
    if (!templateComponent) {
      const templatePath = join(this.templateBasePath, 'templates', template);
      const templateMjmlPath = join(templatePath, 'index.mjml');
      const templateTextPath = join(templatePath, 'index.txt');
      templateComponent = {
        mjml: await fs.readFile(templateMjmlPath, 'utf8'),
        text: await fs.readFile(templateTextPath, 'utf8'),
      };
      this.templateCache.set(template, templateComponent);
    }
    if (!layoutComponent) {
      const layoutPath = join(this.templateBasePath, 'layouts', layout);
      const layoutMjmlPath = join(layoutPath, 'index.mjml');
      const layoutTextPath = join(layoutPath, 'index.txt');
      layoutComponent = {
        mjml: await fs.readFile(layoutMjmlPath, 'utf8'),
        text: await fs.readFile(layoutTextPath, 'utf8'),
      };
      this.layoutCache.set(layout, layoutComponent);
    }

    return { templateComponent, layoutComponent };
  }

  renderEjsContent(
    templateComponent: MJMLComponent,
    layoutComponent: MJMLComponent,
    rendererContext: RendererContext
  ) {
    const flattenedContext = {
      ...rendererContext,
      ...this.flattenNestedObjects(rendererContext),
    };

    // const newRender = ejs.render(emaildetailsMjml, { ...flattenedContext, layoutPath });

    let renderedTemplate = ejs.render(
      templateComponent.mjml,
      flattenedContext,
      {
        root: this.templateBasePath,
      }
    );
    let plaintext = ejs.render(templateComponent.text, flattenedContext, {
      root: this.templateBasePath,
    });

    if (layoutComponent) {
      renderedTemplate = ejs.render(
        layoutComponent.mjml,
        { ...flattenedContext, body: renderedTemplate },
        { root: this.templateBasePath }
      );
      plaintext = ejs.render(
        layoutComponent.text,
        { ...flattenedContext, body: plaintext },
        { root: this.templateBasePath }
      );
    }
    return { renderedTemplate, plaintext };
  }

  // Get the localized template locals for EJS rendering
  async getLocalizedEjsLocalValues<T extends Record<string, any>>(
    template: string,
    l10n: LocalizerDom,
    context: T
  ): Promise<LocalizedEmailMetadata> {
    const includesPath = join(this.templateBasePath, template, 'includes.json');
    const includesContent = await fs.readFile(includesPath, 'utf8');
    const globalTemplateValues: GlobalTemplateValues =
      JSON.parse(includesContent);
    const subject = await this.localizeString(
      l10n,
      globalTemplateValues.subject,
      context
    );

    let action: string | undefined;
    if (globalTemplateValues.action) {
      action = await this.localizeString(
        l10n,
        globalTemplateValues.action,
        context
      );
    }

    let preview: string | undefined;
    if (globalTemplateValues.preview) {
      preview = await this.localizeString(
        l10n,
        globalTemplateValues.preview,
        context
      );
    }

    return {
      subject,
      action,
      preview,
    };
  }

  protected async localizeDomPlaintext(
    text: string,
    context: RendererContext,
    domLocalizer: LocalizerDom
  ): Promise<string> {
    const ftlContext = this.flattenNestedObjects(context);

    const plainTextArr = text.split('\n');
    for (const i in plainTextArr) {
      const { key, val } = this.splitPlainTextLine(plainTextArr[i]);

      if (key && val) {
        plainTextArr[i] =
          (await domLocalizer.formatValue(key, ftlContext)) || val;
      }
    }
    return plainTextArr.join('\n').replace(/(\n){2,}/g, '\n');
  }

  private splitPlainTextLine(plainText: string) {
    const reSplitLine = /(?<key>[a-zA-Z0-9-_]+)\s*=\s*"(?<val>.*)?"/;
    const matches = reSplitLine.exec(plainText);
    const key = matches?.groups?.key;
    const val = matches?.groups?.val;

    return { key, val };
  }

  private async localizeString(
    l10n: LocalizerDom,
    ftlMsg: FtlIdMsg,
    localizationParams: Record<string, any>
  ): Promise<string> {
    const localizedString = await l10n.formatValue(
      ftlMsg.id,
      this.flattenNestedObjects(localizationParams),
      ftlMsg.message
    );

    // Handle EJS templates in localized strings
    if (localizedString.includes('<%')) {
      return ejs.render(localizedString, localizationParams, {
        root: this.templateBasePath,
      });
    }

    return localizedString;
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
  private flattenNestedObjects(
    context: RendererContext | Record<string, any>
  ): Record<string, string | number> {
    const flattenedObj = {} as any;

    for (const templateVar in context) {
      const varValue = context[templateVar];
      if (typeof varValue === 'object' && varValue !== null) {
        Object.assign(flattenedObj, this.flattenNestedObjects(varValue));
      } else {
        flattenedObj[templateVar] = varValue;
      }
    }

    return flattenedObj;
  }
}
