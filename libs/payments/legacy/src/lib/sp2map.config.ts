import { plainToInstance, Transform } from 'class-transformer';
import {
  IsString,
  IsDefined,
  IsObject,
  IsOptional,
  validateSync,
} from 'class-validator';

export class Intervals {
  @IsOptional()
  @IsString({ each: true })
  @Transform(({ value }) => value.split(','))
  daily?: string[];

  @IsOptional()
  @IsString({ each: true })
  @Transform(({ value }) => value.split(','))
  monthly?: string[];

  @IsOptional()
  @IsString({ each: true })
  @Transform(({ value }) => value.split(','))
  halfyearly?: string[];

  @IsOptional()
  @IsString({ each: true })
  @Transform(({ value }) => value.split(','))
  yearly?: string[];
}

export class Currency {
  @IsDefined()
  @IsObject()
  @Transform(({ value }) => {
    let usdFound = false;
    const transformedValue = Object.entries(value).reduce((acc, [key, val]) => {
      if (key === 'USD') {
        usdFound = true;
      }
      const interval = plainToInstance(Intervals, val);
      try {
        const validation = validateSync(interval);
        if (validation.length > 0) {
          throw new Error(`Validation erorrs: ${JSON.stringify(validation)}`);
        }
      } catch (err) {
        console.log(err);
        throw new Error(`Validation issue with value: ${JSON.stringify(val)}`);
      }
      acc[key] = interval;
      return acc;
    }, {} as any);

    if (!usdFound) {
      console.log(value);
      throw new Error('USD is required');
    }

    return transformedValue;
  })
  currencies!: Record<string, Intervals | undefined>; // Index signature to allow dynamic keys
}

export class SP2MapConfig {
  @IsDefined()
  @IsObject()
  @Transform(({ value }) => {
    const parsedValue = JSON.parse(value);
    const transformedValue = Object.entries(parsedValue).reduce(
      (acc, [key, val]) => {
        const classVal = plainToInstance(Currency, { currencies: val });
        try {
          const validation = validateSync(classVal);
          if (validation.length > 0) {
            throw new Error(`Validation erorrs: ${JSON.stringify(validation)}`);
          }
        } catch (err) {
          throw new Error(
            `Validation issue with value: ${JSON.stringify(val)}`
          );
        }
        acc[key] = classVal;
        return acc;
      },
      {} as any
    );
    return transformedValue;
  })
  offerings!: Record<string, Currency | undefined>; // Index signature to allow dynamic keys
}
