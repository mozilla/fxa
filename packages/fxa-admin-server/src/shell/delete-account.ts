const util = require('util');
const path = require('path');
const exec = util.promisify(require('child_process').exec);

//Re-name this to delete email script; Pass a parameter into function to specify given UID
export async function deleteAccount(email: string) {
  const { stdout, stderr } = await exec(
    `node -r ts-node/register delete-account.js ${email}`,
    {
      cwd: path.join(__dirname, '../../../fxa-auth-server/scripts'),
      env: {
        NODE_ENV: 'dev',
      },
    }
  );
  console.log(stdout);
  console.error(stderr);
  return true;
}
