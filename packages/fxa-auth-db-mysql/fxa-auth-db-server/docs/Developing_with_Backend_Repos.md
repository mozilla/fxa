# Developing with Backend Repos #

The FxA project currently has three repos related to the database backend. This repo (fxa-auth-db-server) holds the
common server and common tests that each storage backend uses. The current (two) storage backends that use this
repo are:

* fxa-auth-db-mem (generally for testing purposes)
* fxa-auth-db-mysql (for development and production)

(Where 'development' here means for these three repos, not necessarily for the fxa-auth-server.)

## New Features ##

There is a reasonably close relationship between these three repos, so when a new feature needs to be added to
the `fxa-auth-db-server`, `fxa-auth-db-mem` and `fxa-auth-db-mysql` it can be tricky to figure out the best
way of proceeding. The following instructions provide an example of how this can be achieved (but not specifically
the _only_ way this can be achieved).

## Assumptions #

From here, we're going to assume that you have:

1. all three repos checked out into three directories (named after themselves)
2. the ability to run the `npm test` command in all three repos
3. the ability to run the `npm start` command in the storage repos

## Creating your Branches #

Assume we're going to create the feature "#1 - Add New Operation" (whatever that operation is). Let's branch in each
repo:

```sh
$ git branch i1-add-new-operation
$ git checkout i1-add-new-operation
Switched to branch 'i1-add-new-operation'
```

Then, install any packages and test:

```sh
$ npm install
...
$ npm test
ok
```

## Developing ##

When developing, you are probably changing code in the server AND in each storage backend, so in both of the backend repos
you should point your `node_modules/fxa-auth-db-server` to the checked out version above.

```sh
$ cd fxa-auth-db-<backend>/node_modules
$ rm -rf fxa-auth-db-server
$ ln -s ../../fxa-auth-db-server .
```

Once this has been done, you should only run `npm install` for the `fxa-auth-db-server` repo when in it's own
directory. Also, just run `npm install <pkg>` in the backend repos, rather than a plain `npm install`.

## Updates to `package.json` (and therefore `npm-shrinkwrap.json`) ##

Do not change the dependency url of the `fxa-auth-db-server` repo in `package.json` (for your storage repos) as you are
developing. Generally, because you have linked your development version here, you won't need to change this.

If you need a new dependency in any repo, just add it to `package.json` as you normally would during development.

## Finishing off the Branch ##

When finishing off the branch, commit your final changes and only then should you re-create your `npm-shrinkwrap.json`
files. This should be done as a separate commit as the last commit of the branch. This just keeps these generated changes
separate to the rest of your changed (even though they will still show up in the pull request).

You should regenerate the `fxa-auth-db-server/npm-shrinkwrap.json` file first, and the storage repos afterwards.

The following commands allow you to have complete control over this regeneration.

```sh
$ rm -rf node_modules/
$ npm cache clean
$ rm npm-shrinkwrap.json
$ npm install
$ npm shrinkwrap --dev
```

When you have done that for each branch, you want Travis to pass when you send your Pull Request. Firstly, push the
branch for the `fxa-auth-db-server` (and create a PR), then set the `package.json` file in each storage backend to
reference this new branch. When these branches are made into a PR, they should use the correct `fxa-auth-db-server`
branch so that the test on Travis goes correctly.

## Review and Merge ##

When merging, the `fxa-auth-db-server` should be merged first, then the branches in each storage backend can be changed
back to point to the master branch of the db-server. At this point, they will still pass Travis on the branch and will
be fine once merged into master.

Note: anytime `package.json` is changed, the above set of shrinkwrap commands should be performed.

(Ends)
