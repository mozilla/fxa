/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import fs = require('fs');
import path = require('path');
import * as templates from './templates';
import { renderWithOptionalLayout, context } from './renderer';

fs.mkdir(path.join(__dirname, 'dist'), (err) => {
  if (err) {
    return console.error(err);
  }
});

let templateName: keyof typeof templates;
for (templateName in templates) {
  const htmlTemplate = renderWithOptionalLayout(templateName, context, 'fxa');
  let outputFile = path.join(__dirname, 'dist', `${templateName}.html`);
  fs.writeFileSync(outputFile, htmlTemplate);
}
