/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { act, fireEvent, screen } from '@testing-library/react';

import { Account, AppContext } from '../../../models';
import { mockAppContext, renderWithRouter } from '../../../models/mocks';

import PageAvatar from '.';
import {
  AddPhotoBtn,
  ConfirmBtns,
  RotateBtn,
  TakePhotoBtn,
  ZoomInBtn,
  ZoomOutBtn,
} from './buttons';
import { usePageViewEvent } from '../../../lib/metrics';

jest.mock('fxa-settings/src/lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
  settingsViewName: 'quuz',
}));

const account = {
  avatar: { url: null, id: null },
} as unknown as Account;

it('PageAvatar | renders', async () => {
  renderWithRouter(
    <AppContext.Provider value={mockAppContext({ account })}>
      <PageAvatar />
    </AppContext.Provider>
  );
  expect(screen.getByTestId('flow-container')).toBeInTheDocument();
  expect(screen.getByTestId('flow-container-back-btn')).toBeInTheDocument();
});

it('PageAvatar | emits a metrics event on render', async () => {
  renderWithRouter(
    <AppContext.Provider value={mockAppContext({ account })}>
      <PageAvatar />
    </AppContext.Provider>
  );
  expect(usePageViewEvent).toHaveBeenCalledWith('settings.avatar.change');
});

it('PageAddAvatar | render add, take buttons on initial load', async () => {
  renderWithRouter(
    <AppContext.Provider value={mockAppContext({ account })}>
      <PageAvatar />
    </AppContext.Provider>
  );

  screen.getByText('Save');
  expect(screen.getByTestId('add-photo-btn')).toBeInTheDocument();
  expect(screen.getByTestId('take-photo-btn')).toBeInTheDocument();
});

it('PageAddAvatar | render remove button if avatar is set', async () => {
  renderWithRouter(
    <AppContext.Provider value={mockAppContext({ account })}>
      <PageAvatar />
    </AppContext.Provider>
  );
  expect(screen.getByTestId('remove-photo-btn')).toBeInTheDocument();
});

it('PageAddAvatar | renders AddPhotoBtn and calls onchange correctly', async () => {
  renderWithRouter(<AddPhotoBtn onChange={() => {}} />);

  expect(screen.getByTestId('add-photo-btn')).toBeInTheDocument();
});

it('PageAddAvatar | renders ConfirmBtns and calls onsave correctly', async () => {
  const onSave = jest.fn();
  renderWithRouter(
    <AppContext.Provider value={mockAppContext({ account })}>
      <ConfirmBtns
        onSave={onSave}
        saveEnabled={true}
        localizedSaveText="Save"
      />
    </AppContext.Provider>
  );

  expect(screen.getByTestId('close-button')).toBeInTheDocument();
  expect(screen.getByTestId('save-button')).toBeInTheDocument();

  const saveBtn = screen.getByTestId('save-button');
  await act(async () => {
    fireEvent.click(saveBtn);
  });
  expect(onSave).toBeCalled();
});

it('PageAddAvatar | renders ConfirmBtns with save button disabled when "enabled" option is false', async () => {
  const onSave = jest.fn();
  renderWithRouter(
    <AppContext.Provider value={mockAppContext({ account })}>
      <ConfirmBtns
        onSave={onSave}
        saveEnabled={false}
        localizedSaveText="Save"
      />
    </AppContext.Provider>
  );

  expect(screen.getByTestId('save-button')).toBeDisabled();
});

it('PageAddAvatar | renders TakePhotoBtn and calls onclick correctly', async () => {
  const onClick = jest.fn();
  renderWithRouter(
    <AppContext.Provider value={mockAppContext({ account })}>
      <TakePhotoBtn onClick={onClick} capturing={false} />
    </AppContext.Provider>
  );

  expect(screen.getByTestId('take-photo-btn')).toBeInTheDocument();

  const takePhotoBtn = screen.getByTestId('take-photo-btn');
  await act(async () => {
    fireEvent.click(takePhotoBtn);
  });
  expect(onClick).toBeCalled();
});

it('PageAddAvatar | renders TakePhotoBtn and renders correctly when passed "capturing" option', async () => {
  const onClick = jest.fn();
  renderWithRouter(
    <AppContext.Provider value={mockAppContext({ account })}>
      <TakePhotoBtn onClick={onClick} capturing={true} />
    </AppContext.Provider>
  );

  expect(screen.getByTestId('take-photo-btn-capturing')).toHaveClass(
    'bg-red-500'
  );
});

it('PageAddAvatar | renders ZoomBtns and calls onclick correctly', async () => {
  const zoomOut = jest.fn();
  const zoomIn = jest.fn();
  renderWithRouter(
    <AppContext.Provider value={mockAppContext({ account })}>
      <>
        <ZoomOutBtn onClick={zoomOut} />
        <ZoomInBtn onClick={zoomIn} />
      </>
    </AppContext.Provider>
  );

  expect(screen.getByTestId('zoom-out-btn')).toBeInTheDocument();
  expect(screen.getByTestId('zoom-in-btn')).toBeInTheDocument();

  const zoomOutBtn = screen.getByTestId('zoom-out-btn');
  await act(async () => {
    fireEvent.click(zoomOutBtn);
  });
  expect(zoomOut).toBeCalled();

  const zoomInBtn = screen.getByTestId('zoom-in-btn');
  await act(async () => {
    fireEvent.click(zoomInBtn);
  });
  expect(zoomIn).toBeCalled();
});

it('PageAddAvatar | renders rotateBtn and calls onclick correctly', async () => {
  const onClick = jest.fn();
  renderWithRouter(
    <AppContext.Provider value={mockAppContext({ account })}>
      <RotateBtn onClick={onClick} />
    </AppContext.Provider>
  );

  expect(screen.getByTestId('rotate-btn')).toBeInTheDocument();

  const rotateBtn = screen.getByTestId('rotate-btn');
  await act(async () => {
    fireEvent.click(rotateBtn);
  });
  expect(onClick).toBeCalled();
});
