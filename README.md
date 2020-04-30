[![pullreminders](https://pullreminders.com/badge.svg)](https://pullreminders.com?ref=badge)

## Firefox Accounts

The Firefox Accounts (fxa) monorepo

### Table of Contents

[Getting Started](#getting-started)\
[Contributing](#contributing)\
[Dependencies](#dependencies)\
[Secrets](#secrets)\
[Firefox Custom Profile](#firefox-custom-profile)\
[Functional Tests](#functional-tests)\
[Node debugging](#node-debugging)\
[Android debugging](#android-debugging)\
[FxA Email Service](#fxa-email-service)\
[Firefox for Android](#firefox-for-android)\
[Firefox for iOS](#firefox-for-ios)\
[Running with MailDev](#running-with-maildev)\
[Other tasks](#other-tasks)\
[Documentation](#documentation)

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
   npm install
   npm start
   ```

Note this starts up all required services, including Redis, MySQL, and Memcached. It is recommended that you don't run these services yourself, or occupy any of the [server ports](https://github.com/mozilla/fxa/blob/master/mysql_servers.json). Doing so may result in errors.

4. Visit [localhost:3030](http://localhost:3030/).

Use the [PM2 tool](https://github.com/Unitech/PM2#main-features) to stop and start the servers, and read server logs.

To start all servers:

- `npm start`

The most common commands are:

- `npm stop` **- stop all servers.**

- `./pm2 status` - display running servers.

- `./pm2 logs` - logs for all servers (note: this must be used to verify accounts).

- `./pm2 logs auth` - display logs for service `auth`.

- `./pm2 stop content` - stop `content` service.

- `./pm2 restart mysql` - restart `mysql` process.

- More commands in the [PM2 Readme](https://github.com/Unitech/PM2#main-features).

---

### Contributing

See the separate [CONTRIBUTING.md](https://github.com/mozilla/fxa/blob/master/CONTRIBUTING.md) to learn how to contribute.

### Workflow

> This is an example workflow for **fxa**.

After installing **fxa** run `npm start`. Use `./pm2 status` command to check the status of the servers:

![](http://i.imgur.com/eqL8FiZ.png)

To avoid wasting computer resources while not working on FxA make sure to stop the servers using `npm stop`.
Once you are back working on FxA just use the `npm start` command to bring the servers back up.

#### Verifying email and viewing logs

Use the `./pm2 logs` command to get the logs of all servers. You may also use `./pm2 logs [id]` to just see the logs for that particular server.

When you signup for an account using the form on `localhost:3030/signup` the "inbox" logs will print out the verification code that you need to copy paste into your browser to verify your account locally:

![](https://i.imgur.com/cdh9Xrl.png)

If you get an `error` status for any of the servers please verify that you installed all required dependencies. Otherwise file an issue on this repository or [connect with the team on Firefox Accounts Riot](https://chat.mozilla.org/#/room/#fxa:mozilla.org).

---

---

---

### Dependencies

> Required developer dependencies:
> [Git](http://git-scm.com/book/en/v2/Getting-Started-Installing-Git),
> [node.js **12+** with npm 6](http://nodejs.org/),
> [Python 2.6+](https://www.python.org/),
> [Java 8+](https://www.java.com/en/download/),
> [Rust nightly+](https://doc.rust-lang.org/1.5.0/book/nightly-rust.html),
> [libgmp](https://gmplib.org/),
> [graphicsmagick](http://www.graphicsmagick.org/),
> [docker](https://docs.docker.com/),
> [gcloud CLI](https://cloud.google.com/sdk/)

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
sudo apt-get install build-essential git libgmp3-dev graphicsmagick  python-virtualenv python-dev pkg-config libssl-dev curl openjdk-11-jre firefox
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

We currently use Node 12.
See https://nodejs.org

Alternatively, the [Node Version Manager](https://github.com/nvm-sh/nvm) makes working with different versions of Node easy.

```
nvm install 12
nvm alias default 12
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

Once the installer begins:

1. Select "2) Customize installation"
2. Leave "Default host triple" blank, hit "enter"
3. Type "nightly" for "Default toolchain"
4. Type "y" for "Modify PATH variable?"
5. Select "1) Proceed with installation"

---

### Secrets

When developing locally you may need to set up some secrets in order to effectively work with certain servers. These secrets are managed at the package level.

Check out the Secrets section in the following READMEs:

- [fxa-auth-server](https://github.com/mozilla/fxa/tree/master/packages/fxa-auth-server#secrets)
- [fxa-payments-server](https://github.com/mozilla/fxa/tree/master/packages/fxa-payments-server#secrets)

---

### Firefox Custom Profile

**Use `npm start firefox` to start Firefox with local server configurations.**
Available options:

- `FXA_ENV=local` or `latest` or `stable` or `stage` (NOTE: `local` is default).
- `FXA_E10S=true` - add this flag to turn on E10S. (NOTE: `false` by default).
- `FXA_DESKTOP_CONTEXT` - `context=` value. (NOTE: `fx_desktop_v2` is default).
- `FIREFOX_BIN=/Applications/FirefoxNightly.app/Contents/MacOS/firefox-bin npm start`
- `FIREFOX_DEBUGGER=true` - open [Browser Toolbox](https://developer.mozilla.org/en-US/docs/Tools/Browser_Toolbox) on start (NOTE: `false` by default for speed).

---

### Functional Tests

**The following requires [the JDK](http://www.oracle.com/technetwork/java/javase/downloads/index-jsp-138363.html#javasejdk) and tests the local servers only.**

## run the following commands from the fxa-content-server directory

To run all functional tests:

```
npm run test-functional
```

To run a specific test or tests whose name matches part of a search string:

```
npm run test-functional -- --grep="Test name"
```

--where 'Test name' is not the file name but the description/name of the test(s).

---

### Node debugging

It's possible to debug a running node process using a variety of debuggers (see the [node debugging docs](https://nodejs.org/en/docs/guides/debugging-getting-started/) for details).

We have also extensively documented working with the [FxA code-base using VS Code](https://mozilla.github.io/ecosystem-platform/docs/fxa-engineering/vscode-development).

#### Debugging a server

`npm start` runs some of the services with the debugger enabled by default.

1. Start the whole server as usual (`npm install && npm start` from top-level in the monorepo)
2. To see which debug port each service is listening on check `.vscode/launch.json` or the `pm2.config.js` file of the package you're interested in.
3. Connect to the process to debug it:
   - Using Google Chrome, go to `chrome://inspect`, then click the process to connect to devtools.
     - you may need to add a new target in the "Configure..." menu with the correct debug port
   - VSCode requires setting up a `.vscode/launch.json` file; see the [VSCode docs](https://code.visualstudio.com/docs/nodejs/nodejs-debugging) for details.

##### Default Debug Ports

If you're using `npm start`, the following ports are used for `--inspect`:

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

Then run `npm start` and get to work!

---

### FxA Email Service

> Skip this if you are not working on the [fxa-email-service](packages/fxa-email-service).

The pm2 scripts run the `latest` docker version of the email service by default. If you want to
start making changes to the email service then do the following:

1. Stop the email-service using `./pm2 stop <email_service_id>`
1. Build the service: `cd packages/fxa-email-service; cargo build --bin fxa_email_send`
1. Run the service: `cd packages/fxa-email-service; ./scripts/run_send.sh`

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
npm install maildev -g
```

#### Run

```bash
npm start
./pm2 stop inbox
```

Once services have started, you can start MailDev on port 9999. You might have to start MailDev with sudo permissions.

```bash
sudo maildev -s 9999
```

All emails sent can be viewed from [http://localhost:1080](http://localhost:1080).

---

### Documentation

The [Firefox Ecosystem Platform](https://mozilla.github.io/ecosystem-platform/) serves as a documentation hub for Firefox Accounts, Services, Synced Client Integrations, and Subscription Platform.

In addition to the ecosystem docs, each package has it's own README.md and `docs/` directory with info specific to that project.

- 123done [README](./packages/123done/README.md)
- browserid-verifier [README](./packages/browserid-verifier/README.md)
- fortress [README](./packages/fortress/README.md)
- fxa-auth-db-mysql [README](./packages/fxa-auth-db-mysql/README.md) / [docs/](./packages/fxa-auth-db-mysql/docs)
- fxa-auth-server [README](./packages/fxa-auth-server/README.md) / [docs/](./packages/fxa-auth-server/docs)
- fxa-content-server [README](./packages/fxa-content-server/README.md) / [docs/](./packages/fxa-content-server/docs)
- fxa-email-event-proxy [README](./packages/fxa-email-event-proxy/README.md)
- fxa-email-service [README](./packages/fxa-email-service/README.md) / [docs/](./packages/fxa-email-service/docs)
- fxa-event-broker [README](./packages/fxa-event-broker/README.md) / [docs/](./packages/fxa-event-broker/docs)
- fxa-geodb [README](./packages/fxa-geodb/README.md)
- fxa-js-client [README](./packages/fxa-js-client/README.md)
- fxa-payments-server [README](./packages/fxa-payments-server/README.md)
- fxa-profile-server [README](./packages/fxa-profile-server/README.md) / [docs/](./packages/fxa-profile-server/docs)
- fxa-shared [README](./packages/fxa-shared/README.md)
- fxa-support-panel [README](./packages/fxa-support-panel/README.md)
