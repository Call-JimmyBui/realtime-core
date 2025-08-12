import { NumberField } from "@/decorators/field.decorators";

export class UpdateQuantityDto {

  @NumberField({
    min: 1
  })
  quantity: number;

  @NumberField({
    min: 1
  })
  price: number;
  
}