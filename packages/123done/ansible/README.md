The command `make stack=one23done-stage key=yourkeyname trusted_client_id="dead..." client_secret="beef..." untrusted_client_id="feed..." untrusted_client_secret="deaf..."` will create an EC2+ELB instance [1] with the following attributes:

* builds and runs 123done (https://github.com/mozilla/123done) webserver as both trusted (123done) and untrusted (321done)
* an AWS ELB serving both port 80, and port 443 traffic with a SSL certificate for *.dev.lcip.org
* registers `one23done-stage.dev.lcip.org` in DNS as a A record, and an MX record to receive email
* node processes managed by supervisorctl
* ssh access to `ssh ec2-user@meta-one23done-stage.dev.lcip.org`

[1] assumes you have AWS access keys set up in mozilla's cloudservices-aws-dev IAM, but this ansible code should be not hard to re-use in some other IAM
