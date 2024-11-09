/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// NOTE: This file handled with browser ESLint bindings
// instead of NodeJS for DOM typings support
/* eslint-env browser */

import { StoryObj as Story } from '@storybook/html';
import Renderer from '../renderer';
import { BrowserRendererBindings } from '../renderer/bindings-browser';

interface StorybookEmailArgs {
  partial?: string;
  template: string;
  layout: string;
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
  layout = 'fxa',
  doc,
  variables,
  direction,
}: StorybookEmailArgs): HTMLDivElement => {
  const container = document.createElement('article') as HTMLDivElement;
  container.classList.add('email-template');
  container.innerHTML = '<p class="message">Loading email...</p>';
  renderUsingMJML({ template, layout, variables })
    .then(({ html, text, subject }) => {
      container.innerHTML = `
        <header>
          <h1 class="template-name"><span>${
            partial ? partial : layout
          } / </span>${
        template === '_storybook' ? (partial ? 'partial' : 'layout') : template
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
  layout,
  variables,
}: {
  template: string;
  layout: string;
  variables: Record<string, any>;
}): Promise<Record<any, string>> {
  const renderer = new Renderer(new BrowserRendererBindings());
  const acceptLanguage = navigator.language || 'en';

  return renderer.renderEmail({
    template,
    layout,
    acceptLanguage,
    ...variables,
  });
}

const Template: Story<StorybookEmailArgs> = (args, context) =>
  storybookEmail({
    ...args,
    acceptLanguage: context.globals.acceptLanguage,
    direction: context.globals.direction,
  });

export const storyWithProps = (
  templateName: string,
  templateDoc = '',
  defaultArgs: Record<string, any> = {},
  layout = 'fxa'
) => {
  return (overrides: Record<string, any> = {}, storyName = 'Default') => {
    const template = Template.bind({});
    template.args = {
      template: templateName,
      layout,
      partial: defaultArgs.partial,
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
};

export const subplatStoryWithProps = (
  templateName: string,
  templateDoc = '',
  defaultArgs = {}
) =>
  storyWithProps(
    templateName,
    templateDoc,
    { ...defaultArgs, ...subplatCommonArgs },
    'subscription'
  );
