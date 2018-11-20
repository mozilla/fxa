#!/bin/sh

set -e

LAST_TAG=`git describe --tags --abbrev=0`
COMMITS=`git log $LAST_TAG..HEAD --pretty=oneline --abbrev-commit`

if [ "$COMMITS" = "" ]; then
  echo "Release aborted: I see no work."
  exit 1
fi

case "$1" in
  "")
    BUILD_TYPE="Train"
    ;;
  "patch")
    BUILD_TYPE="Patch"
    ;;
  *)
    echo "Release aborted: Invalid argument \"$1\"."
    exit 1
    ;;
esac

while read -r COMMIT; do
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

  case "$TYPE" in
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
done <<< "$COMMITS"

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

SUMMARY="$BREAK_SUMMARY$FEAT_SUMMARY$FIX_SUMMARY$PERF_SUMMARY$REFACTOR_SUMMARY$OTHER_SUMMARY"

MAJOR=`echo "$LAST_TAG" | cut -d '.' -f 1 | cut -d 'v' -f 2`
TRAIN=`echo "$LAST_TAG" | cut -d '.' -f 2`
PATCH=`echo "$LAST_TAG" | cut -d '.' -f 3`

LAST_VERSION="$MAJOR.$TRAIN.$PATCH"
SED_FRIENDLY_LAST_VERSION="$MAJOR\\.$TRAIN\\.$PATCH"

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

sed -i.release.bak -e "s/$SED_FRIENDLY_LAST_VERSION/$NEW_VERSION/g" Cargo.toml
rm Cargo.toml.release.bak

sed -i.release.bak -e "s/$SED_FRIENDLY_LAST_VERSION/$NEW_VERSION/g" Cargo.lock
rm Cargo.lock.release.bak

LOG="CHANGELOG.md"
TEMP="__release_$LOG.$NEW_VERSION.tmp"
awk "{ gsub(/^## $LAST_VERSION/, \"## $NEW_VERSION\n\n$SUMMARY## $LAST_VERSION\") }; { print }" "$LOG" > "$TEMP"
mv "$TEMP" "$LOG"

GIT_FRIENDLY_SUMMARY=`echo "$SUMMARY" | sed "s/#//g" | sed "s/^ //"`

git commit -a -m "release: $NEW_VERSION"

git tag -a "$NEW_TAG" -m "`echo \"$BUILD_TYPE release $NEW_VERSION\\n\\n$GIT_FRIENDLY_SUMMARY\"`"
