/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface StorybookEmailArgs {
  template: string;
  layout: string;
  description?: string;
  variables: Record<string, any>;
}

export const storybookEmail = ({
  template,
  layout,
  description,
  variables,
}: StorybookEmailArgs): HTMLDivElement => {
  const container = document.createElement('div');
  container.innerHTML = 'Loading email...';
  const emailDescriptionDiv = document.createElement('div');
  if (description) {
    emailDescriptionDiv.innerHTML = `
        <p>${description}</p>
        <hr />`;
  }

  renderUsingMJML({ template, layout, variables })
    .then((result) => {
      container.innerHTML = emailDescriptionDiv.innerHTML + result;
    })
    .catch((error: Error) => {
      container.innerHTML = `Error loading email: ${error.message}`;
    });

  return container;
};

async function renderUsingMJML({
  template,
  layout,
  apiUrl = 'http://localhost:8192',
  variables,
}: {
  template: string;
  layout: string;
  apiUrl?: string;
  variables: Record<string, any>;
}): Promise<string> {
  const response = await fetch(apiUrl, {
    method: 'POST',
    body: JSON.stringify({
      template,
      layout,
      ...variables,
    }),
  });
  const result = await response.text();
  if (response.status !== 200) {
    throw new Error(result);
  }
  return result;
}

export default storybookEmail;
