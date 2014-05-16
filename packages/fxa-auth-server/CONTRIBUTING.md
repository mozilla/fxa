# Contributing #

Anyone is welcome to help with Firefox Accounts. Feel free to get in touch with other community members on IRC, the
mailing list or through issues here on GitHub.

* IRC: `#fxa` on `irc.mozilla.org`
* Mailing list: [https://mail.mozilla.org/listinfo/dev-fxacct](https://mail.mozilla.org/listinfo/dev-fxacct)
* and of course, [the issues list](https://github.com/mozilla/fxa-auth-server/issues)

## Bug Reports ##

You can file issues here on GitHub. Please try to include as much information as you can and under what conditions
you saw the issue.

## Sending Pull Requests ##

Patches should be submitted as pull requests. When submitting patches as PRs:

 * You agree to license your code under the project's open source license (MPL 2.0).
 * Base your branch off the current `master` (see below for an example workflow).
 * Add both your code and new tests if relevant.
 * Run `grunt jshint` to make sure your code passes linting.
 * Run `npm test` to make sure all tests still pass.
 * Please do not include merge commits in pull requests; include only commits with the new relevant code.
 * Add yourself to the `AUTHORS` file so we can publically recognize your contribution.

See the main `README.md` for information on prerequisites, installing, running and testing.

## Example Workflow ##

This is an example workflow to make it easier to submit Pull Requests.

1) Fork this repository via the GitHub interface

2) Clone your copy locally:

```
$ git clone git@github.com:<username>/fxa-auth-server.git
$ cd fxa-auth-server
```

3) Add this repo as upstream:

```
$ git remote add upstream https://github.com/mozilla/fxa-auth-server.git
```

4) Create a branch for your fix/feature:

```
$ git branch add-new-feature
```

5) Add/fix code, add tests then commit and push this branch to your repo:

```
$ git add <files...>
$ git commit -m '<your message>'
$ git push origin add-new-feature
```

6) From the GitHub interface for your repo, click the `Review Changes and Pull Request` which appears next to your new branch.

7) Click `Send pull request`.

The main reason for creating a new branch for each feature or fix is so that you can track master correctly. If you need
to fetch the latest code for a new fix, try the following once on your master branch:

```
$ git checkout master
$ git fetch upstream
$ git rebase origin/master
```

And keep your own GitHub master up to date:

```
$ git push origin master
```

And now you're ready to branch again for your new feature (from step 4 above).
