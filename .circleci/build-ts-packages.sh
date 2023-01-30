#/bin/bash -ex

# The build list should usuallytake care of this, but just to be safe, always build
# these common workspaces. Our fucntional tests, which always regardless of the change
# set now assume these workspaces have been pre-built.
yarn workspaces foreach \
    -piv \
    --topological-dev \
    --include fxa-shared \
    --include fxa-auth-client \
    --include fxa-react \
    run build

# Build workspaces with changes.
LIST=".lists/ts-build-includes.list"
if [[ ! -f $LIST ]]; then
  echo "List isn't a valid file: $LIST"
  exit 1
fi
if [[ ! -s .lists/$LIST ]]; then
  echo "$LIST contains no operations. Exiting early!"
  exit 0
fi

yarn workspaces foreach \
    -piv \
    --topological-dev \
    $(cat $LIST) \
    --exclude fxa-shared \
    --exclude fxa-auth-client \
    --exclude fxa-react \
    run compile
