## fxa-local-dev
> An easy way to contribute to Firefox Accounts

[![Build Status](https://travis-ci.org/vladikoff/fxa-local-dev.svg?branch=master)](https://travis-ci.org/vladikoff/fxa-local-dev)

### Getting Started

- Install required system [dependencies](#dependencies)
- Clone this repository and run `npm install`.
```
git clone https://github.com/vladikoff/fxa-local-dev.git && cd fxa-local-dev && npm i
``` 

- Run `pm2 status` to display running servers, such as [127.0.0.1:3030](http://127.0.0.1:3030/) and [127.0.0.1:8080](http://127.0.0.1:8080/). 
- Run `pm2 logs` and make sure there are no startup errors from the servers.


### Dependencies

[Git](http://git-scm.com/book/en/v2/Getting-Started-Installing-Git), [node.js](http://nodejs.org/), Redis, libgmp.

#### OSX (with [Brew](http://brew.sh/))

```
brew install gmp redis
```

(You might also need to run `xcode-select --install` to get OS X Command Line Tools)

#### Ubuntu

```
sudo apt-get install libgmp3-dev redis-server
```
