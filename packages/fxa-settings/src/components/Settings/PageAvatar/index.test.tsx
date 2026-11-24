/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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
import GleanMetrics from '../../../lib/glean';

jest.mock('fxa-settings/src/lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
  settingsViewName: 'quuz',
}));

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    accountPref: { avatarView: jest.fn(), avatarUploadSuccess: jest.fn() },
  },
}));

// jsdom loads no image, so the real cropper never reports a crop area.
jest.mock('react-easy-crop', () => ({
  __esModule: true,
  default: function MockCropper({
    image,
    onCropComplete,
  }: {
    image?: string;
    onCropComplete: Function;
  }) {
    const React = jest.requireActual('react');
    React.useEffect(() => {
      const area = { x: 0, y: 0, width: 1, height: 1 };
      onCropComplete(area, area);
    }, [image, onCropComplete]);
    return null;
  },
}));

// jsdom's FileReader can outlast waitFor's timeout under load.
jest.mock('../../../lib/file-utils', () => ({
  onFileChange: (_evt: unknown, onSuccess: Function) =>
    onSuccess('data:image/png;base64,aW1hZ2U='),
}));

jest.mock('../../../lib/canvas-utils', () => ({
  getCroppedImg: jest.fn().mockResolvedValue(new Blob(['image'])),
}));

const account = {
  avatar: { url: null, id: null },
} as unknown as Account;

beforeEach(() => {
  jest.clearAllMocks();
});

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
  expect(GleanMetrics.accountPref.avatarView).toHaveBeenCalledTimes(1);
});

async function uploadAndSave(uploadAvatar: jest.Mock) {
  const user = userEvent.setup();
  renderWithRouter(
    <AppContext.Provider
      value={mockAppContext({
        account: { ...account, uploadAvatar } as unknown as Account,
      })}
    >
      <PageAvatar />
    </AppContext.Provider>
  );
  await user.upload(
    screen.getByTestId('avatar-image-upload-input'),
    new File(['image'], 'avatar.png', { type: 'image/png' })
  );
  const saveButton = screen.getByTestId('save-button');
  await waitFor(() => expect(saveButton).toBeEnabled());
  await user.click(saveButton);
  await waitFor(() => expect(uploadAvatar).toHaveBeenCalledTimes(1));
}

it('PageAddAvatar | records avatar_upload_success after the upload succeeds', async () => {
  await uploadAndSave(jest.fn().mockResolvedValue(undefined));
  await waitFor(() =>
    expect(GleanMetrics.accountPref.avatarUploadSuccess).toHaveBeenCalledTimes(
      1
    )
  );
});

it('PageAddAvatar | records no avatar_upload_success when the upload fails', async () => {
  await uploadAndSave(jest.fn().mockRejectedValue(new Error('upload failed')));
  expect(GleanMetrics.accountPref.avatarUploadSuccess).not.toHaveBeenCalled();
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
  expect(onSave).toHaveBeenCalled();
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
  expect(onClick).toHaveBeenCalled();
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
  expect(zoomOut).toHaveBeenCalled();

  const zoomInBtn = screen.getByTestId('zoom-in-btn');
  await act(async () => {
    fireEvent.click(zoomInBtn);
  });
  expect(zoomIn).toHaveBeenCalled();
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
  expect(onClick).toHaveBeenCalled();
});

it('PageAddAvatar | reflects zoom changes from the slider and the zoom buttons', async () => {
  const user = userEvent.setup();
  renderWithRouter(
    <AppContext.Provider value={mockAppContext({ account })}>
      <PageAvatar />
    </AppContext.Provider>
  );

  await user.upload(
    screen.getByTestId('avatar-image-upload-input'),
    new File(['image'], 'avatar.png', { type: 'image/png' })
  );

  const slider = await screen.findByRole('slider', { name: 'zoom-slider' });
  expect(slider).toHaveValue('1');

  await user.click(screen.getByTestId('zoom-in-btn'));
  expect(slider).toHaveValue('1.1');

  // jsdom has no default action for a range input, so a drag or an arrow key
  // cannot move the thumb.
  fireEvent.change(slider, { target: { value: '2.5' } });
  expect(slider).toHaveValue('2.5');
});
