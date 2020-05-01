# fxa-circleci

This is the base image used for circleci tests and includes dependencies required for selenium testing with specific versions of firefox.

This image is not built alongside other package images because it doesn't fit well within the deployment flow of the services themselves and it should rarely change.

To deploy, push your changes to github then trigger a circleci job using the api like so:

```sh
curl -u $CIRCLECI_API_TOKEN \
     -d build_parameters[CIRCLE_JOB]='build-and-deploy-fxa-circleci' \
     https://circleci.com/api/v1.1/project/github/mozilla/fxa/tree/$GITHUB_BRANCH
```

- `$CIRCLECI_API_TOKEN` is your personal API token from https://app.circleci.com/settings/user/tokens
- `$GITHUB_BRANCH` is the branch you'd like to build & deploy to docker hub (this may be `master`)
