## A demo of Firefox Accounts OAuth

## Running locally

1. Complete prerequisites for running [FxA](https://github.com/mozilla/fxa#getting-started)
1. Create a `secrets.json` file in 123done root folder and specify the `client_secret` value.
1. Run the server: `yarn start`
1. Visit it in your browser: `http://localhost:8080/`
1. Hack and reload! (web resources don't require a server restart)

### Ansible Deployment

See [fxa-dev 123done](https://github.com/mozilla/fxa-dev/tree/docker/roles/rp) Ansible configuration for details.

### Heroku Deployment

#### Before you begin

- This process is to deploy an existing FxA-integrated Heroku application. Separate steps are required to create a new Heroku app integrated with FxA, including updating the client URL redirect values in the FxA OAuth database.
- Unless your tests require the untrusted 123Done app, you may just need to deploy the 123Done trusted app to stage and prod (i.e. deploy two instead of all four apps).

#### How it works

123Done is self-contained (it has no monorepo imports), so it deploys as a standalone slug:
only the `packages/123done` subtree is published as the Heroku app's git root. The slug's
`package.json` is 123Done's own, so `npm install` pulls just its dependencies, and the standard
root `Procfile` (`web: node server.js`) starts it. There are no root-`package.json` overrides
and no shared deploy branch to maintain.

#### Account and access

1. Sign up for Heroku at https://sso.heroku.com/login

- Note: You must be part of the Mozilla SSO `heroku-members` access group, otherwise you'll get a message "Unable to locate an identity provider. Please check your email address."
  - File a bug like this one: https://bugzilla.mozilla.org/show_bug.cgi?id=1830343
  - You can see who is a Curator with add permissions here: https://people.mozilla.org/a/heroku-members/.
  - There are some additional one-time steps to complete as referenced in the Access Group invitation email.

2. Install [heroku cli](https://devcenter.heroku.com/articles/heroku-cli) and login: `heroku login`

3. Ensure access to the 123Done apps. Have a `mozillacorporation` member [grant access](https://devcenter.heroku.com/articles/collaborating) (view, deploy, operate, manage) to the apps you need:

- `production-123done`
- `production-123done-untrusted`
- `stage-123done`
- `stage-123done-untrusted`
- There is a trusted and an untrusted OAuth RP app per environment to test both flows; unless your tests require the untrusted app, you may only need the two trusted apps.

#### One-time app setup (per app)

The subtree deploy uses the plain Node buildpack and the standard root `Procfile`. Apps that
previously deployed from the monorepo root used the multi-procfile buildpack with a `PROCFILE`
config var, so reconfigure each of those once:

```sh
heroku buildpacks:clear -a stage-123done
heroku buildpacks:set heroku/nodejs -a stage-123done
heroku config:unset PROCFILE -a stage-123done
```

These commands are required for an app that previously used the multi-procfile buildpack, and a
harmless no-op on a brand-new app (which auto-detects the Node buildpack from `package.json`).

#### Config vars (per app)

`config.js` reads its configuration from these env vars. Set them on the app (Heroku dashboard
or `heroku config:set`); never commit secret values to the repo.

- `CLIENT_ID`, `CLIENT_SECRET_123DONE` — OAuth client id and secret
- `REDIRECT_URI`, `ISSUER_URI`, `SCOPES`
- `PKCE_CLIENT_ID`, `PKCE_REDIRECT_URI`
- `COOKIE_SECRET`, `COOKIE_NAME`
- `PORT` is provided by Heroku automatically.

Heads up on older apps: some set the client secret as `CLIENT_SECRET` and omit `SCOPES` /
`COOKIE_*`. The current code reads `CLIENT_SECRET_123DONE`, so check `heroku config -a <app>`
and rename or add the vars to match the names above. If they do not match, the app still boots
but the OAuth token exchange fails. Keep the client secret only in Heroku config vars.

#### Deploy

1. Check out the branch/ref that contains the 123Done code you want to ship (the deploy reads
   `packages/123done` from that ref). For a normal release this is the train branch.
2. Add a git remote for the target app: `heroku git:remote -a stage-123done` (creates a remote
   named `heroku`).
3. Run the deploy script from anywhere in the repo. It deploys your current `HEAD` by default,
   or pass an explicit ref as the second argument:

```sh
# deploy the current checkout
packages/123done/scripts/deploy-heroku.sh heroku

# or deploy a specific ref (must be fetched locally)
packages/123done/scripts/deploy-heroku.sh heroku train-XXX
```

The script builds a slug-root commit from the `packages/123done` tree at that ref (via git
plumbing, so it is instant regardless of monorepo size), stamps a `version.json` so
`/__version__` reports the source commit, then **confirms the resolved remote URL before
force-pushing** to the app's `main`. It does not create or rewrite any shared branch. Set
`DEPLOY_YES=1` to skip the prompt for non-interactive use. Repeat per app, pointing the remote
at the right app (stage/prod, trusted/untrusted).

#### Verify

```sh
heroku ps -a stage-123done                          # web dyno "up", running `node server.js`
curl https://stage-123done.herokuapp.com/__version__ # "commit" matches the deployed source ref
```

Then open the app in a browser and complete a sign-in to confirm the OAuth flow end to end.

## Testing

This package does not currently have a test suite.

Run `npm test` to lint the code.
