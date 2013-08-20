
AWSBoxen Deployment Config for picl-idp
=======================================

This directory specifies how to deploy picl-idp into AWS.  It's a templated
CloudFormation stack with some extra details about how to build AMIs. You
will need "awsboxen" to interpret and act on these instructions:

  https://github.com/mozilla/awsboxen

Most of the interesting stuff is in the "Resources.yml" file, where we
declare all the various resources needed in the deployment.

At a high level, the deployment consists of the following:

  * An auto-scaled group of *webheads* running the picl-idp nodejs
    application.  These are stateless machines which defer all their
    data-storage needs to...

  * An auto-scaled group of *cassandra* nodes.  These act as a dumb
    data store and have a bit of trickery to auto-configure themselves
    into a cluster.

  * Everyone sends logs to a stand-alone *log aggregator* using heka.
    This runs an elasticsearch+kibana interface for analysing the logs,
    view graphs, etc.


Things to do:

  - webheads:
    - local postfix relaying to SES
  - cassandra:
    - auto-clustering magic
    - add more vnodes, configure auto-bootstrapping, etc
  - VPCs and subnets
  - Use existing bastion hosts, lock down ssh to bastion hosts only

