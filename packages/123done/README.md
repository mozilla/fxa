## A demo of Firefox Accounts OAuth

[![Build Status](https://travis-ci.org/mozilla/123done.svg?branch=oauth)](https://travis-ci.org/mozilla/123done)

## running locally

1. install [git], [node] and [redis]
1. get a local copy of the repository: `git clone https://github.com/mozilla/123done`
1. `cd 123done`
1. install dependencies: `npm install`
1. generate keys `node scripts/gen_keys.js` 
1. run the server: `npm start`
1. visit it in your browser: `http://127.0.0.1:8080/`
1. hack and reload!  (web resources don't require a server restart)

  [git]: http://git-scm.org
  [node]: http://nodejs.org
  [redis]: http://redis.io

## deploying to a hosted environment

123done is all set up to deploy quickly and painlessly on amazon EC2 via 
[awsbox][].

  [awsbox]: https://github.com/mozilla/awsbox

While full documentation for awsbox is contained within that project, Here is a sample
command line that might work for you:

    node_modules/.bin/awsbox create \
        -u http://123done.org \
        --ssl disable \
        -n 123done \
        -t m1.small \
        --keydir $HOME/.persona_secrets/pubkeys/ 

What do these arguments do?

  * `-u` specifies the public URL of the instance
  * `--ssl` set to `disable`  removes SSL support from the VM
  * `-n 123done` sets *123done* as a human visible nickname for the VM
  * `-t m1.small` specifies a cheap VM that has enough oomph to run the service under load (like from automated tests running)
  * *(optional)* `--keydir` specifies a directory where all of the public keys of your colleages reside, so they can administer the VM while you're on vacation.
   
### Ansible Deployment

See [fxa-dev 123done](https://github.com/mozilla/fxa-dev/tree/master/roles/rp) Ansible configuration for details.
