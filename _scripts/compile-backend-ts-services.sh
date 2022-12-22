#!/bin/bash
if [ ! -d artifacts ]; then
  mkdir artifacts
fi

# We only want to target 'backend' packages.
BACKEND_PACKAGES=( "fxa-admin-server" "fxa-auth-server" "fxa-event-broker" "fxa-graphql-api" "fxa-shared" "fxa-auth-client" "fxa-support-panel" )

# Exclude anything that is not a backend package
ALL_PACKAGES=$(yarn workspaces list --json | jq .name | sed s/\"//g )
EXCLUDE=''
for package in $ALL_PACKAGES; do
  if [[ ! " ${BACKEND_PACKAGES[@]} " =~ " ${package} " ]]; then
    EXCLUDE="--exclude=${package} ${EXCLUDE}";
  fi
done

# Let the user know which workspaces are being built and in which order
echo "Compiling backend workspaces in the following order:"
yarn workspaces foreach --since --topological-dev --parallel $EXCLUDE exec 'echo $npm_package_name' | grep fxa- ;

# We don't need to write files to disk, so `compile` uses `tsc --noEmit` here instead of `tsc --build` for speed.
echo "Compilation starting!"
if ! `yarn workspaces foreach --since --verbose --topological-dev --parallel $EXCLUDE run compile > artifacts/compiling-affected-backend-services.log`;
then
  echo -e "\n###########################################################\n"
  echo "# fxa couldn't compile one or more services. see artifacts/compiling-affected-backend-services.log for details."
  echo -e "\n###########################################################\n"
  exit 1
fi


# Show the status
cat artifacts/compiling-affected-backend-services.log
