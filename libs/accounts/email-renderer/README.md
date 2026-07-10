# account email renderer

This library was generated with [Nx](https://nx.dev).

## Building

Run `nx build accounts-email-renderer` to build the library.

## Running unit tests

Run `nx test-unit accounts-email-renderer` to execute the unit tests via [Jest](https://jestjs.io).

## Viewing Story Books

Run `nx storybook accounts-email-renderer`

## L10N Considerations

Run `nx run accounts-email-renderer:l10n-merge` to take the current state of the en.ftl files in the src directory and apply to them to public/locales/en/auth.ftl. Doing so ensures that the current state of the .ftl files is represented in the `/public/locales/en/emails.ftl` file.

If you are actively working on storybooks, running `nx run accounts-email-renderer:l10n-watch` will keep an eye on the ftl files and aumatically update the `public/locales/en/emails.ftl` file whenever changes are made to `src/**/en.ftl` files. This is useful to ensure the the changes to `en.ftl` files are accurate.

## Using this library in your service

The install is like most other libs, except there's a good chance you'll have to copy assests from this lib into your build's dist folder.

The simplest way to do this is with the copyfiles utility. Here's an example gist, from admin-server's package.json

    `"copy-email-assets": "copyfiles --up 1 '../../libs/accounts/email-renderer/**/*.{mjml,ftl,txt,css}' dist/libs/ ",`

### Other Gotchas

One tricky thing about how this project is crafted is that the lib is designed to be used in Node on the server server side, but the storybooks are run in a web browser context. Be careful not include the `node-bindings.ts` from storybook. Doing so will result in weird errors about missing polyfils! Don't simply try adding this polyfils. Instead, make sure `node-bindings.ts` isn't accidentally getting imported by storybook.

### Adding a new Email

To add a new email, do the following.

1. Go to `src/templates`,` and copy one of the existing folders renaming it as desired.
2. Next update the `index.mjml` to construct your template.
3. Next update `index.txt` to construct your text version of the email.
4. Next update `en.ftl` and make sure all l10n id's are in place.
5. Next update `index.ts`. You should have:
   a. Strongly typed `TemplateData` showing the property the template expected
   b. A template const that reflects the template names, and matches the folder name.
   c. A version const that reflects the current 'version' of the template
   d. A layout const that reflects the intended layout.
   d. Includes, which help us render a subject, action, or preview of the email
6. Next create `index.stories.ts` filling out the various states and render states as needed.
7. Next open the `fxa-email-render.ts` and follow the pattern there.
   a. Import the new template folder
   b. Create method corresponding to the template folder
   c. Follow the established pattern to wire up the template and expose it.
8. Finally run `nx storybook accounts-email-renderer` to preview what the email looks.

## View Git File History

This code was ported from auth-server. The code's history should more or less be retained. To view
a files full history use the git `--follow` option. e.g.

`git log --follow -M -- libs/accounts/email-renderer/src/templates/cadReminderFirst/index.mjml`

## Migration Process for L10N strings.

Once we start using this library to render a given email template, we want to start tracking translations in this library as opposed to translation strings that were originally held in the auth-server's template.

To do this, do the following steps:

1. Uncomment (or add) a reference to the .ftl files that are currently being used in this library. These references are held in gruntfile.js
2. Next go to the auth-server, and comment out the lines that were tracking the template which is longer referenced.

When you do these two steps what will happen is the languages strings in this library will be start being exported to the emails.ftl l10n translation file, and they will stop being exported to the auth.ftl translation file.

Having duplicate strings in these files is disruptive to our translators, so it's important we make the switch cleanly. Basically we want to ensure the l10n strings aren't being duplicated in the emails.ftl and auth.ftl files.
