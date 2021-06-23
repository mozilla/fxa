import { convertError, notFound } from '../../mysql';
import { uuidTransformer } from '../../transformers';
import { BaseAuthModel, Proc } from './base-auth';

export class BaseToken extends BaseAuthModel {
  static async verifyToken(uid: string, verificationId: string) {
    try {
      const { status } = await BaseToken.callProcedure(
        Proc.VerifyToken,
        uuidTransformer.to(verificationId),
        uuidTransformer.to(uid)
      );
      if (status.affectedRows < 1) {
        throw notFound();
      }
    } catch (e) {
      throw convertError(e);
    }
  }

  static async verifyTokenCode(uid: string, code: string) {
    try {
      const { status } = await BaseToken.callProcedure(
        Proc.VerifyTokenCode,
        BaseAuthModel.sha256(code),
        uuidTransformer.to(uid)
      );
      if (status.affectedRows < 1) {
        throw notFound();
      }
    } catch (e) {
      throw convertError(e);
    }
  }
}
