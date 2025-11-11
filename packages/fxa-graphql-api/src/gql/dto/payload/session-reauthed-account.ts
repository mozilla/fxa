import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SessionReauthedAccountPayload {
  @Field({
    description: 'A unique identifier for the client performing the mutation.',
    nullable: true,
  })
  public clientMutationId?: string;

  @Field((type) => String)
  public uid!: hexstring;

  @Field()
  verified!: boolean;

  @Field()
  authAt!: number;

  @Field()
  metricsEnabled!: boolean;

  @Field((type) => String, { nullable: true })
  keyFetchToken?: hexstring;

  @Field({ nullable: true })
  verificationMethod?: string;

  @Field({ nullable: true })
  verificationReason?: string;
}
