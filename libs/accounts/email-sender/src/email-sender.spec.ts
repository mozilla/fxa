import * as nodemailer from 'nodemailer';
import { EmailSender, MailerConfig, Email } from './email-sender';
import { Bounces } from './bounces';
import { StatsD } from 'hot-shots';
import { ILogger } from '@fxa/shared/log';

jest.mock('nodemailer');

const baseConfig: MailerConfig = {
  host: 'localhost',
  port: 1025,
  secure: false,
  pool: false,
  maxConnections: 1,
  maxMessages: 1,
  sendingRate: 1,
  connectionTimeout: 1000,
  greetingTimeout: 1000,
  socketTimeout: 1000,
  dnsTimeout: 1000,
  sender: 'FxA <no-reply@example.com>',
};

const makeEmail = (): Email => ({
  to: 'to@example.com',
  from: 'FxA <no-reply@example.com>',
  template: 'testTemplate',
  version: 1,
  subject: 'Hello',
  preview: 'Preview text',
  html: '<p>Hello</p>',
  text: 'Hello',
  headers: {},
});

describe('EmailSender', () => {
  let statsd: StatsD;
  let log: ILogger;
  let bounces: Bounces;
  let sendMailMock: jest.Mock;

  const mockedTransport = nodemailer.createTransport as jest.MockedFunction<
    typeof nodemailer.createTransport
  >;

  beforeEach(() => {
    sendMailMock = jest.fn();
    mockedTransport.mockReturnValue({
      sendMail: sendMailMock,
    } as unknown as nodemailer.Transporter);

    statsd = {
      increment: jest.fn(),
    } as unknown as StatsD;

    log = {
      debug: jest.fn(),
      error: jest.fn(),
    } as unknown as ILogger;

    bounces = {
      check: jest.fn(),
    } as unknown as Bounces;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('short circuits when bounce errors are present', async () => {
    (bounces.check as jest.Mock).mockRejectedValue(
      Object.assign(new Error('bounced'), { errno: 123 })
    );

    const sender = new EmailSender(baseConfig, bounces, statsd, log);
    const result = await sender.send(makeEmail());

    expect(result).toEqual({
      sent: false,
      message: 'Has bounce errors!',
    });
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it('sends email when no bounce errors occur', async () => {
    (bounces.check as jest.Mock).mockResolvedValue(undefined);
    sendMailMock.mockResolvedValue({
      response: '250 OK',
      messageId: '<abc123>',
    });

    const sender = new EmailSender(baseConfig, bounces, statsd, log);
    const result = await sender.send(makeEmail());

    expect(sendMailMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      sent: true,
      response: '250 OK',
      messageId: '<abc123>',
    });
  });
});
