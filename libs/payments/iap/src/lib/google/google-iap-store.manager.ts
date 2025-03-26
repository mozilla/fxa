import { Injectable, Logger } from '@nestjs/common';
import { GoogleIapInvalidMessagePayloadError } from './google-iap.error';

@Injectable()
export class GoogleIapPurchaseManager {
  constructor(private log: Logger) {}

  /**
   * Extract the Google PubSub message from its encoded published format.
   *
   * See https://cloud.google.com/pubsub/docs/push#receiving_messages for message
   * encoding details.
   *
   * @param messageData Raw string message data from Google PubSub message body
   */
  private extractMessage(messageData: string): Record<string, any> {
    try {
      // The message is a unicode string encoded in base64.
      const rawMessage = Buffer.from(messageData, 'base64').toString('utf-8');
      const message = JSON.parse(rawMessage);
      this.log.debug('rtdn', { message });
      return message;
    } catch (err) {
      this.log.error('rtdn', {
        message: 'Failure to load message payload',
        err,
      });
      throw new GoogleIapInvalidMessagePayloadError('Invalid message payload');
    }
  }
}
