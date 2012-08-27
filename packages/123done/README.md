## A demo of Persona

Mozilla Persona is a distributed authentication system for the web
that lets users sign on using their existing email address without
per-site usernames and passwords.  It's open, free, will become a
standard, and is rigorously supported by the non-profit organziation
that strives to make the web better for the humans that use it. 

This repository contains a demonstration of persona written in HTML
and node.js.

## running locally

1. install [git] and [node]
2. get a local copy of the repository: `git clone https://github.com/mozilla/123done`
3. `cd 123done`
4. install dependencies: `npm install`
5. run the server: `npm start`
6. visit it in your browser: `http://127.0.0.1:8080/`
7. hack and reload!  (web resources don't require a server restart)

  [git]: http://git-scm.org
  [node]: http://nodejs.org

## deploying to a hosted environment

123done is all set up to deploy quickly and painlessly on amazon EC2 via 
[awsbox][].

  [awsbox]: https://github.com/lloyd/awsbox

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
