#!/bin/bash -ex

MODULE=$(basename $(pwd))
DIR=$(dirname "$0")

$DIR/build.sh $MODULE
$DIR/test.sh $MODULE $1
$DIR/deploy.sh $MODULE
