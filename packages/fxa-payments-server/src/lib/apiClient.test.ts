import { APIError } from './apiClient';

describe('APIError', () => {
  it('can be created without params', () => {
    const subject = new APIError();
    expect(subject).toMatchObject({
      body: null,
      code: null,
      statusCode: null,
      errno: null,
      error: null,
    });
  });

  it('sets properties from body data', () => {
    const body = {
      code: '867',
      statusCode: 404,
      errno: 123,
      error: 'boofed it',
      message: 'alert: boofed it',
    };
    const subject = new APIError(body);
    expect(subject).toMatchObject({
      body,
      code: body.code,
      statusCode: body.statusCode,
      errno: body.errno,
      error: body.error,
      message: body.message,
    });
  });
});
