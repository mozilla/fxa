/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export async function copy(value: string) {
  if (!navigator.clipboard) {
    const tempArea = document.createElement('textarea');
    // We want all the benefits of sr-only
    // but don't want it read aloud
    tempArea.setAttribute('aria-disabled', 'true');
    tempArea.classList.add('sr-only');
    tempArea.value = value;

    document.body.appendChild(tempArea);
    tempArea.focus();
    tempArea.select();

    try {
      if (document.execCommand('copy')) {
        document.body.removeChild(tempArea);
        Promise.resolve();
      }
    } catch (error) {
      document.body.removeChild(tempArea);
      // Ignoring for now...
    }

    return;
  }

  try {
    await navigator.clipboard.writeText(value);
    return Promise.resolve();
  } catch (error) {
    // Ignoring for now...
  }
}
