/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Export window so it's possible to jest.mock the import of it in tests.

const theRealWindow = window;

export { theRealWindow as window };
