## A demo of Firefox Accounts OAuth

## Running locally

1. Complete prerequisites for running [FxA](https://github.com/mozilla/fxa#getting-started)
1. Run the server: `yarn start`
1. Visit it in your browser: `http://localhost:8080/`
1. Hack and reload! (web resources don't require a server restart)

### Ansible Deployment

See [fxa-dev 123done](https://github.com/mozilla/fxa-dev/tree/docker/roles/rp) Ansible configuration for details.

### Heroku Deployment

#### Before you begin

- This process is to deploy an existing FxA-integrated Heroku application. Separate steps are required to create a new Heroku app integrated with FxA, including updating the client URL redirect values in the FxA OAuth database.
- Unless your tests require the untrusted 123Done app, you may just need to deploy the 123Done trusted app to stage and prod (i.e. deploy two instead of all four apps).

#### Instructions

1. Sign up for Heroku at https://sso.heroku.com/login

- Note: You must be part of the Mozilla SSO `heroku-members` access group, otherwise you'll get a message "Unable to locate an identity provider. Please check your email address."
  - File a bug like this one: https://bugzilla.mozilla.org/show_bug.cgi?id=1830343
  - You can see who is a Curator with add permissions here: https://people.mozilla.org/a/heroku-members/.
  - There are some additional one-time steps to complete as referenced in the Access Group invitation email.

2. Install [heroku cli](https://devcenter.heroku.com/articles/heroku-cli) and login

- `heroku login`

3. Ensure access to 123Done apps

- Search for and have a `mozillacorporation` member [grant access](https://devcenter.heroku.com/articles/collaborating) (view, deploy, operate, manage) to following apps:
  - `production-123done`
  - `production-123done-untrusted`
  - `stage-123done`
  - `stage-123done-untrusted`
- You'll get an invitation email for each app.
- Why are there four apps?
  - There is a trusted and an untrusted OAuth RP app for each environment to test trusted and untrusted OAuth flows.

4. Clone each app on the command line that you need to deploy with the provided instructions in the invitation email.

- E.g. `heroku git:clone -a stage-123done`
- Note: While app config for stage is in the 123Done package in our FxA monorepo, prod config is in environment variables in the Heroku dashboard to avoid exposing the OAuth client secret.

5. Deploy app

- In the `fxa` repo, checkout branch `origin/heroku-updates` and create and checkout a local branch of the same name.
  - This branch contains different root level `package.json` commands and/or (dev)dependencies that reduce the size of the Heroku deploy slug. There are limits to the size that can be deployed.
  - The main differences are the `install` run script and to avoid the `check-package-manager.sh` script, since the command uses `npm` instead of `yarn`.
    - Note: Heroku is compatible with `yarn`, but at the time of writing, only `npm` worked correctly.
- Rebase `train-XXX` branch
  - `git rebase origin/train-XXX`
    - `XXX` is the train for the environment you want to deploy in.
- Create a remote for your local repository for each app you want to deploy.
  - E.g. `heroku git:remote -a stage-123done`
- Deploy
  - `git push <heroku remote origin> heroku-updates:main -f`
    - Force push is needed here because of the commit with changes to `package.json`
    - `<heroku remote origin>` is the git remote linked to the version of the heroku app you're deploying, i.e. stage/production and trusted/untrusted.
    - N.B. There may have been breaking changes to the `fxa` root `package.json` since the last 123Done deploy. Confer with the team, but if needed, the root `package.json` can be modified and the last commit amended. Then retry the command.

6. Push changes to back to FxA repo

- `git push origin heroku-updates -f`

## Testing

This package does not currently have a test suite.

Run `npm test` to lint the code.
