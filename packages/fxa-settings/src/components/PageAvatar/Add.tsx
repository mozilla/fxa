/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useAlertBar } from '../../lib/hooks';
import React from 'react';
import { RouteComponentProps, useNavigate } from '@reach/router';

import AlertBar from '../AlertBar';
import Avatar from '../Avatar';
// import AvatarCropper from '../AvatarCropper';
import ButtonIcon from '../ButtonIcon';
import FlowContainer from '../FlowContainer';
import { ReactComponent as AddIcon } from './add.svg';
import { ReactComponent as CameraIcon } from './camera.svg';
import { CapturePath, HomePath } from '../../constants';

function save() {
  console.log('save avatar');
}

export const PageAddAvatar = (_: RouteComponentProps) => {
  const navigate = useNavigate();
  // const account = useAccount();
  const alertBar = useAlertBar();
  // const [errorText, setErrorText] = useState<string>();
  // const [saveEnabled, setSaveEnabled] = useState<boolean>();
  const handleSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
  };

  return (
    <FlowContainer title="Avatar">
      {alertBar.visible && (
        <AlertBar onDismiss={alertBar.hide} type={alertBar.type}>
          <p data-testid="update-avatar-error">{alertBar.content}</p>
        </AlertBar>
      )}

      <form onSubmit={handleSubmit}>
        <Avatar className="mx-auto w-32" />

        <div className="flex text-center justify-around max-w-xs my-4 mx-24">
          <div className="cursor-pointer">
            <ButtonIcon
              title="Add photo"
              icon={[AddIcon, 22, 22]}
              classNames="mx-2 text-grey-500 hover:text-grey-600 hover:text-grey-600 focus:text-grey-400"
            />
            <p>Add Photo</p>
          </div>
          <div onClick={() => navigate(CapturePath)} className="cursor-pointer">
            <ButtonIcon
              title="Take photo"
              icon={[CameraIcon, 24, 22]}
              classNames="mx-2 text-grey-500 hover:text-grey-600 hover:text-grey-600 focus:text-grey-400"
            />
            <p>Take Photo</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-center">
          <button
            className="cta-neutral mx-2 px-10"
            onClick={() => navigate(HomePath, { replace: true })}
            data-testid="close-button"
          >
            Close
          </button>
          <button
            className="cta-primary mx-2 px-10"
            onClick={() => save()}
            disabled={true}
            data-testid="save-button"
          >
            Save
          </button>
        </div>
      </form>
    </FlowContainer>
  );
};

export default PageAddAvatar;
