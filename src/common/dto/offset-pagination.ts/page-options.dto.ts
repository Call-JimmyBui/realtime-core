import {
  DEFAULT_CURRENT_PAGE,
  DEFAULT_PAGE_LIMIT,
  Order,
} from '@/constants/app.constant';
import { NumberField, StringField } from '@/decorators/field.decorators';
import { IsNullable } from '@/decorators/validators/is-nullable.decorator';
import { IsOptional, IsString } from 'class-validator';

interface ISort {
  field: string;
  order: Order;
}

export class PageOptionsDto {
  @NumberField({
    nullable: true,
    minimum: 1,
    default: DEFAULT_PAGE_LIMIT,
    int: true,
  })
  readonly limit?: number = DEFAULT_PAGE_LIMIT;

  @NumberField({
    nullable: true,
    minimum: 1,
    default: DEFAULT_CURRENT_PAGE,
    int: true,
  })
  readonly page?: number = DEFAULT_CURRENT_PAGE;

  @IsOptional()
  @IsString()
  @StringField({
    required: false,
    nullable: true
  })
  readonly q?: string;

  @IsOptional()
  @IsString()
  @StringField({
    required: false,
    nullable: true
  })
  readonly sort?: string;

  @IsNullable()
  @StringField({
    required: false,
    nullable: true,
    enum: Order
  })
  readonly order?: Order = Order.ASC;

  get offset() {
    return this.page ? (this.page - 1) * (this.limit ?? 1) : 0;
  }

  get _sort(): ISort[] {
    return this.sort
      ? this.sort.split(',').map((item) => {
          return {
            order: item.startsWith('-') ? Order.DESC : Order.ASC,
            field: item.replace('-', ''),
          };
        })
      : [];
  }
}
