#!/bin/bash -e

echo "Running base install!"
echo " . Base commit reference: $(cat base_ref)"
echo " . Current commit reference: $(git rev-parse HEAD)"
echo " . Force yarn install: $FORCE_YARN_INSTALL"
echo -e '\n\n'

# Only run yarn install if there are changes in the lock file or the env, FORCE_YARN_INSTALL,
# indicates a yarn install must be run. The file yarn.lock.base as well as node_modules and
# the yarn cache are now part of the base docker image and represents the last known good state
# of the main branch. If there is no change to the lock file, there is no point in rebuilding,
# and we can use the last known good state.

if [[ $FORCE_YARN_INSTALL == 'true' ]]; then

    # This is just here as safety net, in case we encounter an issue with base image state and
    # need to force an install.
    echo 'Forcing yarn install because FORCE_YARN_INSTALL == true.'
    echo -e '\n\n'
    set -x
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 yarn install --immutable --inline-builds;

elif ! cmp --silent yarn.lock yarn.lock.base; then
    echo '=============================================================================='
    echo 'IMPORTANT! Changes detected on yarn.lock.'
    echo '------------------------------------------------------------------------------'
    echo 'Note that pipelines execute faster if we can skip the yarn install step.'
    echo 'This is possible when lock files are in sync with latest build from main.'
    echo 'If there is no direct reason why the lockfile should change, please consider'
    echo 'rebasing on main, it may improve CI run times!'
    echo '=============================================================================='
    echo -e '\n\n'


    # There are a couple tricks here:
    #  1. Skip playwright browser install. We can do this because it's already been done in the base image. Installing
    #     the browser introduces quite a bit of overhead.
    #  2. Add inline-builds. This prints out extra info about what is happening during the build step, this might provide
    #     some insight into whether or not a build is repeatedly failing, or if an package is introducing a lot of overhead
    #     during install.
    set -x
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 yarn install --immutable --inline-builds;
else
    echo '=============================================================================='
    echo 'Congrats! No changes detected on yarn.lock.'
    echo '------------------------------------------------------------------------------'
    echo 'Skipping yarn install!\n'
    echo '=============================================================================='
    echo -e '\n\n'
fi
