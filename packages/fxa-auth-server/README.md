# Firefox Accounts Server

[![Code Quality: Javascript](https://img.shields.io/lgtm/grade/javascript/g/mozilla/fxa-auth-server.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/mozilla/fxa-auth-server/context:javascript)
[![Total Alerts](https://img.shields.io/lgtm/alerts/g/mozilla/fxa-auth-server.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/mozilla/fxa-auth-server/alerts)

This project implements the core server-side API for Firefox Accounts. It
provides account, device and encryption-key management for the Mozilla Cloud
Services ecosystem.

[Overview](docs/overview.md)

[Detailed design document](https://github.com/mozilla/fxa-auth-server/wiki/onepw-protocol)

[Detailed API spec](docs/api.md)

[Guidelines for Contributing](CONTRIBUTING.md)

## Prerequisites

- node 6+
- npm 2
- Grunt
- postfix
- memcached
- redis

## Install

On some systems running the server as root will cause working directory permissions issues with node. It is recommended that you create a separate, standard user to ensure a clean and more secure installation.

Clone the git repository and install dependencies:

    git clone git://github.com/mozilla/fxa-auth-server.git
    cd fxa-auth-server
    npm install

This runs a script `scripts/start-local.sh` as defined in `package.json`. This will start up
4 services, three of which listen on the following ports (by default):

- `bin/key_server.js` on port 9000
- `test/mail_helper.js` on port 9001
- `./node_modules/fxa-customs-server/bin/customs_server.js` on port 7000

When you `Ctrl-c` your server, all 4 processes will be stopped.

To start the server in dev MySQL store mode (ie. `NODE_ENV=dev`), run:

    npm run start-mysql

## Secrets

Create the following file: `config/secrets.json`. It will not be tracked in Git.

Use the following as a template, and fill in your own values:

```json
{
  "subscriptions": {
    "stripeApiKey": "sk_test_123",
    "paypalNvpSigCredentials": {
      "enabled": true,
      "sandbox": true,
      "user": "business_account_email_ID",
      "pwd": "business_account_password",
      "signature": "business_account_signature"
    }
  }
}
```

- `stripeApiKey` should be a test Stripe Secret Key
- `user` should be a sandbox PayPal business account username
- `pwd` should be a sandbox PayPal business account password
- `signature` should be a sandbox PayPal business account signature

The sandbox PayPal business account API credentials above can be found in the PayPal developer dashboard under "Sandbox" > "Accounts". You may need to create a business account if one doesn't exist.

## Testing

Run tests with:

    npm test

Run specific tests with the following commands:

```bash
# Test only test/local/account_routes.js
# Note: This command does not work for remote tests.
npm test -- test/local/account_routes.js

# Grep for "SQSReceiver"
NODE_ENV=dev npx mocha -r ts-node/register test/*/** -g "SQSReceiver"
```

To select a specific glob of tests to run:

```
npm test -- test/local/account_routes.js test/local/password_*
```

To run a certain suite of tests (e.g. all remote tests):

```
npm test -- test/remote
```

- Note: stop the auth-server before running tests. Otherwise, they will fail with obscure errors.
- You can use `LOG_LEVEL`, such as `LOG_LEVEL=debug` to specify the test logging level.

This package uses [Mocha](https://mochajs.org/) to test its code. By default `npm test` will run a series of NPM test scripts and then lint the code:

Refer to Mocha's [CLI documentation](https://mochajs.org/#command-line-usage) for more advanced test configuration.

### Testing with non-local databases

Executing tests using remote databases (MySQL, Redis, Memcached) is possible by specifying (and exporting) the following environment variables:

- MySQL:
  - MYSQL_HOST
  - MYSQL_SLAVE_HOST
  - AUTH_MYSQL_HOST
- Redis:
  - REDIS_HOST
  - ACCESS_TOKEN_REDIS_HOST
  - REFRESH_TOKEN_REDIS_HOST
- Memcached:
  - MEMCACHE_METRICS_CONTEXT_ADDRESS

This also allows to use temporary throw-away Docker containers to provide these.

## Mailer

The mailer library is located in `mailer/` directory.

The emails are written to postfix which tends sends them off to SES.

The auth-mailer also includes a restify API to send emails, but the auth server is using it as a library at the moment.

### Changing Templates

If you are changing or adding templates then you need to update `.html` and `.txt` templates.
In `mailer/`, use the `/partials` directory to make changes to the HTML templates, then run `grunt templates` to regenerate the template.
This saves the HTML template into `/templates`. Then make changes to the `.txt` template in the `/templates` directory.

### L10N

After updating a string in one of the templates in `./mailer/templates` you'll need to extract the strings.
Follow the instructions at [mozilla/fxa-content-server-l10n](https://github.com/mozilla/fxa-content-server-l10n#string-extraction).

### 2021 Template Updates

In 2021, FxA began converting the email templating system from Mustache, inline CSS, and GetText to a modernized stack using [MJML](https://mjml.io/), [EJS](https://ejs.co/), [Fluent](https://github.com/projectfluent/fluent.js/tree/master/fluent-dom), and [Storybook](https://github.com/storybookjs/storybook/tree/main/app/html) ([see the ADR](https://github.com/mozilla/fxa/blob/main/docs/adr/0024-upgrade-templating-toolset-of-auth-server-emails.md)). Until each template has been converted and verified by QA, the old system described above will be used for emails in production.

#### MJML Feature Flag for Testing

The auth-server has an `MJML` configuration value that designates which email templates have been converted to the new stack (`mjml.templates` array) and controls which user emails will receive those templates (`mjml.enabledEmailAddress` regex). The auth-server exposes a feature flag method to check these values and send the correct rendered template accordingly (old or new) which allows for testing across environments.

This flag and logic around it can be removed, as well as old templates and documentation, once all templates have been converted, verified by QA, and tested in production.

#### MJML and EJS

HTML email has a lot of quirks - MJML shifts the burden of maintaining solutions for these off of FxA engineers. Furthermore, using EJS with MJML helps us include more logic in templates thereby making conditional rendering possible without creating any additional helper methods. A small example of how template variables are being passed down from the mailer object and consumed in the templates is shown below:

```js
const templateValues = {
  buttonText: 'Sync another device',
};
const localized = this.templates.render(
  message.template, // template name
  message.layout || 'fxa', // template layout
  templateValues
);
const button = `
  <mj-include path="./lib/senders/emails/css/button/index.css" type="css" css-inline="inline" />
  <mj-section>
    <mj-column>
      <mj-button css-class="primary-button"><%- buttonText %></mj-button>
    </mj-column>
  </mj-section>
`;
```

Note: In ejs, `<%=` outputs the value into the template with HTML escaped, whereas `<%-` renders the string as is (unescaped)

The emails for which the MJML feature flag is enabled can be rendered to disk using the `yarn write-emails` command.

#### Styles

Another advantage of using MJML for emails is that it inlines styles with the compliled HTML elements making emails compatible with all the mail clients. Currently, we are using `scss` stylesheets which get compiled down to css and are included in the MJML templates. We are maintaining shared stylesheets with common styles and variables, and template-specific stylesheet for the styles scoped to the respective template/partial. Although there are a lot of benefits of using stylesheets with MJML, one caveat that we'd like to highlight is the inevitible use of `!important` syntax with some of the styles. While compiling down the templates, MJML internally adds some default styles to the HTML elements, so if we were to add our custom styles on top of it we may have to use `!important` with them to override the default ones.  
Styling classes is not always how it seems due to how MJML compiles our templates and you may need to add `div` or `td` after the class to target that specific element. FxA has created a [styleguide](https://storage.googleapis.com/mozilla-storybooks-fxa/index.html) for engineers to reference convenience classes provided by Tailwind. Since we were creating new stylesheets for our emails, we took this as an opportunity to DRY up the codebase by following Tailwind conventions and their associated styles for sass classes and variables as well as using the closest `px` value to the design guide for consistency across FxA's CSS.

#### l10n (Fluent)

We've setup [Fluent](https://github.com/projectfluent/fluent.js/tree/master/fluent-dom) to localize our newly created MJML emails. Fluent uses `FTL` format to describe translation resources and these resources contain messages that would be used to translate the emails. To localize an element in Fluent, the developer adds a new message to an FTL file and then has to associate an l10n-id with the element by defining a data-l10n-id attribute:

```js
<p data-l10n-id="update-application-info" data-l10n-args="{'version': '60.0'}">
  <span class="bold">
    <a href="http://www.mozilla.org/privacy" />
  </span>
</p>
```

```
-brand-short-name = Firefox
update-application-info =
    You are using { -brand-short-name } Version: { $version }.
    <span>Please, read the <a>privacy policy</a></span>
```

Fluent will take care of the rest, populating the element with the message value in its content and all localizable attributes if defined. Fluent will overlay the translation onto the source fragment preserving attributes like `class` and `href` from the source and adding translations for the elements inside. The resulting localized content will look like this:

```js
<p data-l10n-id="update-application-info" data-l10n-args="{'version': '60.0'}">
  You are using Firefox Version: 60.0.
  <span class="bold">
    Please, read the <a href="http://www.mozilla.org/privacy">privacy policy</a>
  </span>
</p>
```

By default emails render from left to right which could hamper the accessibility of emails for some locales so along with localizing the emails, we took care of rendering the emails from right to left for rtl locales and vice versa.

##### Fluent for plaintext files

Fluent is also being used to localize plaintext version of templates. Each and every template has an `index.txt` file which contains the plaintext version of it. A pattern is set which will help identify the text that needs to be localized: `fluent-id = "default value provided"` where value of `fluent-id` is same as `data-l10n-id` attribute of the corresponding markup element. If `fluent-id` is present in fluent bundle, the text will be localized else it will be replaced with the fallback value present. In cases, where we don't want to localize the text, just declare a string and it will be rendered as is. The following snippets will demonstrate how plaintext files are localized and generated:

```
sync-reminder = "<%- headerText %>"

<%- link %>
```

EJS will compile the above `.txt` file into something like this:

```
sync-reminder = "Here's your reminder to sync devices."

http://localhost:3030/connect_another_device?utm_medium=email&utm_campaign=fx-cad-reminder-first&utm_content=fx-connect-device
```

The compiled text will then be localized with fluent and the final plaintext version will be generated something like this:

```
Here's your reminder to sync devices.

http://localhost:3030/connect_another_device?utm_medium=email&utm_campaign=fx-cad-reminder-first&utm_content=fx-connect-device
```

#### Storybook and Documentation

As part of the emails revamp project, Storybook was setup locally in order to preview the various states of the emails which was not possible before without manually tweaking the code. The templates that are converted to MJML are compiled down to HTML before they can be rendered in Storybook and with [Controls addon](https://storybook.js.org/docs/react/essentials/controls) in place we can directly modify the variables without touching the codebase.
Each template has an optional `doc` string which serves to document when users will receive the email meaning what triggers the email to be sent. These templates are essentially HTML templates rendered in browser with Storybook and there is a possibility that they may not exactly match with what users see in an email client.
To preview these templates with Storybook, run `yarn storybook-mjml` in `fxa-auth-server` root directory

#### Production

Use the `FXA_L10N_SHA` to pin L10N files to certain SHA. If not set then the `master` SHA will be used.

## Reference Client

[fxa-auth-client](../fxa-auth-client)

## Dev Deployment

Refer to https://github.com/mozilla/fxa-dev.git.

## Configuration

Configuration of this project
is managed by [convict](https://github.com/mozilla/node-convict),
using the schema in
[`config/index.ts`](config/index.ts).

Default values from this schema
can be overridden in two ways:

1. By setting individual environment variables,
   as indicated by the `env` property
   for each item in the schema.

   For example:

   ```sh
   export CONTENT_SERVER_URL="http://your.content.server.org"
   ```

2. By specifying the path
   to a conforming JSON file,
   or a comma-separated list of paths,
   using the `CONFIG_FILES` environment variable.
   Files specified in this way
   are loaded when the server starts.
   If the server fails to start,
   it usually indicates that one of these JSON files
   does not conform to the schema;
   check the error message
   for more information.

   For example:

   ```sh
   export CONFIG_FILES="~/fxa-content-server.json,~/fxa-db.json"
   ```

### Email config

There is also some live config
loaded from Redis for the email service.
This config is stored as a JSON string
that looks like this
(every property is optional):

```json
{
  "sendgrid": {
    "percentage": 100,
    "regex": "^.+@example\\.com$"
  },
  "socketlabs": {
    "percentage": 100,
    "regex": "^.+@example\\.org$"
  },
  "ses": {
    "percentage": 10,
    "regex": ".*"
  }
}
```

`scripts/email-config.js`
has been written to help
manage this config.

- To print the current live config to stdout:

  ```
  npx ts-node scripts/email-config read
  ```

- To set the live config from a JSON file on disk:

  ```
  cat foo.json | npx ts-node scripts/email-config write
  ```

- To set the live config from a string:

  ```
  echo '{"sendgrid":{"percentage":10}}' | npx ts-node scripts/email-config write
  ```

- To undo the last change:

  ```
  npx ts-node scripts/email-config revert
  ```

- To check the resolved config for a specific email address:

  ```
  npx ts-node scripts/email-config check foo@example.com
  ```

## Troubleshooting

Firefox Accounts authorization is a complicated flow. You can get verbose logging by adjusting the log level in the `config.json` on your deployed instance. Add a stanza like:

    "log": {
      "level": "trace"
    }

Valid `level` values (from least to most verbose logging) include: `"fatal", "error", "warn", "info", "trace", "debug"`.

## Database integration

This server depends on a database server
from the [`fxa-auth-db-mysql` repo](../fxa-auth-db-mysql/).

## License

MPL 2.0
