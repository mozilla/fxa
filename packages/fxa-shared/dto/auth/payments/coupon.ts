import joi from 'typesafe-joi';

export const couponDetailsSchema = joi.object({
  promotionCode: joi.string().required(),
  type: joi.string().required(),
  valid: joi.boolean().required(),
  discountAmount: joi.number().optional(),
  expired: joi.boolean().optional(),
  maximallyRedeemed: joi.boolean().optional(),
});

export type couponDetailsSchema = joi.Literal<typeof couponDetailsSchema>;
