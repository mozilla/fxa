const { readdirSync, readFileSync, statSync } = require('fs');
const { resolve } = require('path');

const FXA_REACT_IMPORT_REGEX = /import(?:["'\s]*[\w*{}\n\r\t, ]+from\s*)?["'\s].*(fxa-react\/components\/[\w\/.]+)["'\s].*$/gm;

function eligibleFile(file) {
  return (
    ['.jsx', '.tsx', '.js', '.ts'].some((ext) => file.endsWith(ext)) &&
    !file.includes('.test')
  );
}

function getExtractableFiles(dir) {
  const subdirs = readdirSync(dir);
  return subdirs
    .flatMap((subdir) => {
      const res = resolve(dir, subdir);
      return statSync(res).isDirectory() ? getExtractableFiles(res) : res;
    })
    .filter(eligibleFile);
}

function parseForImports(paths, prefix = '../', suffix = '/**/*.tsx') {
  return paths.flatMap((path) => {
    const contents = readFileSync(path, { encoding: 'utf-8' });
    const matches = [];
    let match = FXA_REACT_IMPORT_REGEX.exec(contents);
    while (match != null) {
      matches.push(prefix + match[1] + suffix);
      match = FXA_REACT_IMPORT_REGEX.exec(contents);
    }
    return matches;
  });
}

function extractImportedComponents(dirToScan, prefix, suffix) {
  console.log('Extracting externally imported component paths...');
  const filePaths = getExtractableFiles(dirToScan);
  return parseForImports(filePaths, prefix, suffix);
}

module.exports = extractImportedComponents;
