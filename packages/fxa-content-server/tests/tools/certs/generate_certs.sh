#!/bin/bash

printf ">> Create ca.key, use a password phrase when asked.\n"
printf ">> When asked 'Common Name (e.g. server FQDN or YOUR name) []:' use your hostname, i.e 'localhost'\n\n"
openssl genrsa -des3 -out ca.key 1024
openssl req -new -key ca.key -out ca.csr
openssl x509 -req -days 365 -in ca.csr -out ca.crt -signkey ca.key

printf "\n>> Create server certificate \n"
openssl genrsa -des3 -out server.key 1024
openssl req -new -key server.key -out server.csr

printf "\n>> Remove password from the certificate \n"
cp server.key server.key.org
openssl rsa -in server.key.org -out server.key

printf "\n>> Generate self-siged certificate \n"
openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt
