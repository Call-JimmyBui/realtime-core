import { Controller, Get, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductResponseDto } from './dtos/product-response.dto';
import { PageOptionsDto } from '@/common/dto/offset-pagination.ts/page-options.dto';
import { OffsetPaginatedDto } from '@/common/dto/offset-pagination.ts/paginated.dto';
import { ApiPublic } from '@/decorators/http.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductService) {}


  @Get()
  @ApiPublic({
    type: ProductResponseDto,
    summary: 'Lấy danh sách tất cả sản phẩm',
    isPaginated: true
  })
  async findAll(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<OffsetPaginatedDto<ProductResponseDto>> {
    return this.productsService.findAll(pageOptionsDto);
  }

}
