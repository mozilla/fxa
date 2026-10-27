/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { act, fireEvent, screen } from '@testing-library/react';
import FlowContainer from './index';
import { renderWithRouter } from '../../../models/mocks';

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

it('left-aligns the title by default', () => {
  renderWithRouter(<FlowContainer title="Title" />);
  expect(
    screen.getByRole('heading', { name: 'Title' }).parentElement
  ).not.toHaveClass('justify-center');
});

it('centers the title and subtitle with centerTitle', () => {
  renderWithRouter(
    <FlowContainer title="Title" subtitle="Subtitle" centerTitle />
  );
  expect(
    screen.getByRole('heading', { name: 'Title' }).parentElement
  ).toHaveClass('w-full', 'justify-center');
  expect(screen.getByRole('heading', { name: 'Subtitle' })).toHaveClass(
    'self-center'
  );
});

it('offsets the mobile back button width when centerTitle is set', () => {
  renderWithRouter(<FlowContainer title="Title" centerTitle />);
  expect(screen.getByRole('heading', { name: 'Title' })).toHaveClass(
    'pe-14',
    'tablet:pe-0'
  );
});

it('does not offset the title when the back button is hidden', () => {
  renderWithRouter(<FlowContainer title="Title" centerTitle hideBackButton />);
  expect(screen.getByRole('heading', { name: 'Title' })).not.toHaveClass(
    'pe-14'
  );
});
