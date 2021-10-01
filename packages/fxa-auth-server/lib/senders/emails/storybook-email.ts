/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Story } from '@storybook/html';

interface StorybookEmailArgs {
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
    'https://support.mozilla.org/kb/im-having-problems-with-my-firefox-account',
  privacyUrl: 'https://www.mozilla.org/privacy',
};

const subplatCommonArgs = {
  email: 'customer@example.com',
  subscriptionTermsUrl: 'http://localhost:3031/legal-docs',
  subscriptionPrivacyUrl: 'http://localhost:3031/legal-docs',
  cancelSubscriptionUrl: 'http://localhost:3030/subscriptions',
  updateBillingUrl: 'http://localhost:3030/subscriptions',
  reactivateSubscriptionUrl: 'http://localhost:3030/subscriptions',
  accountSettingsLink: 'http://localhost:3030/settings',
};

const storybookEmail = ({
  template,
  layout = 'fxa',
  acceptLanguage = 'en',
  doc,
  variables,
  direction,
}: StorybookEmailArgs): HTMLDivElement => {
  const container = document.createElement('article') as HTMLDivElement;
  container.classList.add('email-template');
  container.innerHTML = '<p class="message">Loading email...</p>';
  renderUsingMJML({ template, layout, acceptLanguage, variables })
    .then(({ html, text, subject }) => {
      container.innerHTML = `
        <header>
          <h1 class="template-name"><span>${layout} / </span>${template}</h1>
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
  acceptLanguage,
  apiUrl = 'http://localhost:8192',
  variables,
}: {
  template: string;
  layout: string;
  acceptLanguage: string;
  apiUrl?: string;
  variables: Record<string, any>;
}): Promise<Record<any, string>> {
  const response = await fetch(apiUrl, {
    method: 'POST',
    body: JSON.stringify({
      template,
      layout,
      acceptLanguage,
      ...variables,
    }),
  });
  const result = await response.text();
  const { html, subject, text } = await JSON.parse(result);
  if (response.status !== 200) {
    throw new Error(result);
  }
  return { html, subject, text };
}

const Template: Story<StorybookEmailArgs> = (args, context) =>
  storybookEmail({ ...args, direction: context.globals.direction });

export const storyWithProps = (
  templateName: string,
  templateDoc = '',
  defaultArgs = {},
  layout = 'fxa'
) => {
  return (overrides: Record<string, any> = {}, storyName = 'Default') => {
    const template = Template.bind({});
    template.args = {
      template: templateName,
      layout,
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
    'subplat'
  );
