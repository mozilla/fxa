#!/bin/bash -ex

# Bail if we don't have a Github token - witheld for PRs from personal forks
if [ -z $STORYBOOKS_GITHUB_TOKEN ]; then
    echo "Github Personal Access Token required, skipping Storybook build"
    exit;
fi

# Config from env vars with defaults
SKIP_STORYBOOK_BUILD="${SKIP_STORYBOOK_BUILD:-false}"
PROJECT_REPO="${PROJECT_REPO:-mozilla/fxa}"
STORYBOOKS_REPO="${STORYBOOKS_REPO:-mozilla-fxa/storybooks}"
STORYBOOKS_URL="${STORYBOOKS_URL:-https://mozilla-fxa.github.io/storybooks}"
STORYBOOKS_BRANCH="${STORYBOOKS_BRANCH:-gh-pages}"
PUBLISH_ROOT="${PUBLISH_ROOT:-storybooks-publish}"
MAX_STORYBOOK_AGE="${MAX_STORYBOOK_AGE:-90}"

STORYBOOKS_REPO_URL="https://$STORYBOOKS_GITHUB_TOKEN@github.com/$STORYBOOKS_REPO.git"

# Context for current build
COMMIT_HASH=$(git rev-parse HEAD)

# Build all the available storybooks relevant to packages/test.list
if [ "$SKIP_STORYBOOK_BUILD" == false ]; then
    STORYBOOKS=$(find packages -maxdepth 2 -type d -name '.storybook');
    for STORYBOOK_PATH in $STORYBOOKS; do
        PACKAGE_DIR=$(dirname $STORYBOOK_PATH)
        PACKAGE_NAME=$(basename $PACKAGE_DIR)
        if grep -e "$PACKAGE_NAME" -e 'all' "./packages/test.list" > /dev/null; then
            pushd $PACKAGE_DIR;
            rm -rf storybook-static;
            yarn workspaces focus $PACKAGE_NAME
            yarn run build-storybook;
            popd
        fi;
    done;
fi

# Check if any storybooks were built, bail if not
if [[ -z $(find ./packages -type d -name 'storybook-static') ]]; then
    echo "No Storybooks built, skipping the rest of deployment."
    exit 0;
fi

# Get a fresh checkout of the repo to which we'll publish
rm -rf $PUBLISH_ROOT
git clone --branch $STORYBOOKS_BRANCH $STORYBOOKS_REPO_URL $PUBLISH_ROOT
mkdir -p $PUBLISH_ROOT/{commits,pulls}

# Copy all the storybooks into the publish directory for commit.
COMMIT_PATH="$PUBLISH_ROOT/commits/$COMMIT_HASH"
rm -rf $COMMIT_PATH
mkdir -p $COMMIT_PATH
for STORYBOOK_DIR in $(find ./packages -type d -name 'storybook-static'); do
    PACKAGE_NAME=$(basename $(dirname $STORYBOOK_DIR));
    BUILD_PATH="$COMMIT_PATH/$PACKAGE_NAME";
    cp -r $STORYBOOK_DIR $BUILD_PATH
done

# HACK: fixup some generated CSS paths to static media that break since the
# storybooks are no longer at the root of the site. Would be better to
# figure out how to reconfigure storybook to do this, but I got here faster
for CSS_FN in $(find $COMMIT_PATH -type f -name 'main*.css'); do
    sed --in-place 's:url(static/:url(../../static/:g' $CSS_FN
done

# Capture git logs for current commit as summary & description.
git log -n 1 --no-color --pretty='%s' > $COMMIT_PATH/summary.txt
git log -n 1 --no-color --pretty=medium > $COMMIT_PATH/description.txt

# If this is a pull request, note a reference to the commit hash for the PR
if [[ ! -z $CI_PULL_REQUEST ]]; then
    PR_NUMBER=$(echo $CI_PULL_REQUEST | cut -d/ -f7);
    PULL_PATH="$PUBLISH_ROOT/pulls/$PR_NUMBER";
    mkdir -p $PULL_PATH;
    cp $COMMIT_PATH/*.txt $PULL_PATH/
    echo $COMMIT_HASH > $PULL_PATH/commit.txt;
fi;

# Delete storybooks older than 90 days
find $PUBLISH_ROOT/commits $PUBLISH_ROOT/pulls -mindepth 1 -maxdepth 1 \
    -type d -ctime +$MAX_STORYBOOK_AGE -exec rm -rf {} \;

# Build index.html for root, commits, and pulls
./_scripts/build-storybooks-indexes.js $PUBLISH_ROOT

# Check for changes
cd $PUBLISH_ROOT
CHANGES=$(git status --porcelain)
if [ "$CHANGES" = "" ]; then
    echo "Storybooks are unchanged, not deploying to GitHub Pages."
    exit 0
fi

# Finally, deploy the publish directory to gh-pages.
echo "Deploying Storybooks to GitHub Pages."
git config user.name "fxa-devs"
git config user.email "fxa-core@mozilla.com"
git add -A .
git commit -qm "chore(docs): rebuild storybooks for ${COMMIT_HASH} [skip ci]"
git push -q origin gh-pages

# If this is a pull request, post a comment to the PR linking to the storybooks
if [[ ! -z $CI_PULL_REQUEST ]]; then
    PR_NUMBER=$(echo $CI_PULL_REQUEST | cut -d/ -f7);
    PR_URL="$STORYBOOKS_URL/pulls/$PR_NUMBER/";
    COMMIT_URL="$STORYBOOKS_URL/commits/$COMMIT_HASH/";
    curl \
        -H'Content-Type: application/json' \
        -H"Authorization: token $STORYBOOKS_GITHUB_TOKEN" \
        --data "{\"state\":\"success\",\"target_url\":\"$COMMIT_URL\",\"context\":\"storybooks\",\"description\":\"Storybook Deployment\"}" \
        https://api.github.com/repos/${PROJECT_REPO}/statuses/${COMMIT_HASH};
fi

echo "Cleaning up $PUBLISH_ROOT"
cd ..
rm -rf $PUBLISH_ROOT
