The command `make stack=one23done-stage key=yourkeyname trusted_client_id="dead..." trusted_client_secret="beef..." untrusted_client_id="feed..." untrusted_client_secret="deaf..."` will create an EC2+ELB instance [1] with the following attributes:

* builds and runs 123done (https://github.com/mozilla/123done) webserver as both trusted (123done) and untrusted (321done), using the oauth branch
* an AWS ELB serving both port 80, and port 443 traffic with a SSL certificate for *.dev.lcip.org
* registers `123done-stage.dev.lcip.org` and `321done-stage.dev.lcip.org` in DNS as CNAMES to the ELB
* node processes managed by supervisorctl
* ssh access: use `ssh ec2-user@meta-123done-stage.dev.lcip.org`; 123done/321done code is under `/home/app`

[1] assumes you have AWS access keys set up in mozilla's cloudservices-aws-dev IAM, but this ansible code should be not hard to re-use in some other IAM
