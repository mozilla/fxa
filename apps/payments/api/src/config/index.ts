import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';

export class TestNestedConfig {
  @IsString()
  public readonly testNested!: string;
}

export class RootConfig {
  @IsString()
  public readonly testOverride!: string;

  @IsString()
  public readonly testDefault!: string;

  @Type(() => TestNestedConfig)
  @ValidateNested()
  public readonly testNestedConfig!: TestNestedConfig;
}
