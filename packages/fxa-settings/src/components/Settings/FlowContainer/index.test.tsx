/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { act, fireEvent, screen } from '@testing-library/react';
import FlowContainer from './index';
import { renderWithRouter } from '../../../models/mocks';
import AppLayout from '../../AppLayout';

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
  expect(cb).toHaveBeenCalledTimes(1);
});

it('sets the page title from its title outside AppLayout', () => {
  renderWithRouter(<FlowContainer title="Flow Title" />);
  expect(document.title).toBe('Flow Title – Mozilla accounts');
});

it('leaves the page title to AppLayout', () => {
  renderWithRouter(
    <AppLayout title="Page Title" wrapInCard={false}>
      <FlowContainer title="Flow Title" />
    </AppLayout>
  );
  expect(document.title).toBe('Page Title – Mozilla accounts');
});
