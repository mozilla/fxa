/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// NOTE: This file handled with browser ESLint bindings
// instead of NodeJS for DOM typings support
/* eslint-env browser */

import { StoryFn } from '@storybook/html';
import { EmailRenderer } from './renderer';
import { BrowserRendererBindings } from './renderer/bindings-browser';
import { ComponentTarget, Includes } from './renderer/bindings';

export interface StorybookEmailArgs {
  partial?: string;
  template: string;
  version: number;
  layout: string;
  includes: Includes;
  target?: ComponentTarget;
  acceptLanguage: string;
  doc?: string;
  variables: Record<string, any>;
  direction: 'ltr' | 'rtl';
}

/* in production, `utm` parameters may also exist in the urls */
const commonArgs = {
  androidUrl:
    'https://play.google.com/store/apps/details?id=org.mozilla.firefox',
  iosUrl:
    'https://apps.apple.com/us/app/firefox-private-safe-browser/id989804926',
  supportUrl:
    'https://support.mozilla.org/kb/im-having-problems-my-firefox-account',
  privacyUrl: 'https://www.mozilla.org/privacy/mozilla-accounts/',
  unsubscribeUrl:
    'https://privacyportal.onetrust.com/webform/1350748f-7139-405c-8188-22740b3b5587/4ba08202-2ede-4934-a89e-f0b0870f95f0',
};

const subplatCommonArgs = {
  email: 'customer@example.com',
  subscriptionTermsUrl: 'http://localhost:3031/legal-docs',
  subscriptionPrivacyUrl: 'http://localhost:3031/legal-docs',
  cancelSubscriptionUrl: 'http://localhost:3030/subscriptions',
  updateBillingUrl: 'http://localhost:3030/subscriptions',
  reactivateSubscriptionUrl: 'http://localhost:3030/subscriptions',
  accountSettingsUrl: 'http://localhost:3030/settings',
  cancellationSurveyUrl:
    'https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21',
  mozillaSupportUrl: 'https://support.mozilla.org',
};

const storybookEmail = ({
  partial,
  template,
  version,
  layout = 'fxa',
  target = 'index',
  includes,
  doc,
  variables,
  direction,
}: StorybookEmailArgs): HTMLDivElement => {
  const container = document.createElement('article') as HTMLDivElement;
  container.classList.add('email-template');
  container.innerHTML = '<p class="message">Loading email...</p>';
  renderUsingMJML({ template, version, layout, target, includes, variables })
    .then(({ html, text, subject }) => {
      container.innerHTML = `
        <header>
          <h1 class="template-name"><span>${
            partial ? partial : layout
          } / </span>${
            template === '_storybook'
              ? partial
                ? 'partial'
                : 'layout'
              : template
          }</h1>
          ${doc ? `<p class="template-description">${doc}</p>` : ''}
          <p class="email-subject">Subject: ${subject}</p>
        </header>

        <main class="template-container">
          <section class="template-html">
            <span class="badge">HTML</span>
            <div class="${direction}">${html}</div>
          </section>
          <section class="template-plaintext">
            <span class="badge">Plaintext</span>
            <div class="${direction}">${text}</div>
          </section>
        </main>
      `;
    })
    .catch((error: Error) => {
      container.innerHTML = `<p class="message"><b>Loading error</b> - ${error.message}</p>`;
    });

  return container;
};

async function renderUsingMJML({
  template,
  version,
  layout,
  includes,
  target,
  variables,
}: {
  template: string;
  version: number;
  layout: string;
  includes: Includes;
  target?: ComponentTarget;
  variables: Record<string, any>;
}) {
  const renderer = new EmailRenderer(new BrowserRendererBindings());
  const acceptLanguage = navigator.language || 'en';

  return renderer.renderEmail({
    template,
    version,
    layout,
    target,
    acceptLanguage,
    includes,
    ...variables,
  });
}

const Template: StoryFn<StorybookEmailArgs> = (args, context) =>
  storybookEmail({
    ...args,
    acceptLanguage: context.globals['acceptLanguage'],
    direction: context.globals['direction'],
  });

export function storyWithProps<T extends Record<string, any>>(
  templateName: string,
  templateDoc = '',
  defaultArgs: T,
  includes: Includes,
  layout = 'fxa',
  target: ComponentTarget = 'index'
) {
  return (overrides: Record<string, any> = {}, storyName = 'Default') => {
    const template = Template.bind({});
    template.args = {
      template: templateName,
      includes,
      layout,
      target,
      partial: defaultArgs['partial'],
      doc: templateDoc,
      variables: {
        ...commonArgs,
        ...defaultArgs,
        ...overrides,
      },
    };
    template.storyName = storyName;
    return template;
  };
}

export function subplatStoryWithProps<T extends Record<string, any>>(
  templateName: string,
  templateDoc = '',
  defaultArgs: T,
  includes: Includes
) {
  return storyWithProps(
    templateName,
    templateDoc,
    { ...defaultArgs, ...subplatCommonArgs },
    includes,
    'subscription'
  );
}
