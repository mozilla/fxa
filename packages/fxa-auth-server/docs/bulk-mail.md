# Sending emails manually

Sometimes it's necessary to send emails manually. Doing
so requires access to a production auth-server machine and
the user database.

## Steps

1. Know which users you want to send emails to.
2. Use the [dump-users.js](https://github.com/mozilla/fxa-auth-server/blob/master/scripts/dump-users.js) script to
   write the necessary user information to disk. Users can be dumped by `uid` or `email`

- uid, listing uids on the command line
  > node ./scripts/dump-users.js -u 62f8f86fb6ce42b39431547fda1fb87d,567f8f86fb6ce42b39431547fda1fb8124 > ./user-list.json
- uids, listing uids in an input file
  > node ./scripts/dump-users.js -u --input uids-to-dump.txt > ./user-list.json
- email, listing emails on the command line
  > node ./scripts/dump-users.js -e testuser@testuser.com,another@another.com > ./user-list.json
- email, listing emails in an input file
  > node ./scripts/dump-users.js -e --input emails-to-dump.txt > ./user-list.json

3. Test sending the emails

- write to the console
  > node ./scripts/bulk-mailer.js --input ./user-list.json --method sendVerifyEmail
- write to disk
  > node ./scripts/bulk-mailer.js --input ./user-list.json --method sendVerifyEmail --write ./email_output/

4. Send the emails
   > node ./scripts/bulk-mailer.js --input ./user-list.json --method sendVerifyEmail --send
