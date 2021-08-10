/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface StorybookEmailArgs {
  template: string;
  layout: string;
  acceptLanguage: string;
  doc?: string;
  variables: Record<string, any>;
}

export const commonArgs = {
  privacyUrl: 'https://www.mozilla.org/privacy', // in production, `utm` parameters may exist
  supportUrl:
    'https://support.mozilla.org/kb/im-having-problems-with-my-firefox-account',
};

export const storybookEmail = ({
  template,
  layout = 'fxa',
  acceptLanguage = 'en-US',
  doc,
  variables,
}: StorybookEmailArgs): HTMLDivElement => {
  const container = document.createElement('div');
  container.innerHTML = 'Loading email...';
  renderUsingMJML({ template, layout, acceptLanguage, variables })
    .then(({ html, subject }) => {
      container.innerHTML = `
        ${doc ? `<p>Template Description: ${doc}</p>` : ''}
        <p>Email Subject: ${subject}</p>
        <hr />
        ${html}
      `;
    })
    .catch((error: Error) => {
      container.innerHTML = `Error loading email: ${error.message}`;
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
  const { html, subject } = await JSON.parse(result);
  if (response.status !== 200) {
    throw new Error(result);
  }
  return { html, subject };
}

export default storybookEmail;
