## fxa-local-dev [![Build Status](https://travis-ci.org/mozilla/fxa-local-dev.svg?branch=master)](https://travis-ci.org/mozilla/fxa-local-dev) ![](https://img.shields.io/badge/tested_on-OS%20X%20and_Ubuntu-brightgreen.svg)
> An easy way to contribute to Firefox Accounts. If you have issues please ask in `#fxa` on Mozilla IRC.

> ⚠️ **NOTE:  Do not use this project in production, this is only for local development.**

### Getting Started

1. **Manually install the system [dependencies](#dependencies) for OS X or Ubuntu.**

2. Clone this repository.

   ```sh
   git clone https://github.com/mozilla/fxa-local-dev.git
   ```

3. Run:

   ```sh
   cd fxa-local-dev
   npm install
   ```

4. Visit [127.0.0.1:3030](http://127.0.0.1:3030/).

Use the [PM2 tool](https://github.com/Unitech/PM2#main-features) to stop and start the servers, and read server logs.

   The most common commands are:

   - `./pm2 start servers.json` **- start all servers.**

   - `./pm2 kill` **- stop all servers.**

   - `./pm2 status` - display running servers.

   - `./pm2 logs` - logs for all servers (note: this must be used to verify accounts).

   - `./pm2 logs 1` - display logs for process `1`.

   - `./pm2 stop 1` - stop process `1`.

   - `./pm2 restart 1` - restart process `1`.

   - More commands in the [PM2 Readme](https://github.com/Unitech/PM2#main-features).

When you want to [fetch the latest changes](_scripts/update_all.sh) to all servers:

   ```sh
   npm run update
   ```

*******

### Workflow
> This is an example workflow for **fxa-local-dev**.

After installing **fxa-local-dev** the servers should automatically start up. Use `./pm2 status` command to check the status of the servers:

![](http://i.imgur.com/eqL8FiZ.png)

To avoid wasting computer resources while not working on FxA make sure to stop the servers using `./pm2 kill`.
Once you are back working on FxA just use the `./pm2 start servers.json` command to bring the servers back up. Keep in mind that the memory store will restart and all your database data will be brand new.

#### Verifying email and viewing logs

Use the `./pm2 logs` command to get the logs of all servers. You may also use `./pm2 logs [id]` to just see the logs for that particular server.

When you signup for an account using the form on `127.0.0.1:3030/signup` the (mailer) logs will print out the verification link that you need to copy paste into your browser to verify your account locally:

![](http://i.imgur.com/oGYXSPl.png)

If you get an `error` status for any of the servers please verify that you installed all required dependencies. Otherwise file an issue on this repository.

*******
*******
*******

### Dependencies
> Required developer dependencies:
[Git](http://git-scm.com/book/en/v2/Getting-Started-Installing-Git),
[node.js **6+**, with npm 3](http://nodejs.org/),
[Python 2.6+](https://www.python.org/),
[Java 8+](https://www.java.com/en/download/),
[Redis](http://redis.io/),
[libgmp](https://gmplib.org/),
[graphicsmagick](http://www.graphicsmagick.org/),
[memcached](https://memcached.org/),
[docker](https://docs.docker.com/).

**Note:** Node.js 8 is not currently supported. Please use Node.js 6+.

##### OS X (with [Brew](http://brew.sh/)):

[Xcode and OS X Command Line Tools are required](https://developer.apple.com/xcode/), install it and verify that command line tools installed:
```
xcode-select --install
```
then:
```
brew install gmp redis graphicsmagick memcached
sudo easy_install pip && sudo pip install virtualenv
```
[Install Docker for Mac](https://docs.docker.com/docker-for-mac/install/)

##### Ubuntu:
```
sudo apt-get install build-essential git-core libgmp3-dev graphicsmagick redis-server python-virtualenv
python-dev memcached docker-ce
```

#### Installing Node.js

> NOTE: If you are experienced with Node.js: Use [nvm](https://github.com/creationix/nvm) to force node 6
just for `fxa-local-dev` using `nvm use 6`. (Install it first with `nvm install 6`)

##### OS X
Use this if you do not rely on other node.js programs on your system: Find the latest Node 6 LTS `.pkg` download at [nodejs.org/en/download/](https://nodejs.org/en/download/) and install it.

##### Ubuntu / Debian:

```
# Using Ubuntu
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs

# Using Debian, as root
curl -sL https://deb.nodesource.com/setup_6.x | bash -
apt-get install -y nodejs
```

> NOTE: Node 6 and greater require C++11, that [does not come by default on Ubuntu 12](https://github.com/nodesource/distributions/blob/master/OLDER_DISTROS.md).

#### Installing Java

> Java is used to run Selenium functional tests

##### OS X:

Download from [java.com/en/download/](https://www.java.com/en/download/)

##### Ubuntu:

```
sudo add-apt-repository ppa:webupd8team/java
sudo apt-get update
sudo apt-get install oracle-java8-installer
```

*******
*******
*******

### Firefox Custom Profile

**Use `npm start` to start Firefox with local server configurations.**
Available options:

* `FXA_ENV=local` or `latest` or `stable` or `stage` (NOTE: `local` is default).
* `FXA_E10S=true` - add this flag to turn on E10S. (NOTE: `false` by default).
* `FXA_DESKTOP_CONTEXT` - `context=` value. (NOTE: `fx_desktop_v2` is default).
* `FIREFOX_BIN=/Applications/FirefoxNightly.app/Contents/MacOS/firefox-bin npm start`
* `FIREFOX_DEBUGGER=true` - open [Browser Toolbox](https://developer.mozilla.org/en-US/docs/Tools/Browser_Toolbox) on start (NOTE: `false` by default for speed).

*******

### Functional Tests

**The following requires [the JDK](http://www.oracle.com/technetwork/java/javase/downloads/index-jsp-138363.html#javasejdk) and tests the local servers only.**

**Use `npm test` - all functional tests**

**Use `npm run test-oauth` - only OAuth functional tests**

*******

### Firefox for Android

> Skip this if you are not working on Firefox for Android and FxA.

You can test sync locally in Firefox for Android using an emulator or a device on the same network. These docs were tested with the [Genymotion](https://www.genymotion.com/download) simulator.

*  Install Firefox on the device or emulator.
*  Run `npm run start-android` this will: stop all local FxA servers, create a local PM2 configuration and rerun the servers.

The script will tell you which IP to use to work with FxA.

Follow the instructions of the script to update values in `about:config`.


*******

### Firefox for iOS

> Skip this if you are not working on Firefox for iOS and FxA.

You can test sync locally in Firefox iOS using the XCode simulator.
[Follow the steps at github.com/mozilla/firefox-ios and setup *firefox-ios* ](https://github.com/mozilla/firefox-ios) build locally.
Currently there is no way to dynamically switch servers in Firefox for iOS, to use **local** servers you need to run the script below:

```
FIREFOX_IOS_HOME=<path_to_firefox_ios_project> npm run config-fxios
```

After the script you need to rebuild *firefox-ios*.

*******


### OAuth Console Developer Accounts

> Skip this if you are not working on managing OAuth clients or working on the OAuth console.

To use the [fxa-oauth-console](https://github.com/mozilla/fxa-oauth-console) to manage OAuth clients you currently need to run the fxa-oauth-server in MySQL mode (`./pm2` runs the memory database and that does not support the OAuth console at this time). First, stop the fxa-oauth-server using `./pm2` and start MySql locally. Then `cd fxa-oauth-server` and run the 2 servers:

```
NODE_ENV=dev DB=mysql node bin/server.js
```
and
```
NODE_ENV=dev DB=mysql node bin/internal.js
```

*******

### Running with MailDev

If you want to inspect emails, you can run fxa-local-dev with [MailDev](https://www.npmjs.com/package/maildev).

#### Install
```bash
npm install maildev -g
```

#### Run
```bash
./pm2 start servers.json
./pm2 stop 0
```

Once services have started, you can start MailDev on port 9999. You might have to start MailDev with sudo permissions.

```bash
sudo maildev -s 9999
```

All emails sent can be viewed from `http://localhost:1080`.

*******

### Other tasks

* [Updating dependencies and `npm-shrinkwrap.json` files](http://fxa.readthedocs.io/en/latest/local-development/getting-started/#updating-npm-shrinkwrap).
