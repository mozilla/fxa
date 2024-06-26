/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AppLayout from '.';
import { createMockSettingsIntegration } from '../mocks';

// Does not follow "Subject" naming convention for clarity because we use
// this throughout the app and not isolated tests.
export const MockSettingsAppLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <AppLayout integration={createMockSettingsIntegration()}>
      {children}
    </AppLayout>
  );
};
