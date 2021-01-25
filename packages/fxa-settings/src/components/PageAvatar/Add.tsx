/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useRef, useState } from 'react';
import { RouteComponentProps, useNavigate } from '@reach/router';
import { Localized, useLocalization } from '@fluent/react';
import { useAlertBar } from '../../lib/hooks';
import { onFileChange } from '../../lib/file-utils';
import { CapturePath, HomePath } from '../../constants';
import { useAccount } from '../../models';
import AlertBar from '../AlertBar';
import Avatar from '../Avatar';
import AvatarCropper from '../AvatarCropper';
import ButtonIcon from '../ButtonIcon';
import FlowContainer from '../FlowContainer';
import { ReactComponent as AddIcon } from './add.svg';
import { ReactComponent as CameraIcon } from './camera.svg';
import { ReactComponent as RemoveIcon } from './remove.svg';

const buttonClass = `mx-2 text-grey-500
hover:text-grey-600 hover:text-grey-600
focus:text-grey-400`;

function remove() {
  console.log('remove avatar');
}

export const PageAddAvatar = (_: RouteComponentProps) => {
  const navigate = useNavigate();
  const { l10n } = useLocalization();
  const { avatarUrl } = useAccount();
  const fileInputRef = useRef(null);
  const alertBar = useAlertBar();
  // const [saveEnabled, setSaveEnabled] = useState<boolean>();
  const [imageSrc, setImageSrc] = useState(undefined);
  const handleSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
  };

  function onFileError() {
    alertBar.error(l10n.getString('avatar-page-file-upload-error'));
  }

  function save() {
    if (imageSrc) {
      console.log('save avatar');
    } else {
      console.log('need to set avatar here.');
    }
  }

  const onFileUpload = () => {
    const fileInput: any = fileInputRef?.current;
    if (fileInput) {
      fileInput.click();
    }
  };

  const hiddenFileInput = (
    <input
      type="file"
      onChange={(event) => {
        onFileChange(event, setImageSrc, onFileError);
      }}
      ref={fileInputRef}
      className="sr-only"
    />
  );
  const confirmBtns = (
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
      <Localized id="avatar-page-save-button">
        <button
          className="cta-primary mx-2 px-10"
          onClick={save}
          disabled={true}
          data-testid="save-button"
        >
          Save
        </button>
      </Localized>
    </div>
  );
  return (
    <Localized id="avatar-page-title" attrs={{ title: true }}>
      <FlowContainer title="Avatar">
        {/* TODO - localize the error message once errors are implemented */}
        {alertBar.visible && (
          <AlertBar onDismiss={alertBar.hide} type={alertBar.type}>
            <p data-testid="update-avatar-error">{alertBar.content}</p>
          </AlertBar>
        )}
        <form onSubmit={handleSubmit}>
          {imageSrc ? (
            <>
              <AvatarCropper src={imageSrc} />
              {confirmBtns}
            </>
          ) : (
            <>
              <Avatar className="mx-auto w-32" />
<<<<<<< HEAD
              <div className="flex text-center text-xs justify-around max-w-xs my-4 mx-12 mobileLandscape:mx-24">
                <div onClick={onFileUpload} className="cursor-pointer flex-1">
=======
              <div className="flex text-center justify-around max-w-xs my-4 mx-12 mobileLandscape:mx-24">
                <div onClick={onFileUpload} className="cursor-pointer">
>>>>>>> feat(fxa-settings): upload and edit avatar
                  {hiddenFileInput}
                  <Localized
                    id="avatar-page-add-photo-button"
                    attrs={{ title: true }}
                  >
                    <ButtonIcon
                      testId="add-photo-btn"
                      title="Add photo"
                      icon={[AddIcon, 22, 22]}
                      classNames={buttonClass}
                    />
                  </Localized>
                  <Localized id="avatar-page-add-photo">
                    <p>Add Photo</p>
                  </Localized>
                </div>
                <div
                  onClick={() => navigate(CapturePath)}
<<<<<<< HEAD
                  className="cursor-pointer flex-1"
=======
                  className="cursor-pointer"
>>>>>>> feat(fxa-settings): upload and edit avatar
                >
                  <Localized
                    id="avatar-page-take-photo-button"
                    attrs={{ title: true }}
                  >
                    <ButtonIcon
                      testId="take-photo-btn"
                      title="Take photo"
                      icon={[CameraIcon, 24, 22]}
                      classNames={buttonClass}
                    />
                  </Localized>
                  <Localized id="avatar-page-take-photo">
                    <p>Take Photo</p>
                  </Localized>
                </div>
                {avatarUrl && (
<<<<<<< HEAD
                  <div onClick={remove} className="cursor-pointer flex-1">
=======
                  <div onClick={remove} className="cursor-pointer">
>>>>>>> feat(fxa-settings): upload and edit avatar
                    <Localized
                      id="avatar-page-remove-photo-button"
                      attrs={{ title: true }}
                    >
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
                )}
              </div>
              {confirmBtns}
            </>
          )}
        </form>
      </FlowContainer>
    </Localized>
  );
};

export default PageAddAvatar;
