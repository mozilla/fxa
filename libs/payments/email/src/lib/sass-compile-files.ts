/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { renderSync } from 'sass';
import {
  writeFileSync,
  mkdirSync,
  existsSync,
  rmdirSync,
  readdirSync,
} from 'fs';
import path from 'path';

const getDirectories = (source: string) =>
  readdirSync(source, { withFileTypes: true })
    .filter((dirent: any) => dirent.isDirectory())
    .map((dirent: any) => dirent.name);

// construct arrays of partials and templates based on the directories
const partials = getDirectories(path.join(__dirname, 'partials'));
const templates = getDirectories(path.join(__dirname, 'templates'));
const layouts = getDirectories(path.join(__dirname, 'layouts'));

async function compileSass(dir: string, subdir: string) {
  let styleResult: Record<any, any> = {};
  try {
    styleResult = renderSync({
      file: dir,
      outFile: subdir,
    });
  } catch (e) {
    console.log(e);
  }
  writeFileSync(subdir, styleResult.css, 'utf8');
}

async function main(directories: Record<any, any>) {
  // remove css directory if already present
  if (existsSync(path.join(__dirname, 'css'))) {
    rmdirSync(path.join(__dirname, 'css'), { recursive: true });
  }
  mkdirSync(path.join(__dirname, 'css'));

  // create subdirectories for templates and partials inside the css directory and generate compiled stylesheets into them
  for (const dir in directories) {
    for (const subdir of directories[`${dir}`]) {
      mkdirSync(path.join(__dirname, 'css', subdir));
      const scssPath = path.join(__dirname, dir, subdir, 'index.scss');
      const cssPath = path.join(__dirname, 'css', subdir, 'index.css');
      if (existsSync(scssPath)) {
        await compileSass(scssPath, cssPath);
      }
    }
  }

  // compile the global stylesheet
  await compileSass(
    path.join(__dirname, 'global.scss'),
    path.join(__dirname, 'css', 'global.css')
  );

  await compileSass(
    path.join(__dirname, 'locale-dir.scss'),
    path.join(__dirname, 'css', 'locale-dir.css')
  );
}

main({ partials, templates, layouts });
