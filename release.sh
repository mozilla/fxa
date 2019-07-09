#!/bin/sh

set -e
IFS=$'\n'

# This script will automatically update the changelogs and bump the version
# strings for each of the "main" FxA packages in this tree. It assumes some
# uniformity in the format of the tags and changelogs, so tagging should
# always be done with this script lest that uniformity is broken.
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
#   7. Otherwise checkout existing train branch or create fresh one from master.
#   8. For each of the "main" packages...
#      8.1. List commits since the last tag.
#      8.2. For each commit...
#           8.2.1. Add the commit message to a summary string.
#      8.3. If CHANGELOG.md exists, write the summary string to CHANGELOG.md.
#      8.4. If package.json exists, uppdate the version string in package.json.
#      8.5. If package-lock.json exists, uppdate the version string in package-lock.json.
#      8.6. If npm-shrinkwrap.json exists, uppdate the version string in npm-shrinkwrap.json.
#      8.7. If Cargo.toml exists, uppdate the version string in Cargo.toml.
#      8.8. If Cargo.lock exists, uppdate the version string in Cargo.lock.
#   9. Update the AUTHORS file
#   10. Commit changes.
#   11. Create a tag.
#   12. Create or checkout the private train branch.
#   13. Merge train branch into the private train branch.
#   14. Create a private tag.
#   15. Return to the original branch.
#   16. Tell the user what we did.

SCRIPT_DIR=`dirname "$0"`/_scripts
CURRENT_BRANCH=`git branch --no-color | grep '^\*' | cut -d ' ' -f 2`

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
  LAST_TAG=`git tag -l --sort=version:refname | tail -1`
else
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
SED_FRIENDLY_LAST_VERSION="$MAJOR\\.$TRAIN\\.$PATCH"

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
  # 7. Otherwise checkout existing train branch or create fresh one from master.
  TRAIN_BRANCH_EXISTS=`git branch --no-color | awk '{$1=$1};1' | grep "^$TRAIN_BRANCH\$"` || true

  if [ "$TRAIN_BRANCH_EXISTS" = "" ]; then
    git fetch origin $TRAIN_BRANCH > /dev/null 2>&1 || true

    REMOTE_BRANCH="origin/$TRAIN_BRANCH"
    REMOTE_BRANCH_EXISTS=`git branch --no-color -r | awk '{$1=$1};1' | grep "^$REMOTE_BRANCH\$"` || true

    if [ "$REMOTE_BRANCH_EXISTS" = "" ]; then
      echo "Warning: $TRAIN_BRANCH branch not found on local or remote, creating one from master."
      git checkout master > /dev/null 2>&1
      git pull origin master > /dev/null 2>&1
      git checkout -b "$TRAIN_BRANCH" > /dev/null 2>&1
    else
      git checkout --track -b "$TRAIN_BRANCH" "$REMOTE_BRANCH" > /dev/null 2>&1
    fi
  else
    git checkout "$TRAIN_BRANCH" > /dev/null 2>&1
    git pull origin "$TRAIN_BRANCH" > /dev/null 2>&1 || true
  fi
fi

# 8. For each of the "main" packages...
bump() {
  # 8.1. List commits since the last tag.
  LOCAL_COMMITS=`git log $LAST_TAG..HEAD --no-color --pretty=oneline --abbrev-commit -- "$1"`

  # 8.2. For each commit...
  for COMMIT in $LOCAL_COMMITS; do
    HASH=`echo "$COMMIT" | cut -d ' ' -f 1`
    MESSAGE=`echo "$COMMIT" | cut -d ':' -f 2- | awk '{$1=$1};1'`
    TYPE=`echo "$COMMIT" | cut -d ' ' -f 2 | awk '{$1=$1};1' | cut -d ':' -f 1 | cut -d '(' -f 1 | awk '{$1=$1};1'`
    AREA=`echo "$COMMIT" | cut -d '(' -f 2 | cut -d ')' -f 1 | awk '{$1=$1};1'`

    if [ "$AREA" = "$COMMIT" ]; then
      AREA=""
    fi

    if [ "$AREA" != "" ]; then
      AREA="$AREA: "
    fi

    # 8.2.1. Add the commit message to a summary string.
    case "$TYPE" in
      "")
        # Ignore blank lines
        ;;
      "Merge")
        # Ignore merge commits
        ;;
      "Release")
        # Ignore release commits
        ;;
      "feat")
        if [ "$FEAT_SUMMARY" = "" ]; then
          FEAT_SUMMARY="### New features\n"
        fi
        FEAT_SUMMARY="$FEAT_SUMMARY\n* $AREA$MESSAGE ($HASH)"
        ;;
      "fix")
        if [ "$FIX_SUMMARY" = "" ]; then
          FIX_SUMMARY="### Bug fixes\n"
        fi
        FIX_SUMMARY="$FIX_SUMMARY\n* $AREA$MESSAGE ($HASH)"
        ;;
      "perf")
        if [ "$PERF_SUMMARY" = "" ]; then
          PERF_SUMMARY="### Performance improvements\n"
        fi
        PERF_SUMMARY="$PERF_SUMMARY\n* $AREA$MESSAGE ($HASH)"
        ;;
      "refactor")
        if [ "$REFACTOR_SUMMARY" = "" ]; then
          REFACTOR_SUMMARY="### Refactorings\n"
        fi
        REFACTOR_SUMMARY="$REFACTOR_SUMMARY\n* $AREA$MESSAGE ($HASH)"
        ;;
      "revert")
        if [ "$REFACTOR_SUMMARY" = "" ]; then
          REVERT_SUMMARY="### Reverted changes\n"
        fi
        REVERT_SUMMARY="$REVERT_SUMMARY\n* $AREA$MESSAGE ($HASH)"
        ;;
      *)
        if [ "$OTHER_SUMMARY" = "" ]; then
          OTHER_SUMMARY="### Other changes\n"
        fi
        OTHER_SUMMARY="$OTHER_SUMMARY\n* $AREA$MESSAGE ($HASH)"
        ;;
    esac
  done

  if [ "$FEAT_SUMMARY" != "" ]; then
    FEAT_SUMMARY="$FEAT_SUMMARY\n\n"
  fi

  if [ "$FIX_SUMMARY" != "" ]; then
    FIX_SUMMARY="$FIX_SUMMARY\n\n"
  fi

  if [ "$PERF_SUMMARY" != "" ]; then
    PERF_SUMMARY="$PERF_SUMMARY\n\n"
  fi

  if [ "$REFACTOR_SUMMARY" != "" ]; then
    REFACTOR_SUMMARY="$REFACTOR_SUMMARY\n\n"
  fi

  if [ "$REVERT_SUMMARY" != "" ]; then
    REVERT_SUMMARY="$REVERT_SUMMARY\n\n"
  fi

  if [ "$OTHER_SUMMARY" != "" ]; then
    OTHER_SUMMARY="$OTHER_SUMMARY\n\n"
  fi

  SUMMARY="$FEAT_SUMMARY$FIX_SUMMARY$PERF_SUMMARY$REFACTOR_SUMMARY$OTHER_SUMMARY"
  if [ "$SUMMARY" = "" ]; then
    SUMMARY="No changes.\n\n"
    NO_CHANGES=1
  else
    NO_CHANGES=0
  fi

  # 8.3. If CHANGELOG.md exists, write the summary string to CHANGELOG.md.
  if [ -f "$1/CHANGELOG.md" ]; then
    awk "{ gsub(/^## $LAST_VERSION/, \"## $NEW_VERSION\n\n$SUMMARY## $LAST_VERSION\") }; { print }" "$1/CHANGELOG.md" > "$1/CHANGELOG.md.release.bak"
    mv "$1/CHANGELOG.md.release.bak" "$1/CHANGELOG.md"

    if [ "$NO_CHANGES" = "0" ]; then
      if [ "$PERTINENT_CHANGELOGS" = "" ]; then
        PERTINENT_CHANGELOGS="$1"
      else
        PERTINENT_CHANGELOGS="$PERTINENT_CHANGELOGS
$1"
      fi
    fi
  fi

  # Clear summaries before the next iteration
  FEAT_SUMMARY=""
  FIX_SUMMARY=""
  PERF_SUMMARY=""
  REFACTOR_SUMMARY=""
  OTHER_SUMMARY=""

  # 8.4. If package.json exists, uppdate the version string in package.json.
  if [ -f "$1/package.json" ]; then
    sed -i.release.bak -e "s/$SED_FRIENDLY_LAST_VERSION/$NEW_VERSION/g" "$1/package.json"
    rm "$1/package.json.release.bak"
  fi

  # 8.5. If package-lock.json exists, uppdate the version string in package-lock.json.
  if [ -f "$1/package-lock.json" ]; then
    sed -i.release.bak -e "s/$SED_FRIENDLY_LAST_VERSION/$NEW_VERSION/g" "$1/package-lock.json"
    rm "$1/package-lock.json.release.bak"
  fi

  # 8.6. If npm-shrinkwrap.json exists, uppdate the version string in npm-shrinkwrap.json.
  if [ -f "$1/npm-shrinkwrap.json" ]; then
    sed -i.release.bak -e "s/$SED_FRIENDLY_LAST_VERSION/$NEW_VERSION/g" "$1/npm-shrinkwrap.json"
    rm "$1/npm-shrinkwrap.json.release.bak"
  fi

  # 8.7. If Cargo.toml exists, uppdate the version string in Cargo.toml.
  if [ -f "$1/Cargo.toml" ]; then
    sed -i.release.bak -e "s/$SED_FRIENDLY_LAST_VERSION/$NEW_VERSION/g" "$1/Cargo.toml"
    rm "$1/Cargo.toml.release.bak"
  fi

  # 8.8. If Cargo.lock exists, uppdate the version string in Cargo.lock.
  if [ -f "$1/Cargo.lock" ]; then
    sed -i.release.bak -e "s/$SED_FRIENDLY_LAST_VERSION/$NEW_VERSION/g" "$1/Cargo.lock"
    rm "$1/Cargo.lock.release.bak"
  fi
}

TARGETS="packages/fxa-auth-db-mysql
packages/fxa-auth-server
packages/fxa-content-server
packages/fxa-customs-server
packages/fxa-email-event-proxy
packages/fxa-email-service
packages/fxa-event-broker
packages/fxa-profile-server"

for TARGET in $TARGETS; do
  bump "$TARGET"
done

# 9. Update the AUTHORS file
npm run authors > /dev/null

# 10. Commit changes.
git commit -a -m "Release $NEW_VERSION"

# 11. Create a tag.
git tag -a "$NEW_TAG" -m "$BUILD_TYPE release $NEW_VERSION"

PRIVATE_REMOTE=`git remote -v | grep "mozilla/fxa-private.git" | cut -f 1 | head -n 1`

if [ "$PRIVATE_REMOTE" = "" ]; then
  echo "Warning: No private remote detected, creating one."
  git remote add private git@github.com:mozilla/fxa-private.git
  PRIVATE_REMOTE=private
fi

PRIVATE_BRANCH="$TRAIN_BRANCH-private"
PRIVATE_REMOTE_BRANCH="$PRIVATE_REMOTE/$PRIVATE_BRANCH"

# 12. Create or checkout the private train branch.
PRIVATE_BRANCH_EXISTS=`git branch --no-color | awk '{$1=$1};1' | grep "^$PRIVATE_BRANCH\$"` || true
if [ "$PRIVATE_BRANCH_EXISTS" = "" ]; then
  git fetch "$PRIVATE_REMOTE" "$PRIVATE_BRANCH" > /dev/null 2>&1 || true

  PRIVATE_REMOTE_BRANCH_EXISTS=`git branch --no-color -r | awk '{$1=$1};1' | grep "^$PRIVATE_REMOTE_BRANCH\$"` || true
  if [ "$PRIVATE_REMOTE_BRANCH_EXISTS" = "" ]; then
    echo "Warning: $PRIVATE_BRANCH branch not found on local or remote, creating one from $PRIVATE_REMOTE/master."
    git fetch "$PRIVATE_REMOTE" "master" > /dev/null 2>&1 || true
    git checkout --no-track -b "$PRIVATE_BRANCH" "$PRIVATE_REMOTE/master" > /dev/null 2>&1
    git pull "$PRIVATE_REMOTE" master > /dev/null 2>&1
    PRIVATE_DIFF_FROM="$PRIVATE_REMOTE/master"
  else
    git checkout --track -b "$PRIVATE_BRANCH" "$PRIVATE_REMOTE_BRANCH" > /dev/null 2>&1
    PRIVATE_DIFF_FROM="$PRIVATE_REMOTE/$PRIVATE_BRANCH"
  fi
else
  git checkout "$PRIVATE_BRANCH" > /dev/null 2>&1
  git pull "$PRIVATE_REMOTE" "$PRIVATE_BRANCH" > /dev/null 2>&1 || true
  PRIVATE_DIFF_FROM="$PRIVATE_REMOTE/$PRIVATE_BRANCH"
fi

if [ -f "$SCRIPT_DIR/create-deploy-bug.url" ]; then
  DEPLOY_BUG_URL=`cat "$SCRIPT_DIR/create-deploy-bug.url" | sed "s/TRAIN_NUMBER/$TRAIN/"`
fi

# 13. Merge train branch into the private train branch.
git merge "$TRAIN_BRANCH" -m "Merge $TRAIN_BRANCH into $PRIVATE_BRANCH" > /dev/null 2>&1

# 14. Create a private tag.
PRIVATE_TAG="$NEW_TAG-private"
PRIVATE_VERSION="$NEW_VERSION-private"
git tag -a "$PRIVATE_TAG" -m "$BUILD_TYPE release $PRIVATE_VERSION"

# 15. Return to the original branch.
git checkout "$CURRENT_BRANCH" > /dev/null 2>&1

# 16. Tell the user what we did.
echo
echo "Success! The release has been tagged locally but it hasn't been pushed."
echo "Before pushing, you should check that the changes appear to be sane."
echo "At the very least, eyeball the diffs and git log."
echo "If you're feeling particularly vigilant, you may want to run some of the tests and linters too."
echo
echo "Branches:"
echo
echo "  $TRAIN_BRANCH"
echo "  $PRIVATE_BRANCH"
echo
echo "Tags:"
echo
echo "  $NEW_TAG"
echo "  $PRIVATE_TAG"
echo
echo "When you're ready to push, paste the following lines into your terminal:"
echo
echo "git push origin $TRAIN_BRANCH"
echo "git push origin $NEW_TAG"
echo "git push $PRIVATE_REMOTE $PRIVATE_BRANCH"
echo "git push $PRIVATE_REMOTE $PRIVATE_TAG"
echo
echo "After that, you must open pull requests in both the public and private repos to merge the changes back to master:"
echo
echo "  https://github.com/mozilla/fxa/compare/$TRAIN_BRANCH?expand=1"
echo "  https://github.com/mozilla/fxa-private/compare/$PRIVATE_BRANCH?expand=1"
echo

if [ "$BUILD_TYPE" = "Train" ]; then
  PRIVATE_DIFF_SIZE=`git diff "$PRIVATE_BRANCH..$PRIVATE_DIFF_FROM" | wc -l | awk '{$1=$1};1'`
  IS_BIG_RELEASE=`expr "$PRIVATE_DIFF_SIZE" \> 400`
  if [ "$IS_BIG_RELEASE" = "1" ]; then
    echo "The diff for the private release is pretty big. You may want to add the following comment to that PR:"
    echo
    echo "> There's no need to review every line of this diff, since it includes every commit from the release. Instead you can do the following:"
    echo ">"
    echo '> ```'
    echo "> git fetch origin $TRAIN_BRANCH"
    echo "> git fetch $PRIVATE_REMOTE $PRIVATE_BRANCH"
    echo "> git checkout -b $PRIVATE_BRANCH $PRIVATE_REMOTE/$PRIVATE_BRANCH"
    echo "> git diff origin/$TRAIN_BRANCH"
    echo '> ```'
    echo ">"
    echo "> That diff should show only the changes from the private repo, proving that the $TRAIN_BRANCH branches are equal in other respects."
    echo
  fi

  echo "If there's no deploy bug for $TRAIN_BRANCH yet, you should create one using this URL:"
  echo
  echo "  $DEPLOY_BUG_URL"
  echo
  echo "Make sure you copy notes from the deploy doc:"
  echo
  echo "  https://docs.google.com/document/d/1lc5T1ZvQZlhXY6j1l_VMeQT9rs1mN7yYIcHbRPR2IbQ"
  echo
  echo "Include links to the needs:qa label for this milestone:"
  echo
  echo "### Needs QA"
  echo "* https://github.com/mozilla/fxa/issues?utf8=%E2%9C%93&q=label%3Aneeds%3Aqa+is%3Aclosed+milestone%3A%22Train+$TRAIN%22"
  echo "* https://github.com/mozilla/fxa/pulls?utf8=%E2%9C%93&q=label%3Aneeds%3Aqa+is%3Aclosed+milestone%3A%22Train+$TRAIN%22"
  echo
else
  echo "Don't forget to leave a comment in the deploy bug."
  echo
fi

echo "Include links to the tags:"
echo
echo "### Tags"
echo "* https://github.com/mozilla/fxa/releases/tag/$NEW_TAG"
echo "* https://github.com/mozilla/fxa-private/releases/tag/$PRIVATE_TAG"
echo

if [ "$PERTINENT_CHANGELOGS" != "" ]; then
  echo "Include links to the pertinent changelogs:"
  echo
  echo "### Changelogs"
  for PACKAGE in $PERTINENT_CHANGELOGS; do
    echo "* https://github.com/mozilla/fxa/blob/$NEW_TAG/$PACKAGE/CHANGELOG.md"
  done
  echo
fi
