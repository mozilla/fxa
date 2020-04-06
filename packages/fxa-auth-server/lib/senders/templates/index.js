/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const LIB_DIR = '../..';

const error = require(`${LIB_DIR}/error`);
const fs = require('fs');
const handlebars = {
  html: require('handlebars').create(),
  txt: require('handlebars').create(),
};
const path = require('path');
const Promise = require(`${LIB_DIR}/promise`);

const readDir = Promise.promisify(fs.readdir);
const readFile = Promise.promisify(fs.readFile);

const TEMPLATE_FILE = /(.+)\.(html|txt)$/;
const TEMPLATES_DIR = __dirname;
const LAYOUTS_DIR = path.join(TEMPLATES_DIR, 'layouts');
const PARTIALS_DIR = path.join(TEMPLATES_DIR, 'partials');

module.exports = init;

async function init(log) {
  if (!log) {
    throw error.unexpectedError();
  }

  handlebars.html.registerHelper('t', translate);
  handlebars.txt.registerHelper('t', translate);
  handlebars.html.registerHelper('or', orHelper);
  handlebars.txt.registerHelper('or', orHelper);

  // helpers from https://gist.github.com/servel333/21e1eedbd70db5a7cfff327526c72bc5
  const reduceOp = function(args, reducer) {
    args = Array.from(args);
    args.pop(); // => options
    var first = args.shift();
    return args.reduce(reducer, first);
  };

  function orHelper() {
    return reduceOp(arguments, (a, b) => a || b);
  }

  await forEachTemplate(PARTIALS_DIR, (template, name, type) => {
    handlebars[type].registerPartial(name, template);
  });

  const templates = new Map();
  const layouts = new Map();

  await Promise.all([
    forEachTemplate(TEMPLATES_DIR, compile(templates)),
    forEachTemplate(LAYOUTS_DIR, compile(layouts)),
  ]);

  return { render };

  function translate(string) {
    if (this.translator) {
      return this.translator.format(this.translator.gettext(string), this);
    }

    return string;
  }

  function render(templateName, layoutName, data) {
    const template = templates.get(templateName);

    if (!template) {
      log.error('templates.render.invalidArg', {
        templateName,
        data,
      });
      throw error.unexpectedError();
    }

    const layout = layouts.get(layoutName) || {};
    let html, text;

    if (template.html) {
      html = renderWithOptionalLayout(template.html, layout.html, data);
    }

    if (template.txt) {
      text = renderWithOptionalLayout(template.txt, layout.txt, data);
    }

    return { html, text };
  }
}

async function forEachTemplate(dir, action) {
  const files = await readDir(dir);
  return Promise.all(
    files.map(async file => {
      const parts = TEMPLATE_FILE.exec(file);
      if (parts) {
        const template = await readFile(path.join(dir, file), {
          encoding: 'utf8',
        });
        return action(template, parts[1], parts[2]);
      }

      return Promise.resolve();
    })
  );
}

function compile(map) {
  return (template, name, type) => {
    const item = map.get(name) || {};
    item[type] = handlebars[type].compile(template);
    map.set(name, item);
  };
}

function renderWithOptionalLayout(template, layout, data) {
  if (layout) {
    return layout({
      ...data,
      body: template(data),
    });
  }

  return template(data);
}
