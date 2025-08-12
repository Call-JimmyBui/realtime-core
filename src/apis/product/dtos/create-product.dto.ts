import { NumberField, StringField } from '@/decorators/field.decorators';


export class CreateProductDto {
  
  @StringField()
  id: string;

  @StringField()
  name: string;

  @StringField({
    nullable: true
  })
  description?: string;

  @NumberField({
    min: 0
  })
  price: number;

  @NumberField({
    min: 0
  })
  stock: number;
}
