import { TestFixture, test as baseTest } from '@playwright/test';

// Define the type for the fixture parameter
type EmailFixtureOptions = {
  prefix: string; // Prefix for the email address
  password: string; // Password for the email address
};

type TestOptions = {
  target: any; // Define the appropriate type for the target
  pages: any; // Define the appropriate type for the pages
};

// Define the fixture function
export const emailFixture: TestFixture<
  EmailFixtureOptions,
  TestOptions
> = async ({ target, pages: { login } }, test, options) => {
  const email = login.createEmail(); // Generate email based on the prefix
  await login.clearCache(); // Clear cache for each email

  // Pass the generated email to the test along with the password
  await test(email);

  // Teardown
  try {
    if (!email) {
      return;
    }
    const creds = await target.auth.signIn(email, password);
    await target.auth.accountDestroy(email, password, {}, creds.sessionToken);
  } catch (e) {
    // ignore
  }
};

// Export the fixture for use in tests
export const test = baseTest.extend<{ email: string }>({
  email: [emailFixture, { prefix: '', password: 'passwordzxcv' }], // Default options for the fixture
});
