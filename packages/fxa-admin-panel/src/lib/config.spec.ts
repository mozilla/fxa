import { config } from './config';

describe('config', () => {
  it('gets config', () => {
    expect(config.env).toBeDefined();
    expect(config.user).toBeDefined();
    expect(config.user.email).toBeDefined();
    expect(config.user.group).toBeDefined();
    expect(config.user.permissions).toBeDefined();
    expect(config.servers).toBeDefined();
    expect(config.servers.admin).toBeDefined();
    expect(config.servers.admin.url).toBeDefined();
  });
});
