#!/bin/bash

# 1. Get the list of all modified and dependent packages.
# Cleans up yarn's output by removing everything before the package name, the first and the last line.
PACKAGES_MODIFIED=`yarn workspaces list --since=HEAD^ -R | cut -d/ -f2 | sed '1d' | sed '$d'`

# 2. If no packages were modified, return early; otherwise we'd build all packages.
if [[ $PACKAGES_MODIFIED == "" ]]; then
    echo "no modified packages found"
    exit 0
fi

echo "modified packages found"

# 3. Build all packages in the list
ORIGINAL_IFS=$IFS
IFS=$'\n'
INCLUDE_ARGS=''
for package_modified in $PACKAGES_MODIFIED; do
    INCLUDE_ARGS="$INCLUDE_ARGS --include ${package_modified}"
done
IFS=$ORIGINAL_IFS
INCLUDE_ARGS=`echo "$INCLUDE_ARGS" | xargs` # trim whitespace at beginning of string
echo "building all modified and dependent packages..."
if ! `yarn workspaces foreach --verbose ${INCLUDE_ARGS} run build > artifacts/build-modified-and-dependent.log`;
then
  echo -e "\n###########################################################\n"
  echo "# fxa couldn't build modified and dependent packages. see ./artifacts/build-modified-and-dependent.log for details."
  echo -e "\n# If you see any unrelated TS errors, you could have a stale build of another package that changed recently. Try restarting fxa via 'yarn start'. See #12912."
  echo -e "\n###########################################################\n"
  exit 1
fi
