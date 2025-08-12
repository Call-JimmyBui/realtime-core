import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { PageOptionsDto } from './offset-options.dto';

export class CursorPaginationDto {
  @ApiProperty()
  @Expose()
  readonly limit: number;

  @ApiProperty()
  @Expose()
  readonly afterCursor?: string | null;

  @ApiProperty()
  @Expose()
  readonly beforeCursor?: string | null;

  @ApiProperty()
  @Expose()
  readonly totalRecords: number;

  constructor(
    totalRecords: number,
    afterCursor: string | null,
    beforeCursor: string | null,
    pageOptions: PageOptionsDto,
  ) {
    this.limit = pageOptions.limit ?? 0;
    this.afterCursor = afterCursor;
    this.beforeCursor = beforeCursor;
    this.totalRecords = totalRecords;
  }
}