#!/usr/bin/env bash

# This script is intended to prepare the deployment of a feature branch
# to staging. It works by creating a branch & tag based on the last-deployed
# train, then merging the feature branch on top.
#
# Usage:
#
#    git co feature-branch
#    ./release-feature-branch.sh
#
# No argument should be supplied. The script should be run while the
# desired feature branch is checked out. If there is already a
# branch or tag created from a previous run of this script, they will
# be deleted and recreated.

set -e
IFS=$'\n'

SCRIPT_DIR=`dirname "$0"`/_scripts
FEATURE_BRANCH=`git branch --no-color | grep '^\*' | cut -d ' ' -f 2`
FXA_REPO="https://github.com/mozilla/fxa"

abort() {
  git checkout "$FEATURE_BRANCH" > /dev/null 2>&1
  echo "Release aborted: $1."
  exit 1
}

if [ "$FEATURE_BRANCH" = "main" ]; then
  abort "main is not a feature branch";
fi

LAST_TAG=`git tag -l --sort=version:refname | grep -v '-' | tail -1`
echo "Last tag: $LAST_TAG"

MAJOR=`echo "$LAST_TAG" | cut -d '.' -f 1 | cut -d 'v' -f 2`
TRAIN=`echo "$LAST_TAG" | cut -d '.' -f 2`
PATCH=`echo "$LAST_TAG" | cut -d '.' -f 3 | cut -d '-' -f 1`

LAST_VERSION="$MAJOR.$TRAIN.$PATCH"
SED_FRIENDLY_LAST_VERSION="$MAJOR\\.$TRAIN\\.$PATCH"

NEW_VERSION="$MAJOR.$TRAIN.$PATCH"
NEW_TAG="v$NEW_VERSION"

# Ensure a base train branch already exists
TRAIN_BRANCH="train-$TRAIN"
TRAIN_BRANCH_EXISTS=`git branch --no-color | awk '{$1=$1};1' | grep "^$TRAIN_BRANCH\$"` || true
if [ "$TRAIN_BRANCH_EXISTS" = "" ]; then
  abort "$TRAIN_BRANCH must already exist from which to base feature branch release"
fi

# Delete an existing train-with-feature branch, if it exists
TRAIN_BRANCH_WITH_FEATURE="train-$TRAIN-$FEATURE_BRANCH"
TRAIN_BRANCH_WITH_FEATURE_EXISTS=`git branch --no-color | awk '{$1=$1};1' | grep "^$TRAIN_BRANCH_WITH_FEATURE\$"` || true
if [ "$TRAIN_BRANCH_WITH_FEATURE_EXISTS" != "" ]; then
  git branch -D $TRAIN_BRANCH_WITH_FEATURE
fi

# Delete an existing train-with-feature tag, if it exists
NEW_TAG_WITH_FEATURE="$NEW_TAG-$FEATURE_BRANCH"
NEW_TAG_WITH_FEATURE_EXISTS=`git tag --no-color | grep "^$NEW_TAG_WITH_FEATURE\$"` || true
if [ "$NEW_TAG_WITH_FEATURE_EXISTS" != "" ]; then
  git tag -d $NEW_TAG_WITH_FEATURE
fi

# Create the train-with-feature branch, merge the feature branch into it.
# NOTE: This is where things may bail out, if the feature cannot merge cleanly into the last train.
git checkout -b "$TRAIN_BRANCH_WITH_FEATURE" "$TRAIN_BRANCH"
git merge -m "Release $NEW_VERSION with $FEATURE_BRANCH" $FEATURE_BRANCH

# 11. Create a tag.
git tag -a "$NEW_TAG_WITH_FEATURE" -m "$BUILD_TYPE release $NEW_VERSION with $FEATURE_BRANCH"

# 12. Tell the user what we did.
echo
echo "Success! The feature branch release has been tagged locally but it hasn't been pushed."
echo "Before pushing, you should check that the changes appear to be sane."
echo "At the very least, eyeball the diffs and git log."
echo "If you're feeling particularly vigilant, you may want to run some of the tests and linters too."
echo
echo "Branch:"
echo
echo "  $TRAIN_BRANCH_WITH_FEATURE"
echo
echo "Tag:"
echo
echo "  $NEW_TAG_WITH_FEATURE"
echo
echo "When you're ready to push, paste the following lines into your terminal:"
echo
echo "git push -f origin $TRAIN_BRANCH_WITH_FEATURE"
echo "git push -f origin $NEW_TAG_WITH_FEATURE"
echo
echo "NOTE: These commands will clobber an existing branch and tag, if they've already been created."
echo "This is probably what you want for a feature branch release, but make sure to verify that this is correct!"

if [[ "$OSTYPE" == "darwin"* ]]; then
  A_WEEK_AGO=$(date -v -7d +%Y-%m-%d)
else
  A_WEEK_AGO=$(date +%Y-%m-%d -d "7 days ago")
fi

echo "If there's no deploy bug for $TRAIN_BRANCH_WITH_FEATURE yet, you should create one using this URL (you'll need to update the title of the bug in Bugzilla):"
echo
echo "  https://github.com/mozilla/fxa-private/blob/main/_scripts/create-deploy-bug.url"
echo
echo "Make sure you copy notes from the deploy doc:"
echo
echo "  https://docs.google.com/document/d/1lc5T1ZvQZlhXY6j1l_VMeQT9rs1mN7yYIcHbRPR2IbQ"
echo
echo "And copy and paste the rest of this output into the bug:"
echo
echo "**This tag should only be deployed to staging. It should not be deployed to production.**"
echo
echo "### Marked needs:qa"
echo
echo "* https://github.com/mozilla/fxa/issues?utf8=%E2%9C%93&q=label%3Aneeds%3Aqa+is%3Aclosed+updated%3A%3E$A_WEEK_AGO"
echo

echo "### Tags"
echo
echo "* https://github.com/mozilla/fxa/releases/tag/$NEW_TAG_WITH_FEATURE"
echo

if [ "$PERTINENT_CHANGELOGS" != "" ]; then
  echo "### Pertinent changelogs"
  echo
  for PACKAGE in $PERTINENT_CHANGELOGS; do
    echo "* https://github.com/mozilla/fxa/blob/$NEW_TAG_WITH_FEATURE/$PACKAGE/CHANGELOG.md"
  done
  echo
fi
