import { IsNotEmpty, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateImcDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  @Max(499.99)
  peso: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  @Max(2.99)
  altura: number;

  @Type(() => Number)
  @IsNumber()
  @Min(10)
  @Max(99.999)
  imc: number;

  @IsNotEmpty()
  categoria: string;

  fecha?: Date;
}

