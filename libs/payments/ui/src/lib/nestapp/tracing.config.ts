import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ConsoleExporterConfig {
  @IsBoolean()
  enabled!: boolean;
}

export class GcpExporterConfig {
  @IsBoolean()
  enabled!: boolean;
}

export class OtelExporterConfig {
  @IsBoolean()
  enabled!: boolean;

  @IsString()
  url!: string;

  @IsNumber()
  concurrencyLimit!: number;
}

export class TracingConfig {
  @IsString()
  @IsOptional()
  clientName?: string;

  @IsBoolean()
  @IsOptional()
  batchProcessor?: boolean;

  @IsString()
  @IsOptional()
  corsUrls?: string;

  @IsBoolean()
  @IsOptional()
  filterPii?: boolean;

  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  sampleRate?: number;

  @IsString()
  @IsOptional()
  serviceName?: string;

  @ValidateNested()
  @Type(() => ConsoleExporterConfig)
  @IsOptional()
  console?: ConsoleExporterConfig;

  @ValidateNested()
  @Type(() => GcpExporterConfig)
  @IsOptional()
  gcp?: GcpExporterConfig;

  @ValidateNested()
  @Type(() => OtelExporterConfig)
  @IsOptional()
  otel?: OtelExporterConfig;
}

