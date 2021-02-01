import { ChangeEvent } from 'react';
import { getOrientation } from 'get-orientation/browser';

import { getRotatedImage } from './canvas-utils';

const ORIENTATION_TO_ANGLE = {
  '3': 180,
  '6': 90,
  '8': -90,
};

function readFile(file: Blob, onError: Function): Promise<string | ArrayBuffer | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result), false);
    reader.addEventListener('error', (err) => onError(err));
    reader.readAsDataURL(file);
  });
}

export const onFileChange = async (
  evt: ChangeEvent<HTMLInputElement>,
  onSuccess: Function,
  onError: Function,
) => {
  if (evt.target.files && evt.target.files.length > 0) {
    const file = evt.target.files[0];
    let imageDataUrl = await readFile(file, onError);

    // apply rotation if needed
    const orientation = await getOrientation(file);
    // @ts-ignore
    const rotation = ORIENTATION_TO_ANGLE[orientation];
    if (rotation) {
      imageDataUrl = await getRotatedImage(imageDataUrl, rotation);
    }

    onSuccess(imageDataUrl);
  }
};
