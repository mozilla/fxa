## fxa-local-dev
> An easy way to contribute to Firefox Accounts

### Getting Started

1. Install required system [dependencies](#dependencies)
1. Clone this repository and run `npm install`.
```
git clone https://github.com/vladikoff/fxa-local-dev.git && fxa-local-dev && npm i
```
1. Run `pm2 logs` and make sure there are no startup errors from the servers.
1. Run `pm2 status` to display running servers, such as [127.0.0.1:3030](http://127.0.0.1:3030/) and [127.0.0.1:8080](http://127.0.0.1:8080/). 

### Dependencies

[Git](http://git-scm.com/book/en/v2/Getting-Started-Installing-Git), [node.js](http://nodejs.org/), Redis, libgmp.

#### OSX (with [Brew](http://brew.sh/))

```
brew install gmp redis
```

(You might also need to run `xcode-select --install` to get OS X Command Line Tools)

#### Ubuntu

```
sudo apt-get install libgmp3-dev
```
