const util = require('util');
const path = require('path');
const exec = util.promisify(require('child_process').exec);

// forced password reset using must-reset.js script
export async function resetPass(email: string) {
  const { stdout, stderr } = await exec(
    `node -r ts-node/register must-reset.js -e ${email}`,
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
