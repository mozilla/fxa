/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useRef } from 'react';

import { gql, useMutation } from '@apollo/client';
import { useNavigate } from '@reach/router';
import { Localized, useLocalization } from '@fluent/react';
import { useAlertBar } from '../../lib/hooks';
import firefox from '../../lib/firefox';
import { useAccount, getNextAvatar } from '../../models';

import { HomePath } from '../../constants';
import ButtonIcon from '../ButtonIcon';

import { ReactComponent as AddIcon } from './add.svg';
import { ReactComponent as CameraIcon } from './camera.svg';
import { ReactComponent as RemoveIcon } from './remove.svg';
import { ReactComponent as ZoomOutIcon } from './zoom-out.svg';
import { ReactComponent as ZoomInIcon } from './zoom-in.svg';
import { ReactComponent as RotateIcon } from './rotate.svg';

const buttonClass = `mx-2 text-grey-500
hover:text-grey-600 hover:text-grey-600
focus:text-grey-400`;
const captureClass = `mx-2 bg-red-500 w-12 h-12 text-white rounded-full border
border-red-600 hover:bg-red-600 hover:border-red-600 active:border-red-700
focus:border-red-800`;

const editButtonClass = `mx-1 text-white rounded-full hover:bg-grey-100`;
const buttonSize = 32;

export const DELETE_AVATAR_MUTATION = gql`
  mutation deleteAvatar($input: DeleteAvatarInput!) {
    deleteAvatar(input: $input) {
      clientMutationId
    }
  }
`;

export const RemovePhotoBtn = () => {
  const navigate = useNavigate();
  const alertBar = useAlertBar();
  const { uid, avatar, primaryEmail, displayName } = useAccount();
  const { l10n } = useLocalization();

  const [deleteAvatar] = useMutation(DELETE_AVATAR_MUTATION, {
    onCompleted: () => {
      firefox.profileChanged(uid);
      navigate(HomePath, { replace: true });
    },
    onError: () => {
      alertBar.error(l10n.getString('avatar-page-delete-error-2'));
    },
    ignoreResults: true,
    update: (cache) => {
      cache.modify({
        id: cache.identify({ __typename: 'Account' }),
        fields: {
          avatar() {
            return getNextAvatar(
              undefined,
              undefined,
              primaryEmail.email,
              displayName
            );
          },
        },
      });
    },
  });

  return (
    <div
      onClick={() => {
        deleteAvatar({ variables: { input: { id: avatar.id } } });
      }}
      className="cursor-pointer flex-1"
    >
      <Localized id="avatar-page-remove-photo-button" attrs={{ title: true }}>
        <ButtonIcon
          testId="remove-photo-btn"
          title="Remove photo"
          icon={[RemoveIcon, 24, 22]}
          classNames={buttonClass}
        />
      </Localized>
      <Localized id="avatar-page-remove-photo">
        <p>Remove photo</p>
      </Localized>
    </div>
  );
};

export const TakePhotoBtn = ({
  onClick,
  capturing,
}: {
  onClick: VoidFunction;
  capturing?: boolean;
}) => {
  return (
    <div onClick={onClick} className="cursor-pointer flex-1">
      <Localized id="avatar-page-take-photo-button" attrs={{ title: true }}>
        <ButtonIcon
          testId="take-photo-btn"
          title="Take photo"
          icon={[CameraIcon, 24, 22]}
          classNames={capturing ? captureClass : buttonClass}
        />
      </Localized>
      <Localized id="avatar-page-take-photo">
        <p>Take photo</p>
      </Localized>
    </div>
  );
};

export const AddPhotoBtn = ({
  onChange,
}: {
  onChange: ((event: React.ChangeEvent<HTMLInputElement>) => void) | undefined;
}) => {
  const fileInputRef = useRef(null);
  const onFileUpload = () => {
    const fileInput: any = fileInputRef?.current;
    if (fileInput) {
      fileInput.click();
    }
  };
  const hiddenFileInput = (
    <input
      type="file"
      accept="image/png, image/jpeg"
      onChange={onChange}
      ref={fileInputRef}
      className="sr-only"
    />
  );
  return (
    <div
      onClick={onFileUpload}
      className="cursor-pointer flex-1"
      data-testid="add-photo-btn"
    >
      {hiddenFileInput}
      <Localized id="avatar-page-add-photo-button" attrs={{ title: true }}>
        <ButtonIcon
          title="Add photo"
          icon={[AddIcon, 22, 22]}
          classNames={buttonClass}
        />
      </Localized>
      <Localized id="avatar-page-add-photo">
        <p>Add photo</p>
      </Localized>
    </div>
  );
};

type ConfirmBtnsProps = {
  onSave: VoidFunction;
  saveEnabled: boolean;
  saveStringId?: string;
};

export const ConfirmBtns = ({
  onSave,
  saveEnabled,
  saveStringId = 'avatar-page-save-button',
}: ConfirmBtnsProps) => {
  const navigate = useNavigate();

  return (
    <div className="mt-4 flex items-center justify-center">
      <Localized id="avatar-page-close-button">
        <button
          className="cta-neutral mx-2 px-10"
          onClick={() => navigate(HomePath, { replace: true })}
          data-testid="close-button"
        >
          Close
        </button>
      </Localized>
      <Localized id={saveStringId}>
        <button
          className="cta-primary mx-2 px-10"
          onClick={onSave}
          disabled={!saveEnabled}
          data-testid="save-button"
        ></button>
      </Localized>
    </div>
  );
};

export const ZoomOutBtn = ({ onClick }: { onClick: VoidFunction }) => {
  return (
    <Localized id="avatar-page-zoom-out-button" attrs={{ title: true }}>
      <ButtonIcon
        testId="zoom-out-btn"
        title="Zoom Out"
        icon={[ZoomOutIcon, buttonSize, buttonSize]}
        onClick={onClick}
        classNames={editButtonClass}
      />
    </Localized>
  );
};

export const ZoomInBtn = ({ onClick }: { onClick: VoidFunction }) => {
  return (
    <Localized id="avatar-page-zoom-in-button" attrs={{ title: true }}>
      <ButtonIcon
        testId="zoom-in-btn"
        title="Zoom In"
        icon={[ZoomInIcon, buttonSize, buttonSize]}
        onClick={onClick}
        classNames={editButtonClass}
      />
    </Localized>
  );
};

export const RotateBtn = ({ onClick }: { onClick: VoidFunction }) => {
  return (
    <Localized id="avatar-page-rotate-button" attrs={{ title: true }}>
      <ButtonIcon
        testId="rotate-btn"
        title="Rotate"
        icon={[RotateIcon, buttonSize, buttonSize]}
        onClick={onClick}
        classNames={editButtonClass}
      />
    </Localized>
  );
};
