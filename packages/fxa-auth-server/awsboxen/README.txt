
AWSBoxen Deployment Config for picl-idp
=======================================

This directory specifies how to deploy picl-idp into AWS.  It's a templated
CloudFormation stack with some extra details about how to build AMIs. You
will need "awsboxen" to interpret and act on these instructions:

  https://github.com/mozilla/awsboxen

Most of the interesting stuff is in the "Resources.yml" file, where we
declare all the various resources needed in the deployment.

Things to do:

  - add more vnodes, configure auto-bootstrapping, etc
  - VPCs and subnets
  - Lock down ssh to bastion hosts only


