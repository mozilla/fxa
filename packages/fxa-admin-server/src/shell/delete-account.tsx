const util = require('util');
const exec = util.promisify(require('child_process').exec);

//Re-name this to delete email script; Pass a parameter into function to specify given UID
export async function DeleteEmail(email: string) {
  const { stdout, stderr } = await exec(
    'NODE_ENV=dev node -r ts-node/register ../../../fxa-auth-server/scripts/delete-account.js',
    email
  ); //in exec call, call script with email
  console.log(stdout);
  console.error(stderr);
}

const email = 'test@gmail.com';
DeleteEmail(email);

// module.exports.DeleteEmail = DeleteEmail;

//Flag: delete-account script to skip Y/N prompt and skip to delete
