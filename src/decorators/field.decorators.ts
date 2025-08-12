
import { applyDecorators } from '@nestjs/common';
import { ApiProperty, type ApiPropertyOptions } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsInt,
  IsJWT,
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
  NotEquals,
} from 'class-validator';
import { IsNullable } from './validators/is-nullable.decorator';
import { IsPassword } from './validators/is-password.decorator';

interface IFieldOptions {
  each?: boolean;
  swagger?: boolean;
  nullable?: boolean;
  groups?: string[];
}

interface INumberFieldOptions extends IFieldOptions {
  min?: number;
  max?: number;
  int?: boolean;
  isPositive?: boolean;
}

interface IStringFieldOptions extends IFieldOptions {
  minLength?: number;
  maxLength?: number;
  toLowerCase?: boolean;
  toUpperCase?: boolean;
}

type IBooleanFieldOptions = IFieldOptions;
type ITokenFieldOptions = IFieldOptions;


export function NumberField(
  options: Omit<ApiPropertyOptions, 'type'> & INumberFieldOptions = {},
): PropertyDecorator {
  const decorators = [Type(() => Number)];

  if (options.nullable) {
    decorators.push(IsNullable({ each: options.each }));
  } else {
    decorators.push(NotEquals(null, { each: options.each }));
  }

  if (options.swagger !== false) {
    const { required = true, ...restOptions } = options;
    decorators.push(
      ApiProperty({ type: Number, required: !!required, ...restOptions }),
    );
  }

  if (options.int) {
    decorators.push(IsInt({ each: options.each }));
  } else {
    decorators.push(IsNumber({}, { each: options.each }));
  }

  if (typeof options.min === 'number') {
    decorators.push(Min(options.min, { each: options.each }));
  }

  if (typeof options.max === 'number') {
    decorators.push(Max(options.max, { each: options.each }));
  }

  if (options.isPositive) {
    decorators.push(IsPositive({ each: options.each }));
  }

  return applyDecorators(...decorators);
}

export function StringField(
  options: Omit<ApiPropertyOptions, 'type'> & IStringFieldOptions = {},
): PropertyDecorator {
  const decorators = [Type(() => String), IsString({ each: options.each })];

  if (options.nullable) {
    decorators.push(IsNullable({ each: options.each }));
  } else {
    decorators.push(NotEquals(null, { each: options.each }));
  }

  if (options.swagger !== false) {
    const { required = true, ...restOptions } = options;
    decorators.push(
      ApiProperty({
        type: String,
        required: !!required,
        ...restOptions,
        isArray: options.each,
      }),
    );
  }

  const minLength = options.minLength || 1;

  decorators.push(MinLength(minLength, { each: options.each }));

  if (options.maxLength) {
    decorators.push(MaxLength(options.maxLength, { each: options.each }));
  }

  return applyDecorators(...decorators);
}

export function PasswordField(
  options: Omit<ApiPropertyOptions, 'type' | 'minLength'> &
    IStringFieldOptions = {},
): PropertyDecorator {
  const decorators = [StringField({ ...options, minLength: 6 }), IsPassword()];

  if (options.nullable) {
    decorators.push(IsNullable());
  } else {
    decorators.push(NotEquals(null));
  }

  return applyDecorators(...decorators);
}

export function BooleanField(
  options: Omit<ApiPropertyOptions, 'type'> & IBooleanFieldOptions = {},
): PropertyDecorator {
  const decorators = [IsBoolean()];

  if (options.nullable) {
    decorators.push(IsNullable());
  } else {
    decorators.push(NotEquals(null));
  }

  if (options.swagger !== false) {
    const { required = true, ...restOptions } = options;
    decorators.push(
      ApiProperty({ type: Boolean, required: !!required, ...restOptions }),
    );
  }

  return applyDecorators(...decorators);
}

export function EmailField(
  options: Omit<ApiPropertyOptions, 'type'> & IStringFieldOptions = {},
): PropertyDecorator {
  const decorators = [
    IsEmail(),
    StringField({ toLowerCase: true, ...options }),
  ];

  if (options.nullable) {
    decorators.push(IsNullable());
  } else {
    decorators.push(NotEquals(null));
  }

  if (options.swagger !== false) {
    const { required = true, ...restOptions } = options;
    decorators.push(
      ApiProperty({ type: String, required: !!required, ...restOptions }),
    );
  }

  return applyDecorators(...decorators);
}

export function TokenField(
  options: Omit<ApiPropertyOptions, 'type'> & ITokenFieldOptions = {},
): PropertyDecorator {
  const decorators = [Type(() => String), IsJWT({ each: options.each })];

  if (options.nullable) {
    decorators.push(IsNullable({ each: options.each }));
  } else {
    decorators.push(NotEquals(null, { each: options.each }));
  }

  if (options.swagger !== false) {
    const { required = true, ...restOptions } = options;
    decorators.push(
      ApiProperty({
        type: String,
        required: !!required,
        ...restOptions,
        isArray: options.each,
      }),
    );
  }

  return applyDecorators(...decorators);
}

export function UUIDField(
  options: Omit<ApiPropertyOptions, 'type' | 'format' | 'isArray'> &
    IFieldOptions = {},
): PropertyDecorator {
  const decorators = [Type(() => String), IsUUID('4', { each: options.each })];

  if (options.nullable) {
    decorators.push(IsNullable());
  } else {
    decorators.push(NotEquals(null));
  }

  if (options.swagger !== false) {
    const { required = true, ...restOptions } = options;
    decorators.push(
      ApiProperty({
        type: options.each ? [String] : String,
        format: 'uuid',
        isArray: options.each,
        required: !!required,
        ...restOptions,
      }),
    );
  }

  return applyDecorators(...decorators);
}

export function DateField(
  options: Omit<ApiPropertyOptions, 'type'> & IFieldOptions = {},
): PropertyDecorator {
  const decorators = [Type(() => Date), IsDate()];

  if (options.nullable) {
    decorators.push(IsNullable());
  } else {
    decorators.push(NotEquals(null));
  }

  if (options.swagger !== false) {
    const { required = true, ...restOptions } = options;
    decorators.push(
      ApiProperty({ type: Date, required: !!required, ...restOptions }),
    );
  }

  return applyDecorators(...decorators);
}


function getVariableName(variableFunction: () => any) {
  return variableFunction.toString().split('.').pop();
}