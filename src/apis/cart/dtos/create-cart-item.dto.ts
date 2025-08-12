import { NumberField, StringField } from '@/decorators/field.decorators';

export class CreateCartItemDto {

  @StringField()
  productId: string;

  @NumberField({
    min: 0
  })
  quantity: number;

}
