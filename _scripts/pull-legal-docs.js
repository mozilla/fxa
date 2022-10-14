const fs = require('fs').promises;
const path = require('path');

const PDF_FOLDER = 'pdf';
const PDF_EXTENSIONS = '.pdf';
const DEFAULT_SOURCE_DIRECTORY = './default/source/';
const DEFAULT_TARGET_DIRECTORY = './default/target/';

let targetDirectory = '';
let sourceDirectory = '';
let copyCount = 0;

function buildLocalePdfName(filename, currentPath) {
  const locale = path.basename(path.dirname(currentPath));
  const fileOnly = path.basename(filename, PDF_EXTENSIONS);

  return path.join(`${fileOnly}.${locale}${PDF_EXTENSIONS}`);
}

async function checkDir(currentPath) {
  return (await fs.stat(currentPath)).isDirectory();
}

async function copyPdfToTarget(currentPath) {
  const files = await fs.readdir(currentPath);

  for (const file of files) {
    if (path.extname(file) === PDF_EXTENSIONS) {
      await fs.cp(
        path.join(currentPath, file),
        path.join(targetDirectory, buildLocalePdfName(file, currentPath))
      );
      copyCount++;
    }
  }
}

async function findAndCopyPdfs(currentPath) {
  const validDir = await checkDir(currentPath);
  if (validDir) {
    if (path.basename(currentPath) === PDF_FOLDER) {
      return copyPdfToTarget(currentPath);
    }
    const files = await fs.readdir(currentPath);
    for (const file of files) {
      await findAndCopyPdfs(path.join(currentPath, file));
    }
  }
}

async function init() {
  const myArgs = process.argv.slice(2);

  sourceDirectory = path.normalize(myArgs[0] || DEFAULT_SOURCE_DIRECTORY);
  targetDirectory = path.normalize(myArgs[1] || DEFAULT_TARGET_DIRECTORY);

  try {
    await checkDir(targetDirectory);
  } catch (err) {
    throw new Error(
      `The provided target directory does not exists. (${targetDirectory})`
    );
  }
  try {
    await checkDir(sourceDirectory);
  } catch (err) {
    throw new Error(
      `The provided source directory does not exists. (${sourceDirectory})`
    );
  }

  console.log(
    `Start - Find and copy all pdfs in "${sourceDirectory}" to "${targetDirectory}"`
  );
  await findAndCopyPdfs(sourceDirectory);
  console.log(`End - ${copyCount} PDFs were copied.`);
}

if (require.main === module) {
  init()
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .then((result) => process.exit(result));
}
