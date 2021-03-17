import { ChangeEvent } from 'react';

function readFile(
  file: Blob,
  onError: Function
): Promise<string | ArrayBuffer | null> {
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
  onError: Function
) => {
  if (evt.target.files && evt.target.files.length > 0) {
    const file = evt.target.files[0];
    let imageDataUrl = await readFile(file, onError);
    onSuccess(imageDataUrl);
  }
};
