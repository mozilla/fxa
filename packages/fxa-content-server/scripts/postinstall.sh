#!/bin/bash

# note, no set -ex here, we do not want to fail if npm link fails.

DIR=$(dirname "$0")

$DIR/download_l10n.sh

# attempt to link the fxa-js-client. This will fail on Circle.
# instead the package will be cloned from install-content-server.sh
npm link ../fxa-js-client
if [ $? -eq 0 ]
then
  echo "using a locally linked fxa-js-client"
else
  echo "could not link the fxa-js-client"
fi