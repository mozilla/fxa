## fxa-local-dev [![Build Status](https://travis-ci.org/vladikoff/fxa-local-dev.svg?branch=master)](https://travis-ci.org/vladikoff/fxa-local-dev)
> An easy way to contribute to Firefox Accounts

### Getting Started

- Install required system [dependencies](#dependencies)
- Clone this repository and run `npm install`. Here is the full command:
```
git clone https://github.com/vladikoff/fxa-local-dev.git && cd fxa-local-dev && npm i
``` 

After installation completes you can visit [127.0.0.1:3030](http://127.0.0.1:3030/) and use the [PM2 tool](https://github.com/Unitech/PM2#main-features) to start, stop and read server logs.  Most common commands are as follows:

- `./pm2 start servers.json` **- start all servers.** 
- ^ (WARNING: running the above command multiple times will spawn more of the same servers).
- `./pm2 kill` **- stop all servers.**
- `./pm2 status` - display running servers. 
- `./pm2 logs` - logs for all servers (note: this must be used to verify accounts).
- `./pm2 logs 1` - display logs for process `1`.
- More commands on the [PM2 Readme](https://github.com/Unitech/PM2#main-features).

**Use `npm run update` to fetch the latest changes on the `master` branch.**

**Use `npm start` to start Firefox with local sync configurations.**
Available options:

* `FXA_ENV=local` or `latest` or `stable` (NOTE: `local` is default).
* `FIREFOX_BIN=/Applications/FirefoxNightly.app/Contents/MacOS/firefox-bin npm start`

### Workflow

This is an example workflow for **fxa-local-dev**. After installing **fxa-local-dev** the servers should automatically start up. Use `./pm2 status` command to check the status of the servers: 

![](http://i.imgur.com/eqL8FiZ.png)

To avoid wasting computer resources while not working on FxA make sure to stop the servers using `./pm2 kill`.
Once you are back working on FxA just use the `./pm2 start servers.json` command to bring the servers back up. Keep in mind that the memory store will restart and all your database data will be brand new.

Use the `./pm2 logs` command to get the logs of all servers. You may also use `./pm2 logs [id]` to just see the logs for that particular server. When you signup for an account via `localhost:3030/signup` the `auth-server` logs will print out the verification link that you need to copy paste into your browser to verify your account:

![](http://i.imgur.com/oGYXSPl.png)

If you get an `error` status for any of the servers please verify that you installed all required dependencies. Otherwise file an issue on this repository.  

### Dependencies

[Git](http://git-scm.com/book/en/v2/Getting-Started-Installing-Git), 
[node.js](http://nodejs.org/), 
[Python 2.6+](https://www.python.org/), 
[Redis](http://redis.io/), 
[libgmp](https://gmplib.org/),
[graphicsmagick](http://www.graphicsmagick.org/).

#### OSX (with [Brew](http://brew.sh/)): 
##### `brew install gmp redis graphicsmagick`
##### `sudo easy_install pip && sudo pip install virtualenv` 

(You might also need to run `xcode-select --install` to get OS X Command Line Tools)

#### Ubuntu: 
####### `sudo apt-get install libgmp3-dev graphicsmagick redis-server python-virtualenv python-dev`

#### FreeBSD: 
Use [bigint fix](https://github.com/substack/node-bigint/pull/29): `"bigint": "git://github.com/frasertweedale/node-bigint.git#fix/freebsd-build"`
