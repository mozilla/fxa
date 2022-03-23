import { test, expect } from '../lib/fixtures/standard';

test('content-server mocha tests', async ({ target, page }, { project }) => {
  test.skip(project.name !== 'local', 'mocha tests are local only');
  test.slow();
  await page.goto(`${target.contentServerUrl}/tests/index.html`, {
    waitUntil: 'networkidle',
  });
  await page.evaluate(() =>
    globalThis.runner.on('end', () => (globalThis.done = true))
  );
  await page.waitForFunction(() => globalThis.done, {}, { timeout: 0 });
  const failures = await page.evaluate(() => globalThis.runner.failures);
  expect(failures).toBe(0);
});

test('change email and unblock', async ({
  credentials,
  pages: { page, login, settings, secondaryEmail },
}) => {
  await settings.goto();
  await settings.secondaryEmail.clickAdd();
  const newEmail = `blocked${Math.floor(Math.random() * 100000)}@restmail.net`;
  await secondaryEmail.addAndVerify(newEmail);
  await settings.secondaryEmail.clickMakePrimary();
  credentials.email = newEmail;
  await settings.signOut();
  await login.login(credentials.email, credentials.password);
  await login.unblock(newEmail);
  expect(page.url()).toBe(settings.url);
});

test('prompt=consent', async ({ credentials, pages: { page, relier, login } }, {
  project,
}) => {
  test.skip(project.name === 'production', 'no 123done relier in prod');
  await relier.goto();
  await relier.clickEmailFirst();
  await login.login(credentials.email, credentials.password);
  expect(await relier.isLoggedIn()).toBe(true);
  await relier.signOut();
  await relier.goto('prompt=consent');
  await relier.clickEmailFirst();
  await login.submit();
  expect(page.url()).toMatch(/signin_permissions/);
  await login.submit();
  expect(await relier.isLoggedIn()).toBe(true);
});
