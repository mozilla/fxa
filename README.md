[![pullreminders](https://pullreminders.com/badge.svg)](https://pullreminders.com?ref=badge)

## Firefox Accounts

The Firefox Accounts (fxa) monorepo

### Table of Contents

[Getting Started](#getting-started)\
[Contributing](#contributing)\
[Dependencies](#dependencies)\
[Secrets](#secrets)\
[Testing](#testing)\
[Storybook in CircleCI](#storybook-in-circleci)\
[Firefox Custom Profile](#firefox-custom-profile)\
[Node debugging](#node-debugging)\
[Android debugging](#android-debugging)\
[FxA Email Service](#fxa-email-service)\
[Connecting to a local MySQL DB](#connecting-to-a-local-mysql-db)\
[Firefox for iOS](#firefox-for-ios)\
[Running with MailDev](#running-with-maildev)\
[Documentation](#documentation)
[Documentation for Scripts](#documentation-for-scripts)

---

### Getting Started

1. **Manually install the system [dependencies](#dependencies) for OS X or Ubuntu.** Note that [WSL](https://docs.microsoft.com/windows/wsl/) is required for development work on Windows.

2. Clone this repository.

   ```sh
   git clone https://github.com/mozilla/fxa.git
   ```

3. Run:

   ```sh
   cd fxa
   yarn install
   yarn start
   ```

Note: If `yarn install` fails, ensure your `yarn -v` is at least `1.22.0`.

Note this starts up all required services, including Redis, MySQL, and Memcached. It is recommended that you don't run these services yourself, or occupy any of the [server ports](https://github.com/mozilla/fxa/blob/main/mysql_servers.json). Doing so may result in errors.

4. Visit [localhost:3030](http://localhost:3030/).

Use the [PM2 tool](https://github.com/Unitech/PM2#main-features) to stop and start the servers, and read server logs.

To start all servers:

- `yarn start`

The most common commands are:

- `yarn stop` **- stop all servers.**

- `yarn pm2 status` - display running servers.

- `yarn pm2 logs` - logs for all servers (note: this must be used to verify accounts).

- `yarn pm2 logs auth` - display logs for service `auth`.

- `yarn pm2 stop content` - stop `content` service.

- `yarn pm2 restart mysql` - restart `mysql` process.

- More commands in the [PM2 Readme](https://github.com/Unitech/PM2#main-features).

---

### Contributing

See the separate [CONTRIBUTING.md](https://github.com/mozilla/fxa/blob/main/CONTRIBUTING.md) to learn how to contribute.

### Workflow

> This is an example workflow for **fxa**.

After installing **fxa** run `yarn start`. Use `yarn pm2 status` command to check the status of the servers:

![](https://i.imgur.com/iDMzgYm.png)

To avoid wasting computer resources while not working on FxA make sure to stop the servers using `yarn stop`.
Once you are back working on FxA just use the `yarn start` command to bring the servers back up.

#### Verifying email and viewing logs

Use the `yarn pm2 logs` command to get the logs of all servers. You may also use `yarn pm2 logs [id]` to just see the logs for that particular server.

When you signup for an account using the form on `localhost:3030/signup` the "inbox" logs will print out the verification code that you need to copy paste into your browser to verify your account locally:

![](https://i.imgur.com/cdh9Xrl.png)

If you get an `error` status for any of the servers please verify that you installed all required dependencies. Otherwise file an issue on this repository or [connect with the team on Firefox Accounts Riot](https://chat.mozilla.org/#/room/#fxa:mozilla.org).

### Managing dependencies

Use `yarn` to add dependencies. To add a dependency to a single package, which is what you'll usually want, run something like:

```sh
yarn workspace fxa-shared add --dev eslint
```

For multiple packages use [workspaces foreach](https://yarnpkg.com/cli/workspaces/foreach).

To update dependencies use [yarn up](https://yarnpkg.com/cli/up) or `yarn workspace <name> up`.

---

---

---

### Dependencies

> Required developer dependencies:
> [Git](http://git-scm.com/book/en/v2/Getting-Started-Installing-Git),
> [node.js **14+**](http://nodejs.org/),
> [Python 2.6+](https://www.python.org/),
> [Java 8+](https://www.java.com/en/download/),
> [Rust nightly+](https://doc.rust-lang.org/1.5.0/book/nightly-rust.html),
> [libgmp](https://gmplib.org/),
> [docker](https://docs.docker.com/),
> [gcloud CLI](https://cloud.google.com/sdk/) > [Yarn 2](https://yarnpkg.com)

##### OS X (with [Brew](http://brew.sh/)):

[Xcode and OS X Command Line Tools are required](https://developer.apple.com/xcode/), install it and verify that command line tools installed:

```
xcode-select --install
```

then:

```
sudo easy_install pip && sudo pip install virtualenv
```

[Install Docker for Mac](https://download.docker.com/mac/stable/Docker.dmg) | [Docs](https://docs.docker.com/docker-for-mac/install/)

##### Ubuntu:

```
sudo apt-get install build-essential git libgmp3-dev python-virtualenv python-dev pkg-config libssl-dev curl openjdk-11-jre firefox
```

Follow the [Docker CE instructions to install Docker](https://docs.docker.com/install/linux/docker-ce/ubuntu/).

Docker commands require sudo, to avoid it, follow steps below:

1. Add the docker group if it doesn't already exist

```
sudo groupadd docker
```

2. Add the connected user \$USER to the docker group

```
sudo gpasswd -a $USER docker
```

3. Restart the docker daemon

```
sudo service docker restart
```

#### Installing Node.js

We currently use Node 14.
See https://nodejs.org

Alternatively, the [Node Version Manager](https://github.com/nvm-sh/nvm) makes working with different versions of Node easy.

```
nvm install 14
nvm alias default 14
```

#### Installing Java

> Java is used to run Selenium functional tests

##### OS X:

Download from [java.com/en/download/](https://www.java.com/en/download/)

#### Installing Rust

> Rust Nightly is used for the fxa-email-service

##### Ubuntu and OS X

```
curl https://sh.rustup.rs -sSf | sh
```

Once the installer begins, when prompted:

1. Select "2) Customize installation"
2. Leave "Default host triple" blank, hit "enter"
3. Type "nightly" for "Default toolchain"
4. Type "default" for "Profile"
5. Type "y" for "Modify PATH variable?"
6. Select "1) Proceed with installation"

---

### Secrets

When developing locally you may need to set up some secrets in order to effectively work with certain servers. These secrets are managed at the package level.

Check out the Secrets section in the following READMEs:

- [fxa-auth-server](https://github.com/mozilla/fxa/tree/main/packages/fxa-auth-server#secrets)
- [fxa-payments-server](https://github.com/mozilla/fxa/tree/main/packages/fxa-payments-server#secrets)

---

### Testing

ℹ️ While it is possible to run the entire code base's test suite, in development you'll likely want to run specific test or a subset of tests. Please refer to [each package's README](#documentation) for detailed instructions on testing its respective code.

#### Test all or some packages

- You might need to run `yarn start infrastructure` before running tests to start services.

From the root directory you may test all or some FxA packages:

```bash
# Test only `fxa-shared`
yarn test fxa-shared

# Test `fxa-auth-db-mysql` and `fxa-auth-server`
yarn test fxa-auth-db-mysql fxa-auth-server

# Test all packages
yarn test all
```

- Note that this invokes the same test suite that CI uses, and is not necessarily the same as running `yarn test` in any given package.

#### Functional Playwrite Tests

You can run functional tests that emulate user behavior. This is a good final pass for any change that affects the UI. It can also save lots of time during development, because running the functional test is quite fast. Note that functional tests are not a replacement for unit tests, so use them judiciously.

Make sure the stack has been started and is running (`yarn start`). From here, there are a few variants:

```bash
# Run tests in headless mode
yarn workspace functional-tests test

# Run tests in debug mode allowing step through of each test stage. Note, using the --grep argument
# or adding .only statements to tests cases is a good idea when debugging, since stepping though every
# single tests is not desirable.
yarn workspace functional-tests test --debug --grep=$test_name

# Run tests in debug console mode, allowing browser debugging.
# https://playwright.dev/docs/debug#selectors-in-developer-tools-console
PWDEBUG=console yarn workspace functional-tests test

# Target a specific test
yarn test workspace functional-tests test --grep=$test_name
```

For more info, see details at https://playwright.dev.

#### Emulating CI environment

It is possible to run various test suites (known as Jobs) acting as Circle CI. This is useful if you're encountering CI-specific failures. Please refer to [this documentation](https://github.com/mozilla/fxa/tree/main/.circleci#local-testing).

---

### Storybook in CircleCI

Several of the packages in this project use [Storybook][] as a tool for building and demoing user interface components in React. These notably include [fxa-settings][fxa-settings-storybook], [fxa-payments-server][fxa-payments-server-storybook], and [fxa-react][].

For most test runs [in CircleCI][storybook-circleci], a static build of Storybook for the relevant commit is published to [a website on the Google Cloud Platform][storybooks-fxa-site] using [mozilla-fxa/storybook-gcp-publisher][storybook-gcp-publisher]. Refer to that tool's github repository for more details.

You can find the Storybook build associated with a given commit on Github via the "storybooks: status check" details link accessible via clicking the green checkmark next to the commit title.

![Capture](https://user-images.githubusercontent.com/21687/115094324-f888cb00-9ed1-11eb-9d39-bcba3aabf259.PNG)

The Google Cloud Platform project dashboard for the website can be found here, if you've been given access:

- https://console.cloud.google.com/home/dashboard?project=storybook-static-sites

For quick reference, here are [a few CircleCI environment variables][storybook-gcp-publisher-config] used by storybook-gcp-publisher that are relevant to FxA operations in CircleCI. Occasionally they may need maintenance or replacement - e.g. in case of a security incident involving another tool that exposes variables.

- `STORYBOOKS_GITHUB_TOKEN` - personal access token on GitHub for use in posting status check updates

- `STORYBOOKS_GCP_BUCKET` - name of the GCP bucket to which Storybook builds will be uploaded

- `STORYBOOKS_GCP_PROJECT_ID` - the ID of the GCP project to which the bucket belongs

- `STORYBOOKS_GCP_CLIENT_EMAIL` - client email address from GCP credentials with access to the bucket

- `STORYBOOKS_GCP_PRIVATE_KEY_BASE64` - the private key from GCP credentials, encoded with base64 to accomodate linebreaks

[storybooks-fxa-site]: https://storage.googleapis.com/mozilla-storybooks-fxa/index.html
[storybook-gcp-publisher-config]: https://github.com/mozilla-fxa/storybook-gcp-publisher#basic-1
[storybook-gcp-publisher]: https://github.com/mozilla-fxa/storybook-gcp-publisher
[storybook]: https://storybook.js.org/
[fxa-settings-storybook]: ./packages/fxa-settings#storybook
[fxa-payments-server-storybook]: packages/fxa-payments-server#storybook
[fxa-react]: ./packages/fxa-react
[storybook-circleci]: https://github.com/mozilla/fxa/blob/main/.circleci/config.yml#L270-L272

---

### Firefox Custom Profile

**Use `yarn start firefox` to start Firefox with local server configurations.**
Available options:

- `FXA_ENV=local` or `latest` or `stable` or `stage` (NOTE: `local` is default).
- `FXA_E10S=true` - add this flag to turn on E10S. (NOTE: `false` by default).
- `FXA_DESKTOP_CONTEXT` - `context=` value. (NOTE: `fx_desktop_v2` is default).
- `FIREFOX_BIN=/Applications/FirefoxNightly.app/Contents/MacOS/firefox-bin yarn start`
- `FIREFOX_DEBUGGER=true` - open [Browser Toolbox](https://developer.mozilla.org/en-US/docs/Tools/Browser_Toolbox) on start (NOTE: `false` by default for speed).

---

### Node debugging

It's possible to debug a running node process using a variety of debuggers (see the [node debugging docs](https://nodejs.org/en/docs/guides/debugging-getting-started/) for details).

We have also extensively documented working with the [FxA code-base using VS Code](https://mozilla.github.io/ecosystem-platform/docs/fxa-engineering/vscode-development).

#### Debugging a server

`yarn start` runs some of the services with the debugger enabled by default.
(using yarn is preferred in place of npm install)

1. Start the whole server as usual (`yarn && yarn start` from top-level in the monorepo)
2. To see which debug port each service is listening on check `.vscode/launch.json` or the `pm2.config.js` file of the package you're interested in.
3. Connect to the process to debug it:
   - Using Google Chrome, go to `chrome://inspect`, then click the process to connect to devtools.
     - you may need to add a new target in the "Configure..." menu with the correct debug port
   - VSCode requires setting up a `.vscode/launch.json` file; see the [VSCode docs](https://code.visualstudio.com/docs/nodejs/nodejs-debugging) for details.

##### Default Debug Ports

If you're using `yarn start`, the following ports are used for `--inspect`:

| Port | Service         |
| ---- | --------------- |
| 9130 | content-server  |
| 9140 | admin-panel     |
| 9150 | admin-server    |
| 9160 | auth-server     |
| 9170 | payments-server |
| 9180 | event-broker    |
| 9190 | support-panel   |
| 9200 | graphql-api     |

#### Debugging tests

The node debugger can also be attached to a running test process. Firefox Accounts uses a variety of test frameworks, so the steps vary for the different servers. The `--inspect` argument is used in the examples below, but `--inspect-brk` can also be used to pause the process as soon as it starts.

##### mocha tests (fxa-shared)

For mocha, pass the `--timeout 0` option, otherwise the test will fail if you step through it and exceed the default timeout (currently 2 seconds on `fxa-shared`):

`node --inspect ./node_modules/.bin/mocha --timeout 0 path/to/file`

In `fxa-shared`, this incantation works for some directories, but not yet others.

##### jest tests (fxa-payments-server)

For jest, pass the `--runInBand` argument, so it doesn't fork off the test runner to a separate process that isn't available to the inspector:

`node --inspect ./node_modules/.bin/jest --runInBand --config server/jest.config.js filematcher`

where `filematcher` is a regex that matches against test file paths. If you omit `filematcher`, Jest will run all tests (but you have to hit Enter a second time to trigger the test run).

---

### Android debugging

The following technique works with any Android application and can also be used for Firefox for Android.

Simply forward the following ports from the host machine to the Android device:

```
npm run adb-reverse
```

or

```
adb reverse tcp:3030 tcp:3030 # Content server
adb reverse tcp:9000 tcp:9000 # Auth server
adb reverse tcp:9010 tcp:9010 # OAuth server
adb reverse tcp:1111 tcp:1111 # Profile server
adb reverse tcp:5000 tcp:5000 # Sync server
```

Then run `yarn start` and get to work!

---

### FxA Email Service

> Skip this if you are not working on the [fxa-email-service](packages/fxa-email-service).

The pm2 scripts run the `latest` docker version of the email service by default. If you want to
start making changes to the email service then do the following:

1. Stop the email-service using `yarn pm2 stop <email_service_id>`
1. Build the service: `cd packages/fxa-email-service; cargo build --bin fxa_email_send`
1. Run the service: `cd packages/fxa-email-service; ./scripts/run_send.sh`

---

### Connecting to a local MySQL DB

> Skip this if you are not working on an FxA MySQL database.

FxA has several databases, for example `fxa`, `fxa_profile` and `pushbox`. Sometimes changes need to be made to a database, or it is helpful to read local data for development.

**Prerequisites**

- FxA running locally (see [Workflow](#workflow))
- Docker (see [Dependencies](#dependencies))
- [mysql CLI](https://dev.mysql.com/doc/refman/en/mysql.html)
  - If using the `mysql-client` option below, this can be installed via Homebrew with `brew install mysql-client`.

**Steps**

Execute an interactive shell on the MySQL DB container and start the MySQL shell:

```sh
yarn mysql
```

OR

Start the MySQL shell through the MySQL client:

```sh
mysql -uroot --host=127.0.0.1 --port=3306
```

Note: `mysql` is located in the `mysql-client` installation directory, e.g. at `/usr/local/opt/mysql-client/bin/mysql`.

---

### Firefox for iOS

> Skip this if you are not working on Firefox for iOS and FxA.

You can test sync locally in Firefox iOS using the XCode simulator.
[Follow the steps at github.com/mozilla/firefox-ios and setup _firefox-ios_ ](https://github.com/mozilla/firefox-ios) build locally.
Currently there is no way to dynamically switch servers in Firefox for iOS, to use **local** servers you need to run the script below:

```
FIREFOX_IOS_HOME=<path_to_firefox_ios_project> npm run config-fxios
```

After the script you need to rebuild _firefox-ios_.

---

### Running with MailDev

If you want to inspect emails, you can run fxa with [MailDev](https://www.npmjs.com/package/maildev).

#### Install

```bash
yarn global add maildev
```

#### Run

```bash
yarn start
yarn pm2 stop inbox
```

Once services have started, you can start MailDev on port 9999. You might have to start MailDev with sudo permissions.

```bash
sudo maildev -s 9999
```

All emails sent can be viewed from [http://localhost:1080](http://localhost:1080).

---

### Documentation

The [Firefox Ecosystem Platform](https://mozilla.github.io/ecosystem-platform/) serves as a documentation hub for Firefox Accounts, Services, Synced Client Integrations, and Subscription Platform.

In addition to the ecosystem docs, each package has it's own README.md and some have a `docs/` directory with info specific to that project.

- 123done [README](./packages/123done/README.md)
- browserid-verifier [README](./packages/browserid-verifier/README.md)
- fortress [README](./packages/fortress/README.md)
- fxa-admin-panel [README](./packages/fxa-admin-panel/README.md)
- fxa-admin-server [README](./packages/fxa-admin-server/README.md)
- fxa-auth-client [README](./packages/fxa-auth-client/README.md)
- fxa-auth-db-mysql [README](./packages/fxa-auth-db-mysql/README.md) / [docs/](./packages/fxa-auth-db-mysql/docs)
- fxa-auth-server [README](./packages/fxa-auth-server/README.md) / [docs/](./packages/fxa-auth-server/docs)
- fxa-content-server [README](./packages/fxa-content-server/README.md) / [docs/](./packages/fxa-content-server/docs)
- fxa-customs-server [README](./packages/fxa-content-server/README.md) / [docs/](./packages/fxa-customs-server/docs)
- fxa-dev-launcher [README](./packages/fxa-dev-launcher/README.md)
- fxa-email-event-proxy [README](./packages/fxa-email-event-proxy/README.md)
- fxa-email-service [README](./packages/fxa-email-service/README.md) / [docs/](./packages/fxa-email-service/docs)
- fxa-event-broker [README](./packages/fxa-event-broker/README.md) / [docs/](./packages/fxa-event-broker/docs)
- fxa-geodb [README](./packages/fxa-geodb/README.md)
- fxa-graphql-api [README](./packages/fxa-graphql-api/README.md)
- fxa-metrics-processor [README](./packages/fxa-metrics-processor/README.md)
- fxa-payments-server [README](./packages/fxa-payments-server/README.md)
- fxa-profile-server [README](./packages/fxa-profile-server/README.md) / [docs/](./packages/fxa-profile-server/docs)
- fxa-react [README](./packages/fxa-react/README.md)
- fxa-settings [README](./packages/fxa-settings/README.md)
- fxa-shared [README](./packages/fxa-shared/README.md)
- fxa-support-panel [README](./packages/fxa-support-panel/README.md)

---

### Documentation for Scripts

#### \_scripts/legal-md-to-pdf.sh

##### Purpose

This bash script converts markdown documents into pdfs. The purpose is to provide an efficient way for Mozilla VPN legal documents to be converted and made available to end-users.

##### Usage

_Pre-requisites_: The script requires the following:

- Local copy of Mozilla legal-docs repo: https://github.com/mozilla/legal-docs
- pandoc: https://github.com/jgm/pandoc/blob/master/INSTALL.md
- LaTeX: https://www.latex-project.org/get/

##### To Run:

```bash
# from root fxa directory
_scripts/legal-md-to-pdf.sh '/absolute/path/to/legal-docs/'
```

The script traverses the legal-docs directory looking for localized copies of the Mozilla VPN legal documents. When found, the script converts the document from .md to .pdf and writes it to `assets/legal/<document_name>.<locale>.pdf`.

Example:
directory provided: `/Users/test/github/mozilla/legal-docs/`
resulting file: `assets/legal/<document_name>.<locale>.pdf`
