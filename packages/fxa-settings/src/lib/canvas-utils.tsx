// from https://ricardo-ch.github.io/react-easy-crop/
const createImage = (
  url: string | ArrayBuffer | null
): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    // @ts-ignore
    image.src = url;
  });

function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

/**
 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
 * @param {File} image - Image File url
 * @param {Object} pixelCrop - pixelCrop Object provided by react-easy-crop
 * @param {number} rotation - optional rotation parameter
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { width: number; height: number; x: number; y: number },
  rotation = 0
): Promise<Blob | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return null;
  }

  canvas.width = 160;
  canvas.height = 160;
  const xCenterCanvas = Math.floor(canvas.width / 2);
  const yCenterCanvas = Math.floor(canvas.height / 2);

  const radians = getRadianAngle(rotation);

  ctx.translate(xCenterCanvas, yCenterCanvas);
  ctx.rotate(radians);
  ctx.translate(-xCenterCanvas, -yCenterCanvas);

  // pixelCrop x,y are post-rotation coordinates
  // rotate pixelCrop x,y back to the 0 rotation of the source image
  const xCenterImage = Math.floor(image.width / 2);
  const yCenterImage = Math.floor(image.height / 2);
  const rx =
    (pixelCrop.x - xCenterImage) * Math.trunc(Math.cos(-radians)) -
    (pixelCrop.y - yCenterImage) * Math.trunc(Math.sin(-radians)) +
    xCenterImage;
  const ry =
    (pixelCrop.x - xCenterImage) * Math.trunc(Math.sin(-radians)) +
    (pixelCrop.y - yCenterImage) * Math.trunc(Math.cos(-radians)) +
    yCenterImage;

  // find the top-left corner of the crop area
  let left = pixelCrop.x;
  let top = pixelCrop.y;
  if (rotation === 90) {
    left = rx;
    top = ry - pixelCrop.height;
  } else if (rotation === 180) {
    left = rx - pixelCrop.width;
    top = ry - pixelCrop.height;
  } else if (rotation === 270) {
    left = rx - pixelCrop.width;
    top = ry;
  }

  ctx.drawImage(
    image,
    left,
    top,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(blob);
      },
      'image/jpeg',
      0.8
    );
  });
}

export async function getRotatedImage(
  imageSrc: string | ArrayBuffer | null,
  rotation = 0
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const orientationChanged =
    rotation === 90 ||
    rotation === -90 ||
    rotation === 270 ||
    rotation === -270;
  if (orientationChanged) {
    canvas.width = image.height;
    canvas.height = image.width;
  } else {
    canvas.width = image.width;
    canvas.height = image.height;
  }

  if (ctx !== null) {
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(image, -image.width / 2, -image.height / 2);
  }

  return new Promise((resolve) => {
    canvas.toBlob((file) => {
      resolve(URL.createObjectURL(file));
    }, 'image/jpeg');
  });
}
