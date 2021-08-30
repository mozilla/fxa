/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Story } from '@storybook/html';
import * as config from '../../../config';

export interface StorybookEmailArgs {
  template: string;
  layout: string;
  acceptLanguage: string;
  doc?: string;
  variables: Record<string, any>;
  direction: 'ltr' | 'rtl';
}

/* in production, `utm` parameters may also exist in the urls */
export const commonArgs = {
  androidUrl:
    'https://accounts-static.cdn.mozilla.net/product-icons/google-play.png',
  iosUrl:
    'https://accounts-static.cdn.mozilla.net/product-icons/apple-app-store.png',
  link: 'http://localhost:3030/connect_another_device',
  privacyUrl: 'https://www.mozilla.org/privacy',
  supportUrl:
    'https://support.mozilla.org/kb/im-having-problems-with-my-firefox-account',
};

export const storybookEmail = ({
  template,
  layout = 'fxa',
  acceptLanguage = 'en-US',
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
  variables,
}: {
  template: string;
  layout: string;
  acceptLanguage: string;
  variables: Record<string, any>;
}): Promise<Record<any, string>> {
  // We can't access auth-server config from the client
  // so we need to assume the API URL based on environment
  const apiUrl =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:9000'
      : 'https://api-accounts.stage.mozaws.net';

  const response = await fetch(`${apiUrl}/mjml-server`, {
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

export const Template: Story<StorybookEmailArgs> = (args, context) =>
  storybookEmail({ ...args, direction: context.globals.direction });

export default storybookEmail;
