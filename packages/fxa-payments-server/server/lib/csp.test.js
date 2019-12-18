const config = require('../config');
const blockingRules = require('./csp/blocking');

describe('CSP blocking rules', () => {
  // force the CDN to be enabled for tests.
  const CDN_SERVER = 'https://static.accounts.firefox.com';
  config.set('staticResources.url', CDN_SERVER);
  const { Sources, directives, reportOnly } = blockingRules(config);

  it('does not have a Sources value equal `undefined`', () => {
    expect(Sources).not.toHaveProperty('undefined');
    expect(reportOnly).toBeFalsy();
  });

  it('has correct connectSrc directives', () => {
    const { connectSrc } = directives;

    expect(connectSrc).toHaveLength(6);
    expect(connectSrc).toContain(Sources.SELF);
    expect(connectSrc).toContain(Sources.AUTH_SERVER);
    expect(connectSrc).toContain(Sources.OAUTH_SERVER);
    expect(connectSrc).toContain(Sources.PROFILE_SERVER);
    expect(connectSrc).toContain(Sources.STRIPE_API_URL);
  });

  it('has correct defaultSrc directives', () => {
    const { defaultSrc } = directives;

    expect(defaultSrc).toHaveLength(1);
    expect(defaultSrc).toContain(Sources.SELF);
  });

  it('has correct fontSrc directives', () => {
    const { fontSrc } = directives;

    expect(fontSrc).toHaveLength(2);
    expect(fontSrc).toContain(Sources.SELF);
    expect(fontSrc).toContain(CDN_SERVER);
  });

  it('has correct frameSrc directives', () => {
    const { frameSrc } = directives;

    expect(frameSrc).toHaveLength(3);
    expect(frameSrc).toContain(Sources.STRIPE_SCRIPT_URL);
    expect(frameSrc).toContain(Sources.STRIPE_HOOKS_URL);
    expect(frameSrc).toContain(Sources.SURVEY_GIZMO_IFRAME_EMBED_URL);
  });

  it('has correct imgSrc directives', () => {
    const { imgSrc } = directives;

    expect(imgSrc).toHaveLength(6);
    expect(imgSrc).toContain(Sources.SELF);
    expect(imgSrc).toContain(Sources.DATA);
    expect(imgSrc).toContain(Sources.GRAVATAR);
    expect(imgSrc).toContain(Sources.PROFILE_IMAGES_SERVER);
    expect(imgSrc).toContain(Sources.ACCOUNTS_STATIC_CDN);
    expect(imgSrc).toContain(CDN_SERVER);
  });

  it('has correct mediaSrc directives', () => {
    const { mediaSrc } = directives;

    expect(mediaSrc).toHaveLength(1);
    expect(mediaSrc).toContain(Sources.NONE);
  });

  it('has correct objectSrc directives', () => {
    const { mediaSrc } = directives;

    expect(mediaSrc).toHaveLength(1);
    expect(mediaSrc).toContain(Sources.NONE);
  });

  it('has correct scriptSrc directives', () => {
    const { scriptSrc } = directives;

    expect(scriptSrc).toHaveLength(3);
    expect(scriptSrc).toContain(Sources.SELF);
    expect(scriptSrc).toContain(Sources.STRIPE_SCRIPT_URL);
    expect(scriptSrc).toContain(CDN_SERVER);
  });

  it('has correct styleSrc directives', () => {
    const { styleSrc } = directives;

    expect(styleSrc).toHaveLength(3);
    expect(styleSrc).toContain(Sources.SELF);
    expect(styleSrc).toContain(Sources.UNSAFE_INLINE);
    expect(styleSrc).toContain(CDN_SERVER);
  });
});
