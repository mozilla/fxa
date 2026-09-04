/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen } from '@testing-library/react';
import { useChangeFocusEffect } from '.';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';

describe('useChangeFocusEffect', () => {
  const Subject = () => {
    const elToFocusRef = useChangeFocusEffect();
    return (
      <div>
        <a href="#top">some other focusable thing</a>
        <div ref={elToFocusRef} tabIndex={0} data-testid="el-to-focus" />
      </div>
    );
  };

  it('changes focus as expected', () => {
    renderWithLocalizationProvider(<Subject />);
    expect(document.activeElement).toBe(screen.getByTestId('el-to-focus'));
  });
});
