/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useAlertBar } from '../../lib/hooks';
import React, { useRef, useState, useCallback } from 'react';
import { Localized } from '@fluent/react';
import { RouteComponentProps, useNavigate } from '@reach/router';
import Webcam from 'react-webcam';

import LoadingSpinner from 'fxa-react/components/LoadingSpinner';

import { HomePath } from '../../constants';
import Avatar from '../Avatar';
import AlertBar from '../AlertBar';
import ButtonIcon from '../ButtonIcon';
import FlowContainer from '../FlowContainer';
import { ReactComponent as CameraIcon } from './camera.svg';

function save() {
  console.log('save avatar');
}

export const PageCaptureAvatar = (_: RouteComponentProps) => {
  const navigate = useNavigate();
  const alertBar = useAlertBar();
  const handleSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
  };

  const webcamRef = useRef<Webcam>(null);
  const [imgSrc, setImgSrc] = useState<null | string>(null);
  const [camLoaded, setCamLoaded] = useState(false);
  const [showMediaError, setShowMediaError] = useState(false);

  const capture = useCallback(() => {
    const webcam: any = webcamRef?.current;
    const imageSrc = webcam.getScreenshot();
    setImgSrc(imageSrc);
  }, [webcamRef, setImgSrc]);

  const onMediaLoad = useCallback(() => {
    setTimeout(() => {
      setCamLoaded(true);
    }, 400);
  }, [setCamLoaded]);

  const frameClass = `rounded-full m-auto w-32 object-cover`;
  const retakeClass = `mx-2 text-grey-500 hover:text-grey-600 hover:text-grey-600 focus:text-grey-400`;
  const captureClass = `mx-2 bg-red-500 w-12 h-12 text-white rounded-full border
  border-red-600 hover:bg-red-600 hover:border-red-600 active:border-red-700
  focus:border-red-800`;

  return (
    <FlowContainer title="Avatar">
      {alertBar.visible && (
        <AlertBar onDismiss={alertBar.hide} type={alertBar.type}>
          <p data-testid="update-avatar-error">{alertBar.content}</p>
        </AlertBar>
      )}

      <form onSubmit={handleSubmit}>
        <div className="p-2">
          {showMediaError && <Avatar className="mx-auto w-32" />}
          {imgSrc ? (
            <Localized id="avatar-page-new-avatar" attrs={{ alt: true }}>
              <img
                src={imgSrc}
                className={`${frameClass} h-32`}
                alt="new avatar"
              />
            </Localized>
          ) : (
            <>
              <LoadingSpinner
                className={`bg-grey-20 flex items-center flex-col justify-center select-none ${
                  camLoaded || showMediaError ? 'invisible h-0' : 'visible h-32'
                }`}
              />
              <Webcam
                className={`${frameClass} ${
                  camLoaded ? 'visible h-32' : 'invisible h-0'
                }`}
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/png"
                screenshotQuality={1}
                onUserMedia={onMediaLoad}
                onUserMediaError={(err) => {
                  setShowMediaError(true);
                }}
              />
            </>
          )}
        </div>
        {showMediaError && (
          <Localized id="avatar-page-camera-error">
            <div className="text-white bg-red-500 rounded font-bold text-sm text-center px-8 py-2 mt-8">
              Could not initialize camera
            </div>
          </Localized>
        )}
        <div className="flex text-center justify-center max-w-xs my-4 mx-24">
          {!showMediaError && (
            <div className="cursor-pointer">
              <Localized
                id="avatar-page-take-photo-button"
                attrs={{ title: true }}
              >
                <ButtonIcon
                  testId="shutter"
                  title="Take photo"
                  onClick={() => {
                    if (imgSrc) {
                      setImgSrc(null);
                      setCamLoaded(false);
                    } else capture();
                  }}
                  icon={[CameraIcon, 24, 22]}
                  classNames={imgSrc ? retakeClass : captureClass}
                />
              </Localized>
              {imgSrc ? (
                <Localized id="avatar-page-retake-photo">
                  <p>Retake Photo</p>
                </Localized>
              ) : (
                <Localized id="avatar-page-take-photo">
                  <p>Take Photo</p>
                </Localized>
              )}
            </div>
          )}
        </div>
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
              disabled={!imgSrc}
              onClick={() => save()}
              data-testid="save-button"
            >
              Save
            </button>
          </Localized>
        </div>
      </form>
    </FlowContainer>
  );
};

export default PageCaptureAvatar;
