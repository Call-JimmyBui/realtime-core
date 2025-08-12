import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dtos/create-product.dto';
import { ProductResponseDto } from './dtos/product-response.dto';
import { OffsetPaginationDto } from '@/common/dto/offset-pagination.ts/offset-pagination.dto';
import { PageOptionsDto } from '@/common/dto/offset-pagination.ts/page-options.dto';
import { FilterQuery } from 'mongoose';
import { OffsetPaginatedDto } from '@/common/dto/offset-pagination.ts/paginated.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
  ) {}

  async findAll(
    pageOptionsDto: PageOptionsDto,
  ): Promise<OffsetPaginatedDto<ProductResponseDto>> {
    const { limit = 10, q } = pageOptionsDto;
    const filter: FilterQuery<ProductDocument> = q ? { name: { $regex: q, $options: 'i' } } : {};
      
    const totalRecords = await this.productModel.countDocuments(filter).exec();

    const products = await this.productModel
      .find(filter)
      .limit(limit)
      .skip(pageOptionsDto.offset)
      .lean()
      .exec();

    const productDtos = plainToInstance(ProductResponseDto, products);

    const paginationMeta = new OffsetPaginationDto(totalRecords, pageOptionsDto);

    return new OffsetPaginatedDto<ProductResponseDto>(productDtos, paginationMeta);
  }


  async create(createProductDto: CreateProductDto): Promise<ProductDocument> {
    const newProduct = new this.productModel(createProductDto);
    return newProduct.save();
  }


  async findOne(id: string): Promise<ProductDocument> {
    const product = await this.productModel
    .findOne({ _id: id })
    .lean()
    .exec(); 

    if (!product) {
      throw new NotFoundException(`Sản phẩm với ID "${id}" không tồn tại.`);
    }
    return product;
  }


  async updateStock(id: string, stock: number): Promise<ProductDocument> {
    const updatedProduct = await this.productModel.findOneAndUpdate(
        { _id: id },
        { stock },
        { new: true }
    ).exec();

    if (!updatedProduct) {
      throw new NotFoundException(`Sản phẩm với ID "${id}" không tồn tại.`);
    }
    return updatedProduct;
  }

  async remove(id: string): Promise<ProductDocument> {
    const deletedProduct = await this.productModel.findOneAndDelete({ id }).exec();
    if (!deletedProduct) {
      throw new NotFoundException(`Sản phẩm với ID "${id}" không tồn tại.`);
    }
    return deletedProduct;
  }
}
