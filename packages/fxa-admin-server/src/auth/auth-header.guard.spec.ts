import { GqlAuthHeaderGuard } from './auth-header.guard';

describe('AuthHeaderGuard', () => {
  it('should be defined', () => {
    const MockConfig = {
      get: jest.fn().mockReturnValue({ authHeader: 'test' }),
    };
    expect(new GqlAuthHeaderGuard(MockConfig as any)).toBeDefined();
  });
});
