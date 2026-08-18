/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useRef } from 'react';
import { useFocusOnTriggeringElementOnClose } from '.';
import {
  renderWithLocalizationProvider,
  withLocalizationProvider,
} from 'fxa-react/lib/test-utils/localizationProvider';

describe('useFocusOnTriggeringElementOnClose', () => {
  const Subject = ({
    revealed,
    triggerException,
  }: {
    revealed?: boolean;
    triggerException?: boolean | undefined;
  }) => {
    const triggerElement = useRef<HTMLButtonElement>(null);
    useFocusOnTriggeringElementOnClose(
      revealed,
      triggerElement,
      triggerException
    );

    return (
      <button ref={triggerElement} data-testid="trigger-element">
        Hi
      </button>
    );
  };

  it('changes focus as expected', () => {
    const { rerender, getByTestId } = renderWithLocalizationProvider(
      <Subject revealed />
    );
    rerender(withLocalizationProvider(<Subject revealed={false} />));

    expect(document.activeElement).toBe(getByTestId('trigger-element'));
  });

  it('does nothing if `revealed` is not passed in', () => {
    const { rerender, getByTestId } = renderWithLocalizationProvider(
      <Subject />
    );
    rerender(withLocalizationProvider(<Subject />));

    expect(document.activeElement).not.toBe(getByTestId('trigger-element'));
  });

  it('does nothing if `triggerException` is truthy', () => {
    const { rerender, getByTestId } = renderWithLocalizationProvider(
      <Subject triggerException />
    );
    rerender(withLocalizationProvider(<Subject />));

    expect(document.activeElement).not.toBe(getByTestId('trigger-element'));
  });
});
