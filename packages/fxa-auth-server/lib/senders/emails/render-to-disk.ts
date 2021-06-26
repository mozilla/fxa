import fs = require('fs');
import path = require('path');
import * as templates from './templates';
import { render, context } from './renderer';

fs.mkdir(path.join(__dirname, 'dist'), (err) => {
  if (err) {
    return console.error(err);
  }
});

let templateName: keyof typeof templates;
for (templateName in templates) {
  const htmlTemplate = render(templateName, context);
  let outputFile = path.join(__dirname, 'dist', `${templateName}.html`);
  fs.writeFileSync(outputFile, htmlTemplate);
}
