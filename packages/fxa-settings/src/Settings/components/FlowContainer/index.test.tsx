/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { fireEvent, screen } from '@testing-library/react';
import FlowContainer from './index';
import { renderWithRouter } from '../../../models/mocks';
import { act } from 'react-dom/test-utils';

it('renders', async () => {
  renderWithRouter(<FlowContainer />);
  expect(screen.getByTestId('flow-container')).toBeInTheDocument();
  expect(screen.getByTestId('flow-container-back-btn')).toBeInTheDocument();
});

it('calls the given on back button click handler', async () => {
  const cb = jest.fn();
  renderWithRouter(<FlowContainer onBackButtonClick={cb} />);
  await act(async () => {
    fireEvent.click(screen.getByTestId('flow-container-back-btn'));
  });
  expect(cb).toBeCalledTimes(1);
});
