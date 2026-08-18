/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { fireEvent } from '@testing-library/react';
import { useEscKeydownEffect } from '.';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';

describe('useEscKeydownEffect', () => {
  const onEscKeydown = jest.fn();
  const Subject = () => {
    useEscKeydownEffect(onEscKeydown);
    return <div>Hi mom</div>;
  };
  it('calls onEscKeydown on esc key press', () => {
    renderWithLocalizationProvider(<Subject />);
    expect(onEscKeydown).not.toHaveBeenCalled();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onEscKeydown).toHaveBeenCalled();
  });
});
