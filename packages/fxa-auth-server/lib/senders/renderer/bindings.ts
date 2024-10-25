/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// NOTE: This file handled with browser ESLint bindings
// instead of NodeJS for DOM typings support
/* eslint-env browser */

import { ILocalizerBindings } from '../../l10n/interfaces/ILocalizerBindings';
import { LocalizerOpts } from '../../l10n/models/LocalizerOpts';

// Supporting Types
export type EjsOpts = {
  root?: string;
};
export type MjmlOpts = {
  validationLevel?: 'strict' | 'soft' | 'skip';
  filePath?: string;
  ignoreIncludes?: boolean;
  minify?: boolean;
};
export type TemplateOpts = {
  basePath: string;
  cssPath: string;
};

export type RenderOpts = {
  templates: TemplateOpts;
  ejs: EjsOpts;
  mjml: MjmlOpts;
};

type TemplateContextValue =
  | string
  | Record<string, any>
  | number
  | Date
  | null
  | undefined;

// Eventually we can list all available values here, or separate them by template
export type TemplateValues = {
  numberRemaining?: number;
  subscriptions?: Record<string, any>[];
  [key: string]: TemplateContextValue;
};

// TODO: better typing for 'template' with enums? from _versions.json
export interface TemplateContext {
  acceptLanguage?: string;
  template: string;
  layout?: string;
  templateValues?: TemplateValues;
}

export interface RendererContext extends TemplateContext, TemplateValues {
  // cssPath is relative to where rendering occurs
  cssPath: string;
  subject: string;
  action?: string;
}

export type EjsComponent = {
  mjml: string;
  text: string;
};
export type TemplateResult = {
  html: string;
  text: string;
  rootElement: Element;
};
export type RendererOpts = RenderOpts & LocalizerOpts;
type ComponentType = 'templates' | 'layouts';

/**
 * Abstraction for binding the renderer to different contexts, e.g. node vs browser.
 */
export abstract class RendererBindings implements ILocalizerBindings {
  /**
   * Customized options for the renderer
   */
  abstract opts: RendererOpts;

  /**
   * Renders a mjml template with support for fluent localization.
   * @param name Name of template
   * @param context Contains either values sent through mailer.send or mock values from Storybook
   * @param layout Optional layout, which acts as wrapper for for template
   * @returns Rendered template
   */
  async renderTemplate(
    template: string,
    context: TemplateContext,
    layout?: string
  ): Promise<TemplateResult> {
    context = { ...context, template };

    let component = this.renderEjsComponent(
      await this.getComponent('templates', template),
      context
    );

    // Wrap component with layout
    if (layout) {
      component = this.renderEjsComponent(
        await this.getComponent('layouts', layout),
        context,
        component
      );
    }

    const { mjml, text } = component;
    const html = this.mjml2html(mjml);
    const rootElement = this.produceRootElement(html);
    return { html, text, rootElement };
  }

  protected async getComponent(type: ComponentType, name: string) {
    const path = `${this.opts.templates.basePath}/${type}/${name}`;
    const [mjml, text] = await Promise.all([
      this.fetchResource(`${path}/index.mjml`),
      this.fetchResource(`${path}/index.txt`),
    ]);
    return { mjml, text };
  }

  /**
   * Renders an EJS template
   * @param component Component to render
   * @param context Context used to fill template variables.
   * @param body Optional body to wrap
   */
  protected renderEjsComponent(
    component: EjsComponent,
    context: TemplateContext,
    body?: EjsComponent
  ): EjsComponent {
    const { mjml, text } = component;
    return {
      mjml: this.renderEjs(mjml, context, body?.mjml),
      text: this.renderEjs(text, context, body?.text),
    };
  }

  /**
   * Fetches a resource
   * @param path Path to resource
   */
  abstract fetchResource(path: string): Promise<string>;

  /**
   * Renders EJS
   * @param ejsTemplate Raw template to render
   * @param context Context to fill template with
   * @param body Optional body to wrap
   * @returns Rendered EJS template
   */
  abstract renderEjs(
    ejsTemplate: string,
    context: TemplateContext,
    body?: string
  ): string;

  /**
   * Renders MJML into HTML
   * @param mjml MJML markup
   * @returns HTML
   */
  protected abstract mjml2html(mjml: string): string;

  /**
   * Produces a DOM like element from an html string
   * @param html HTML to parse
   * @returns DOM like element
   */
  protected abstract produceRootElement(html: string): Element;
}
