## A demo of Firefox Accounts OAuth

## Running locally

1. Complete prerequisites for running [FxA](https://github.com/mozilla/fxa#getting-started)
1. Run the server: `yarn start`
1. Visit it in your browser: `http://localhost:8080/`
1. Hack and reload! (web resources don't require a server restart)

### Ansible Deployment

See [fxa-dev 123done](https://github.com/mozilla/fxa-dev/tree/docker/roles/rp) Ansible configuration for details.

### Heroku Deployment

1. Signup for heroku
1. Install [heroku cli](https://devcenter.heroku.com/articles/heroku-cli) and login
1. Create [heroku app](https://devcenter.heroku.com/articles/creating-apps) for 123done trusted and untrusted clients
1. Create a new [config](https://github.com/mozilla/fxa/blob/1dd1b038d4d7eb7fbb697f3ef49f4a93e7f1145f/packages/123done/config.json) for each 123done app
1. Set heroku app env value `CONFIG_123DONE=relative/path/to/config` for each app
1. Add heroku multipack support `heroku buildpacks:add -a <app> https://github.com/heroku/heroku-buildpack-multi-procfile`
1. Set heroku app env value `PROCFILE=relative/path/to/Procfile/in/your/codebase`
1. Deploy with `git push heroku main`

## Testing

This package does not currently have a test suite.

Run `npm test` to lint the code.
