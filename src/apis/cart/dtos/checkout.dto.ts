import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty, IsString, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CheckoutDto {

  @ApiProperty({
    type: String,
    isArray: true,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @Type(() => String)
  productIds: string[];
}
