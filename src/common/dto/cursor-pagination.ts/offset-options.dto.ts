import { DEFAULT_PAGE_LIMIT } from '@/constants/app.constant';
import {
  NumberField,
  StringField,
} from '@/decorators/field.decorators';

export class PageOptionsDto {
  @StringField({nullable: true})
  afterCursor?: string;

  @StringField({nullable: true})
  beforeCursor?: string;

  @NumberField({
    nullable: true,
    minimum: 1,
    default: DEFAULT_PAGE_LIMIT,
    int: true,  
  })
  readonly limit?: number = DEFAULT_PAGE_LIMIT;

  @StringField({nullable: true})
  readonly q?: string;
}