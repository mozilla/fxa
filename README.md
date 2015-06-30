## fxa-local-dev [![Build Status](https://travis-ci.org/mozilla/fxa-local-dev.svg?branch=master)](https://travis-ci.org/mozilla/fxa-local-dev) ![](https://img.shields.io/badge/tested_on-OS%20X%20and_Ubuntu-brightgreen.svg)
> An easy way to contribute to Firefox Accounts

### Getting Started

1. Manually install the system [dependencies](#dependencies).

2. Clone this repository.

   ```sh
   git clone git@github.com:mozilla/fxa-local-dev.git
   ```

3. Run `npm install`.

   ```sh
   cd fxa-local-dev
   npm i
   ```

4. Visit [127.0.0.1:3030](http://127.0.0.1:3030/).

5. Use the [PM2 tool](https://github.com/Unitech/PM2#main-features) to stop and start the servers, and read server logs.

   The most common commands are:

   - `./pm2 start servers.json` **- start all servers.**

     - WARNING: does not stop running servers, running multiple times spawns more of the same.

   - `./pm2 kill` **- stop all servers.**

   - `./pm2 status` - display running servers.

   - `./pm2 logs` - logs for all servers (note: this must be used to verify accounts).

   - `./pm2 logs 1` - display logs for process `1`.

   - `./pm2 stop 1` - stop process `1`.

   - `./pm2 restart 1` - restart process `1`.

   - More commands in the [PM2 Readme](https://github.com/Unitech/PM2#main-features).

6. When you want to [fetch the latest changes](_scripts/update_all.sh) to all servers:

   ```sh
   npm run update
   ```

#### Troubleshooting

1. For errors during `npm install` (specifically fxa-content-server), or if some servers fail to start:

   ```sh
   ulimit -n 2560
   ```

2. If fxa-content-server fails with this message:

   ```
   Error: env: must be one of the possible values: ["dev","test","stage","prod"]: value was "development"
   ```

   It means you probably have the `NODE_ENV` environment variable set. Run `unset NODE_ENV` (or the equivalent for your shell) then restart the servers:

   ```sh
   ./pm2 kill
   ./pm2 start servers.json
   ```

*******

### Firefox Custom Profile

**Use `npm start` to start Firefox with local server configurations.**
Available options:

* `FXA_ENV=local` or `latest` or `stable` (NOTE: `local` is default).
* `FIREFOX_BIN=/Applications/FirefoxNightly.app/Contents/MacOS/firefox-bin npm start`

*******

### Functional Tests

**The following requires [the JDK](http://www.oracle.com/technetwork/java/javase/downloads/index-jsp-138363.html#javasejdk) and tests the local servers only.**

**Use `npm test` - all functional tests**

**Use `npm run test-oauth` - only OAuth functional tests**

*******

### Workflow
> This is an example workflow for **fxa-local-dev**.

After installing **fxa-local-dev** the servers should automatically start up. Use `./pm2 status` command to check the status of the servers:

![](http://i.imgur.com/eqL8FiZ.png)

To avoid wasting computer resources while not working on FxA make sure to stop the servers using `./pm2 kill`.
Once you are back working on FxA just use the `./pm2 start servers.json` command to bring the servers back up. Keep in mind that the memory store will restart and all your database data will be brand new.

Use the `./pm2 logs` command to get the logs of all servers. You may also use `./pm2 logs [id]` to just see the logs for that particular server. When you signup for an account via `localhost:3030/signup` the `auth-server` logs will print out the verification link that you need to copy paste into your browser to verify your account:

![](http://i.imgur.com/oGYXSPl.png)

If you get an `error` status for any of the servers please verify that you installed all required dependencies. Otherwise file an issue on this repository.

*******

### Dependencies
> Required dependencies:
[Git](http://git-scm.com/book/en/v2/Getting-Started-Installing-Git),
[node.js **0.10** with npm 2.4+](http://nodejs.org/),
[Python 2.6+](https://www.python.org/),
[Redis](http://redis.io/),
[libgmp](https://gmplib.org/),
[graphicsmagick](http://www.graphicsmagick.org/).

##### OS X (with [Brew](http://brew.sh/)):

[Xcode and OS X Command Line Tools are required](https://developer.apple.com/xcode/), install it and verify that command line tools installed:
```
xcode-select --install
```
then:
```
brew install gmp redis graphicsmagick
sudo easy_install pip && sudo pip install virtualenv
```

##### Ubuntu:
```
sudo apt-get install build-essential git-core libgmp3-dev graphicsmagick redis-server python-virtualenv python-dev
```

#### Installing Node.js
##### OS X
Find the latest `node-v0.10.x.pkg` at [nodejs.org/dist/](http://nodejs.org/dist/) and install. Example [node-v0.10.38.pkg](http://nodejs.org/dist/v0.10.38/node-v0.10.38.pkg)

##### Ubuntu:

```
curl -sL https://deb.nodesource.com/setup_0.10 | sudo bash -
sudo apt-get install -y nodejs
```

#### Updating NPM
> Check your npm version using `npm --version`. If it is lower than 2.4 then please upgrade.

All OS:
```
sudo npm install -g npm@2.4
```

#### Installing Java

##### OS X:

Download from [java.com/en/download/](https://www.java.com/en/download/)

##### Ubuntu:

```
sudo add-apt-repository ppa:webupd8team/java
sudo apt-get update
sudo apt-get install oracle-java7-installer
```

*******
