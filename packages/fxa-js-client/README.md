gherkin
=======

[![Build Status](https://travis-ci.org/mozilla/gherkin.png)](https://travis-ci.org/mozilla/gherkin)

Web client that talks to the Firefox Accounts API server


## Build Library

```
npm install
npm start
```

The `build` directory should have `gherkin.js` and `gherkin.min.js`.

## Usage

```
<script src="../build/gherkin.js"></script>
var client = new FxAccountClient();
```
