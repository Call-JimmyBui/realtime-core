import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { PageOptionsDto } from './page-options.dto';
import { NumberField } from '@/decorators/field.decorators';

export class OffsetPaginationDto {
  @ApiProperty()
  @Expose()
  @NumberField()
  readonly limit: number;

  @ApiProperty()
  @Expose()
  @NumberField()
  readonly currentPage: number;

  @ApiProperty()
  @Expose()
  @NumberField({
    required: false,
    nullable: true
  })
  readonly nextPage?: number;

  @ApiProperty()
  @Expose()
  @NumberField({
    nullable: true,
    required: false,
  })
  readonly previousPage?: number;

  @ApiProperty()
  @Expose()
  @NumberField({
    required: false,
    nullable: true
  })
  readonly totalRecords: number;

  @ApiProperty()
  @Expose()
  @NumberField({
    required: false,
    nullable: true
  })
  readonly totalPages: number;

  constructor(totalRecords: number, pageOptions: PageOptionsDto) {
    this.limit = pageOptions.limit ?? 0;
    this.currentPage = pageOptions.page ?? 0;
    this.totalRecords = totalRecords;
    this.totalPages =
      this.limit > 0 ? Math.ceil(totalRecords / (pageOptions.limit ?? 1)) : 0;

    this.nextPage =
      this.currentPage < this.totalPages ? this.currentPage + 1 : undefined;

    this.previousPage =
      this.currentPage > 1 && this.currentPage - 1 <= this.totalPages
        ? this.currentPage - 1
        : undefined;
  }

}
