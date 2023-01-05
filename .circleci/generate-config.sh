#!/bin/bash -e



if [[ ! -f .lists/test.list ]]; then
  echo "No master list found: .lists/test.list must exist!"
  exit 1
fi

# Clear out temp files
rm .lists/dynamic-ci-tests.yml
touch .lists/dynamic-ci-tests.yml
rm .lists/dynamic-ci-parameters.yml
touch .lists/dynamic-ci-parameters.yml

function genDynamicTest() {
  PACKAGE=$1
  SCRIPT=$2
  JOB_NAME=$3
  WORKFLOW_NAME=$4

  echo "Creating Dynamic Test $PACKAGE, $SCRIPT, $JOB_NAME, $WORKFLOW_NAME"

  if [ -f "packages/$PACKAGE/package.json" ]; then
    if [[ $(cat packages/$PACKAGE/package.json | jq ".scripts.\"$SCRIPT\"") != null ]]; then
      echo "
      - $JOB_NAME:
          name: $WORKFLOW_NAME - $PACKAGE
          package: $PACKAGE
          requires:
            - Build > Lint > Unit Test " >> .lists/dynamic-ci-tests.yml

    else
      echo $PACKAGE does not have script $SCRIPT
    fi

  fi
}

function createDynamicCiConfig() {
  PACKAGE=$1

  if grep -q "^$PACKAGE$" ".lists/test.list"; then
    ENABLED="true"
  else
    ENABLED="false"
  fi;

  echo "
  check-$PACKAGE:
    type: boolean
    default: $ENABLED " >> .lists/dynamic-ci-parameters.yml
}

# Loop over folders to get workspace names
for d in packages/fxa-*/ ; do
    pkg=$(echo "$d" | sed s/\\///g | sed s/packages//g )
    echo "Evaluating $pkg"

    createDynamicCiConfig $pkg
    genDynamicTest $pkg test:integration test-integration "Integration Test"
done



# Output a generated file
echo '' > .circleci/config_generated.yml
while IFS= read line
do
  echo -e "$line"

  if [[ $line == "###DYNAMIC_PARAMETERS###" ]]; then
    cat .lists/dynamic-ci-parameters.yml >> .circleci/config_generated.yml
  elif [[ $line == "###DYNAMIC_TESTS###" ]]; then
   cat .lists/dynamic-ci-tests.yml >> .circleci/config_generated.yml
  else
    echo -e "$line" >> .circleci/config_generated.yml
  fi
done < .circleci/config_template.yml
