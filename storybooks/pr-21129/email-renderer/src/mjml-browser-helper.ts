type MjIncludeTag = { path?: string; inline: boolean; type?: string };

/**
 * Important! At the current momement, mjml-browser does not support <mj-include>.
 * See: https://github.com/mjmlio/mjml/tree/master/packages/mjml-browser#unavailable-features
 *
 * Until this is supported, we will convert mj-incude tags into mj-style tags with
 * ejs includes. The allows parity between mjml and mjml-browser.
 * @param mjml mjml document
 * @returns mjml document that can be processed by mjml-browser
 */
export function transformMjIncludeTags(mjml: string): string {
  // Must be mjml document
  const hasOpeningMjmlTag = /<mjml/.test(mjml);
  const hasClosingMjmlTag = /<\/mjml>/.test(mjml);
  if (!hasOpeningMjmlTag) {
    throw new Error('Missing <mjml> tag');
  } else if (!hasClosingMjmlTag) {
    throw new Error('Missing </mjml> tag');
  }

  // <mj-style> tags must go in header. Create one if possible,
  // otherwise error out.
  const hasOpeningMjHeadTag = /<mj-head>/.test(mjml);
  const hasClosingMjHeadTag = /<\/mj-head>/.test(mjml);
  if (!hasOpeningMjHeadTag && !hasClosingMjHeadTag) {
    mjml = mjml.replace('<mjml>', `<mjml> <mj-head> </mj-head> `);
  } else if (!hasOpeningMjHeadTag) {
    throw new Error('Missing <mj-head> tag');
  } else if (!hasClosingMjHeadTag) {
    throw new Error('Missing </mj-head> tag');
  }

  // Parse mjml and build style statements using ejs includes
  const includes = extractMjIncludeTags(mjml);

  // Append includes to end of header
  if (includes.length) {
    // Update the header tag, appending the includes
    mjml = mjml.replace(
      /<\/mj-head>/,
      `${includes.map((x) => toMjStyle(x)).join('')}</mj-head>`
    );
  }
  return mjml;
}

function extractMjIncludeTags(mjml: string): MjIncludeTag[] {
  let chomp = false;
  let include = '';
  const includes = new Array<MjIncludeTag>();
  mjml
    .replace(/<mj-include/g, ' <mj-include')
    .split(/\n|\s/g)
    .forEach((x) => {
      if (chomp && /<mj-/.test(x)) {
        throw new Error('Malformed <mj-include> tag');
      }

      // Keep adding text while, chomping
      if (chomp) {
        include += x;
      }
      // Find start tag and begin chomping
      else if (/<mj-include/.test(x)) {
        include = x;
        chomp = true;
      }

      // If current line has end tag, end chomp
      if (/\/>/.test(include)) {
        chomp = false;
      }

      // If done chomping and include tag, parse it
      if (include && !chomp) {
        includes.push(parseMjIncludeTag(include));
        include = '';
      }
    });

  // Inidcates /> is missing
  if (chomp) {
    throw new Error('Malformed <mj-include> tag');
  }

  return includes;
}

function parseMjIncludeTag(include: string): MjIncludeTag {
  const res = {
    path: /path=("[^"]*|'[^']*)/g.exec(include)?.[1]?.substring(1),
    inline: /css-inline=("inline"|'inline')/g.test(include),
    type: /type=("[^"]*|'[^']*)/g.exec(include)?.[1]?.substring(1),
  };

  // Convert relative paths. The requests will now be made to the root
  // of the webserver.
  res.path = res.path?.replace(/\.\//, '/');

  return res;
}

function toMjStyle(tag: MjIncludeTag) {
  const { inline, path, type } = tag;

  if (type !== 'css') return '';
  if (!path) return '';

  if (inline) {
    return `<mj-style inline="inline" > <%- include('${path}') %> </mj-style>`;
  }
  return `<mj-style> <%- include('${path}') %> </mj-style>`;
}
