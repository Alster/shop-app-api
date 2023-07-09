import { Body, Controller, Get, Logger, Param, Query } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { LanguageEnum } from '../../../shop-shared/constants/localization';
import { ProductService } from '../../../shop-shared-server/service/product/product.service';
import { ProductDto } from '../../../shop-shared/dto/product/product.dto';
import { AttributeDto } from '../../../shop-shared/dto/product/attribute.dto';
import { mapAttributeDocumentToAttributeDTO } from '../../../shop-shared-server/mapper/product/map.attributeDocument-to-attributeDTO';
import { mapProductDocumentToProductDto } from '../../../shop-shared-server/mapper/product/map.productDocument-to-productDto';
import { ProductListResponseDto } from '../../../shop-shared/dto/product/product-list.response.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  private logger: Logger = new Logger(ProductController.name);

  @Get('get/:id')
  async getProduct(
    @Param('id') id: string,
    @Query('lang') lang: LanguageEnum,
  ): Promise<ProductDto> {
    const res = await this.productService.getProduct(id);
    if (!res) {
      throw new Error(`Product not found with id ${id}`);
    }
    return mapProductDocumentToProductDto(res, lang);
  }

  @Get('get/public/:publicId')
  async getProductPublic(
    @Param('publicId') publicId: string,
    @Query('lang') lang: LanguageEnum,
  ): Promise<ProductDto> {
    const res = await this.productService.getProductByPublicId(publicId);
    if (!res) {
      throw new Error(`Product not found with public id ${publicId}`);
    }
    return mapProductDocumentToProductDto(res, lang);
  }

  @Get('list')
  async list(
    @Query('lang') lang: LanguageEnum,
    @Query('attrs') attrs: { key: string; values: string[] }[],
    @Query('categories') categories: string[],
    @Query('sortField') sortField: string,
    @Query('sortOrder') sortOrder: 'asc' | 'desc',
    @Query('skip') skip: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
    @Query('priceFrom') priceFrom: number,
    @Query('priceTo') priceTo: number,
  ): Promise<ProductListResponseDto> {
    this.logger.log(lang);
    console.log('Attrs:', attrs);
    const query: any = {};

    // Index will be intersected
    if (search) {
      query.$text = {
        $search: search,
      };
    }
    // First equality field
    query.active = true;

    // Range fields
    query.quantity = { $gt: 0 };

    const priceQuery: any = {};
    if (priceFrom !== undefined && !isNaN(priceFrom)) {
      priceQuery.$gte = priceFrom;
    }
    if (priceTo !== undefined && !isNaN(priceTo)) {
      priceQuery.$lte = priceTo;
    }
    if (Object.keys(priceQuery).length > 0) {
      query.price = priceQuery;
    }

    if (categories) {
      query.categoriesAll = { $all: categories.map((id) => id) };
    }

    if (attrs) {
      attrs.forEach(({ key, values }) => {
        query[`attrs.${key}`] = { $in: values };
      });
    }

    const sort: any = {};
    if (sortField) {
      if (sortField === 'title') {
        sort[`${sortField}.${lang}`] = sortOrder === 'asc' ? 1 : -1;
      } else {
        sort[sortField] = sortOrder === 'asc' ? 1 : -1;
      }
    }

    const res = await this.productService.find(query, sort, skip, limit, lang);

    return {
      products: res.products.map((product) =>
        mapProductDocumentToProductDto(product, lang),
      ),
      total: res.total,
      filters: res.filters,
      categories: res.categories,
      priceMin: res.priceMin,
      priceMax: res.priceMax,
    };
  }

  @Get('attribute/list')
  async getAttributes(
    @Query('lang') lang: LanguageEnum,
  ): Promise<AttributeDto[]> {
    const res = await this.productService.getAttributes();
    return res.map((attr) => mapAttributeDocumentToAttributeDTO(attr, lang));
  }
}
