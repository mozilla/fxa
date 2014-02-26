# Templates #

To fetch all templates from the fxa-content-server.
See https://github.com/mozilla/fxa-auth-server/pull/567 for more info.

Firstly, add the languages found in `fetch-templates-from-content-server.js` to your
`server/config/local.json`.

Then start the fxa-content-server:

```
$ cd fxa-content-server
$ npm start
```

Back here, run this script:

```
$ node fetch-templates-from-content-server.js
```

Then add all of the `*.json` files to the repo. This is horrible, but it is temporary:

```
$ git add *.json
$ git commit -m 'Update all the initial localised templates'
```

(Ends)
