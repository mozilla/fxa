/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Slider } from '@material-ui/core';

import ButtonIcon from '../ButtonIcon';

import { ReactComponent as ZoomOutIcon } from './zoom-out.svg';
import { ReactComponent as ZoomInIcon } from './zoom-in.svg';
import { ReactComponent as RotateIcon } from './rotate.svg';

const buttonClass = `mx-1 text-white rounded-full hover:bg-grey-100`;
const buttonSize = 32;

type AvatarCropperProps = {
  src: string | undefined;
};

export const AvatarCropper = ({ src }: AvatarCropperProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
  }, [])

  const handleSliderChange = (
    event: React.SyntheticEvent<Element, Event>,
    value: number | number[]
  ) => {
    // @ts-ignore
    setZoom(value);
  };

  return (
    <div className="AvatarCropper flex flex-col">
      <div className="relative w-64 h-48 mx-auto my-4">
        <Cropper
          image={src}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          showGrid={false}
          cropShape="round"
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
          cropSize={{ width: 160, height: 160 }}
          style={{ containerStyle: {borderRadius: '8px'}, }}
        />
      </div>
      <div className="flex justify-center m-2">
        <ButtonIcon
          testId="zoom-out-btn"
          title="Zoom Out"
          icon={[ZoomOutIcon, buttonSize, buttonSize]}
          onClick={() => {
            if (zoom === 1) return;
            setZoom(zoom - 0.1);
          }}
          classNames={buttonClass}
        />
        <div className="w-32 mx-2">
          <Slider
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            className={'w-100'}
            aria-label="zoom-slider"
            component={'span'}
            onChange={handleSliderChange}
          />
        </div>
        <ButtonIcon
          testId="zoom-in-btn"
          title="Zoom In"
          icon={[ZoomInIcon, buttonSize, buttonSize]}
          onClick={() => {
            setZoom(zoom + 0.1);
          }}
          classNames={buttonClass}
        />
        <ButtonIcon
        testId="rotate-btn"
          title="Rotate"
          icon={[RotateIcon, buttonSize, buttonSize]}
          onClick={() => {
            if (rotation < 315) {
              setRotation(rotation + 45);
            } else {
              setRotation(0);
            }
          }}
          classNames={buttonClass}
        />
      </div>
    </div>
  );
};

export default AvatarCropper;
