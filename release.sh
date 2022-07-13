#!/usr/bin/env bash

set -e
IFS=$'\n'

# Please use this script in conjunction with the release documentation:
# https://mozilla.github.io/ecosystem-platform/docs/fxa-engineering/release-process
#
# Tagging should always be done with this script lest uniformity is broken.
#
# Note that this script DOES NOT PUSH TO ANY REMOTES. It is expected that a
# human will verify the results before doing that step and opening any pull
# requests.
#
# Usage:
#
#   release.sh [patch]
#
# If no argument is specified, the main train number will be bumped. If the
# argument `patch` is specified, the patch number will be bumped. Any other
# argument is invalid.
#
# Steps:
#
#   1. Check the argument is valid.
#   2. Check there are no local changes.
#   3. Find the last tag.
#   4. Check there have been some commits since the last tag.
#   5. Generate the bumped version string.
#   6. If current branch is train branch, pull from origin.
#   7. Otherwise checkout existing train branch or create fresh one from main.
#   9. Update the AUTHORS file
#   10. Commit changes.
#   11. Create a tag.
#   12. Tell the user what we did.

SCRIPT_DIR=`dirname "$0"`/_scripts
CURRENT_BRANCH=`git branch --no-color | grep '^\*' | cut -d ' ' -f 2`
FXA_REPO="https://github.com/mozilla/fxa"

abort() {
  git checkout "$CURRENT_BRANCH" > /dev/null 2>&1
  echo "Release aborted: $1."
  exit 1
}

# 1. Check the argument is valid.
case "$1" in
  "")
    BUILD_TYPE="Train"
    ;;
  "patch")
    BUILD_TYPE="Patch"
    ;;
  *)
    abort "Invalid argument \"$1\""
    ;;
esac

# 2. Check there are no local changes.
STATUS=`git status --porcelain`
if [ "$STATUS" != "" ]; then
  abort "You have uncommited changes"
fi

# 3. Find the last tag.
if [ "$BUILD_TYPE" = "Train" ]; then
  # Last tag is the last recently created tag when starting a train
  # HACK: filter out any tags with hyphens - these are feature branch releases
  LAST_TAG=`git tag -l --sort=version:refname | grep -v '-' | tail -1`
else
  if [ $CURRENT_BRANCH = "main" ]; then
    abort "You're trying to create a patch release on main. Please check out the latest train branch."
  fi

  # Current tag is last tag, when we're on a train branch for a patch
  LAST_TAG=`git describe --tags --first-parent --abbrev=0`
fi

# 4. Check there have been some commits since the last tag.
COMMITS=`git log $LAST_TAG..HEAD --pretty=oneline --abbrev-commit`
if [ "$COMMITS" = "" ]; then
  abort "I see no work"
fi

MAJOR=`echo "$LAST_TAG" | cut -d '.' -f 1 | cut -d 'v' -f 2`
TRAIN=`echo "$LAST_TAG" | cut -d '.' -f 2`
PATCH=`echo "$LAST_TAG" | cut -d '.' -f 3 | cut -d '-' -f 1`

LAST_VERSION="$MAJOR.$TRAIN.$PATCH"

# 5. Generate the bumped version string.
case "$BUILD_TYPE" in
  "Train")
    TRAIN=`expr $TRAIN + 1`
    PATCH=0
    ;;
  "Patch")
    PATCH=`expr $PATCH + 1`
    ;;
esac
NEW_VERSION="$MAJOR.$TRAIN.$PATCH"
NEW_TAG="v$NEW_VERSION"

# 6. If current branch is train branch, pull from origin.
TRAIN_BRANCH="train-$TRAIN"
if [ "$CURRENT_BRANCH" = "$TRAIN_BRANCH" ]; then
  git pull origin "$TRAIN_BRANCH" > /dev/null 2>&1 || true
else
  # 7. Otherwise checkout existing train branch or create fresh one from main.
  TRAIN_BRANCH_EXISTS=`git branch --no-color | awk '{$1=$1};1' | grep "^$TRAIN_BRANCH\$"` || true

  if [ "$TRAIN_BRANCH_EXISTS" = "" ]; then
    git fetch origin $TRAIN_BRANCH > /dev/null 2>&1 || true

    REMOTE_BRANCH="origin/$TRAIN_BRANCH"
    REMOTE_BRANCH_EXISTS=`git branch --no-color -r | awk '{$1=$1};1' | grep "^$REMOTE_BRANCH\$"` || true

    if [ "$REMOTE_BRANCH_EXISTS" = "" ]; then
      echo "Warning: $TRAIN_BRANCH branch not found on local or remote, creating one from main."
      git checkout main > /dev/null 2>&1
      git pull origin main > /dev/null 2>&1
      git checkout -b "$TRAIN_BRANCH" > /dev/null 2>&1
    else
      git checkout --track -b "$TRAIN_BRANCH" "$REMOTE_BRANCH" > /dev/null 2>&1
    fi
  else
    git checkout "$TRAIN_BRANCH" > /dev/null 2>&1
    git pull origin "$TRAIN_BRANCH" > /dev/null 2>&1 || true
  fi
fi

# 9. Update the AUTHORS file
npm run authors > /dev/null

# 10. Commit changes.
git commit -a -m "Release $NEW_VERSION"

# 11. Create a tag.
git tag -a "$NEW_TAG" -m "$BUILD_TYPE release $NEW_VERSION"


if [ -f "$SCRIPT_DIR/create-deploy-bug.url" ]; then
  DEPLOY_BUG_URL=`cat "$SCRIPT_DIR/create-deploy-bug.url" | sed "s/TRAIN_NUMBER/$TRAIN/"`
fi


# 12. Tell the user what we did.
echo
echo "Success! The release has been tagged locally but it hasn't been pushed."
echo "Before pushing, you should check that the changes appear to be sane."
echo "At the very least, eyeball the diffs and git log."
echo "If you're feeling particularly vigilant, you may want to run some of the tests and linters too."
echo
echo "Branch:"
echo
echo "  $TRAIN_BRANCH"
echo
echo "Tag:"
echo
echo "  $NEW_TAG"
echo
echo "When you're ready to push, paste the following lines into your terminal:"
echo
echo "git push origin $TRAIN_BRANCH"
echo "git push origin $NEW_TAG"
echo
echo "After that, you must open pull a request to merge the changes back to main:"
echo
echo "  https://github.com/mozilla/fxa/compare/$TRAIN_BRANCH?expand=1"
echo
echo "Ask for review on the pull requests from @fxa-devs"
echo

if [ "$BUILD_TYPE" = "Train" ]; then

  if [[ "$OSTYPE" == "darwin"* ]]; then
    TWO_WEEKS_AGO=$(date -v -14d +%Y-%m-%d)
  else
    TWO_WEEKS_AGO=$(date +%Y-%m-%d -d "14 days ago")
  fi

  echo "If there's no deploy bug for $TRAIN_BRANCH yet, you should create one using this URL (you'll need to update the title of the bug in Bugzilla):"
  echo
  echo "  https://github.com/mozilla/fxa-private/blob/main/_scripts/create-deploy-bug.url"
  echo
  echo "Make sure you copy notes from the deploy doc:"
  echo
  echo "  https://docs.google.com/document/d/1lc5T1ZvQZlhXY6j1l_VMeQT9rs1mN7yYIcHbRPR2IbQ"
  echo
  echo "And copy and paste the rest of this output into the bug:"
  echo
  echo "### Marked needs:qa (FxA)"
  echo
  echo "* https://github.com/mozilla/fxa/issues?utf8=%E2%9C%93&q=label%3Aneeds%3Aqa+is%3Aclosed+updated%3A%3E$TWO_WEEKS_AGO"
  echo
  echo "### Marked qa+ (SubPlat)"
  echo
  echo "* https://github.com/mozilla/fxa/issues?utf8=%E2%9C%93&q=label%3Aqa%2B+is%3Aclosed+updated%3A%3E$TWO_WEEKS_AGO"
  echo
else
  echo "Don't forget to leave a comment in the deploy bug."
  echo
fi

echo "### Tags"
echo
echo "* https://github.com/mozilla/fxa/releases/tag/$NEW_TAG"
echo

echo "### Changelog"
echo
echo "* https://github.com/mozilla/fxa/releases"
echo
