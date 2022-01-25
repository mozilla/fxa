/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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
};
export type L10nOpts = {
  basePath: string;
};
export type RenderOpts = {
  templates: TemplateOpts;
  ejs: EjsOpts;
  mjml: MjmlOpts;
};
export type LocalizationOpts = {
  l10n: L10nOpts;
};

// Top level types
export type TemplateContext = Record<string, any>;
export type TemplateComponent = 'layouts' | 'templates' | 'partials';
export type EjsComponent = {
  mjml: string;
  text: string;
};
export type TemplateResult = {
  html: string;
  text: string;
  rootElement: Element;
};
export type LocalizerOpts = RenderOpts & LocalizationOpts;

/**
 * Abstraction for binding fluent localizer to different contexts, e.g. node vs browser.
 */
export abstract class LocalizerBindings {
  /**
   * Customized options for the localizer
   */
  protected abstract opts: LocalizerOpts;

  /**
   * Renders a mjml template with support for fluent localization.
   * @param name Name of template
   * @param context Contains placeholder values
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

  protected async getComponent(type: string, name: string) {
    const path = `${this.opts.templates.basePath}/${type}/${name}`;
    const mjml = await this.fetchResource(`${path}/index.mjml`);
    const text = await this.fetchResource(`${path}/index.txt`);
    return { mjml, text };
  }

  /**
   * Returns the set of localization strings for the specified locale.
   * @param locale Locale to use, defaults to en.
   */
  async fetchLocalizationMessages(locale?: string) {
    // note: 'en' auth.ftl only exists for browser bindings / Storybook
    // the fallback English strings within the templates will be shown in other envs
    const path = `${this.opts.l10n.basePath}/${locale || 'en'}/auth.ftl`;

    try {
      return await this.fetchResource(path);
    } catch (e) {
      // We couldn't fetch any strings; just return nothing and fluent will fall
      // back to the default locale if needed.
      return '';
    }
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
  protected abstract fetchResource(path: string): Promise<string>;

  /**
   * Renders EJS
   * @param ejsTemplate Raw template to render
   * @param context Context to fill template with
   * @param body Optional body to wrap
   * @returns Rendered EJS template
   */
  protected abstract renderEjs(
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
