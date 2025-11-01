# account email renderer

This library was generated with [Nx](https://nx.dev).

## Building

Run `nx build accounts-email-renderer` to build the library.

## Running unit tests

Run `nx test accounts-email-renderer` to execute the unit tests via [Jest](https://jestjs.io).

## Viewing Story Books

Run `nx storybook accounts-email-renderer`

## Using this library in your service

The install is like most other libs, except there's a good chance you'll have to copy assests from this lib into your build's dist folder.

The simplest way to do this is with the copyfiles utility. Here's an example gist, from admin-server's package.json

    `"copy-email-assets": "copyfiles --up 1 '../../libs/accounts/email-renderer/**/*.{mjml,ftl,txt,css}' dist/libs/ ",`

### Other Gotchas
One tricky thing about how this project is crafted is that the lib is designed to be used in Node on the server server side, but the storybooks are
run in a web browser context. Be careful not include the `node-bindings.ts` from storybook. Doing so will result in weird errors about missing
polyfils! Don't simply try adding this polyfils. Instead, make sure `node-bindings.ts` isn't accidentally getting imported by storybook.

### Adding a new Email

To add a new email, do the following.

1. Go to src/templates, and copy one of the exiting folders renaming it as desired.
2. Next update the index.mjml to construct your template.
3. Next update index.txt to construct your text version of the email.
4. Next update en.ftl and make sure all l10n id's are in place.
5. Next update index.ts. You should have:
    a. Strongly typed `TemplateData` showing the property the template expected
    b. A template const that reflects the template names, and matches the folder name.
    c. A version const that reflects the current 'version' of the template
    d. A layout const that reflects the intended layout.
    d. Includes, which help us render a subject, action, or preview of the email
6. Next create index.stories.ts filling out the various states and render states as needed.
7. Next open the `fxa-email-render.ts` and follow the pattern there.
    a. Import the new template folder
    b. Create method corresponding to the template folder
    c. Follow the established pattern to wire up the template and expose it.
8. Finally run `nx storybook accounts-email-renderer` to preview what the email looks.
