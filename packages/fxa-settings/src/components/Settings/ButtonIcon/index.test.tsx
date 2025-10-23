/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import ButtonIcon, { ButtonIconReload, ButtonIconTrash } from './index';
import { ReactComponent as TrashIcon } from './trash-icon.svg';

it('can render with props', () => {
  renderWithLocalizationProvider(
    <ButtonIcon
      testId="test-button"
      title="Test Icon"
      classNames="ml-2"
      disabled={true}
      icon={[TrashIcon, 10, 15]}
    />
  );

  const button = screen.getByTestId('test-button');
  expect(button).toBeInTheDocument();
  expect(button).toHaveClass('ml-2');
  expect(button).toBeDisabled();
  expect(button).toHaveProperty('title', 'Test Icon');
  expect(button.innerHTML).toEqual(
    '<svg width="10" height="15" class="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 fill-current" aria-label="Test Icon">trash-icon.svg</svg>'
  );
});

it('can render premade buttons', () => {
  renderWithLocalizationProvider(
    <>
      <ButtonIconTrash title="Remove email" testId="remove-button" />
      <ButtonIconReload title="Reload email" testId="reload-button" />
    </>
  );
  expect(screen.getByTestId('remove-button')).toBeInTheDocument();
  expect(screen.getByTestId('reload-button')).toBeInTheDocument();
});
