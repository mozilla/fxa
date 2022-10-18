/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ReactComponent as TrashIcon } from './trash-icon.svg';
import ButtonIcon, { ButtonIconTrash, ButtonIconReload } from './index';

it('can render with props', () => {
  render(
    <ButtonIcon
      testId="test-button"
      title="Hello"
      classNames="ml-2"
      disabled={true}
      icon={[TrashIcon, 10, 15]}
    />
  );

  const button = screen.getByTestId('test-button');
  expect(button).toBeInTheDocument();
  expect(button).toHaveClass('ml-2');
  expect(button).toBeDisabled();
  expect(button).toHaveProperty('title', 'Hello');
  expect(button.innerHTML).toEqual(
    '<svg width="10" height="15" class="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 fill-current">trash-icon.svg</svg>'
  );
});

it('can render premade buttons', () => {
  render(
    <>
      <ButtonIconTrash title="Remove email" testId="remove-button" />
      <ButtonIconReload title="Reload email" testId="reload-button" />
    </>
  );
  expect(screen.getByTestId('remove-button')).toBeInTheDocument();
  expect(screen.getByTestId('reload-button')).toBeInTheDocument();
});
