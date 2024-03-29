import { Controller, Get, Logger, Param, Query } from "@nestjs/common";

import { LanguageEnum } from "../../../shop-shared/constants/localization";
import { AttributeDto } from "../../../shop-shared/dto/product/attribute.dto";
import { ProductDto } from "../../../shop-shared/dto/product/product.dto";
import { ProductListResponseDto } from "../../../shop-shared/dto/product/productList.response.dto";
import { mapAttributeDocumentToAttributeDto } from "../../../shop-shared-server/mapper/product/map.attributeDocument.to.attributeDto";
import { mapProductDocumentToProductDto } from "../../../shop-shared-server/mapper/product/map.productDocument.to.productDto";
import { ProductService } from "../../../shop-shared-server/service/product/product.service";

@Controller("product")
export class ProductController {
	constructor(private readonly productService: ProductService) {}

	private logger: Logger = new Logger(ProductController.name);

	@Get("get/:id")
	async getProduct(
		@Param("id") id: string,
		@Query("lang") lang: LanguageEnum,
	): Promise<ProductDto> {
		const result = await this.productService.getProduct(id);
		if (!result) {
			throw new Error(`Product not found with id ${id}`);
		}
		return mapProductDocumentToProductDto(result, lang);
	}

	@Get("get/public/:publicId")
	async getProductPublic(
		@Param("publicId") publicId: string,
		@Query("lang") lang: LanguageEnum,
	): Promise<ProductDto> {
		const result = await this.productService.getProductByPublicId(publicId);
		if (!result) {
			throw new Error(`Product not found with public id ${publicId}`);
		}
		return mapProductDocumentToProductDto(result, lang);
	}

	@Get("list")
	async list(
		@Query("lang") lang: LanguageEnum,
		@Query("attrs") attributes: { key: string; values: string[] }[],
		@Query("categories") categories: string[],
		@Query("sortField") sortField: string,
		@Query("sortOrder") sortOrder: "asc" | "desc",
		@Query("skip") skip: number,
		@Query("limit") limit: number,
		@Query("search") search: string,
		@Query("priceFrom") priceFrom: number,
		@Query("priceTo") priceTo: number,
	): Promise<ProductListResponseDto> {
		this.logger.log(lang);
		console.log("Attrs:", attributes);
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
		if (priceFrom !== undefined && !Number.isNaN(priceFrom)) {
			priceQuery.$gte = priceFrom;
		}
		if (priceTo !== undefined && !Number.isNaN(priceTo)) {
			priceQuery.$lte = priceTo;
		}
		if (Object.keys(priceQuery).length > 0) {
			query.price = priceQuery;
		}

		if (categories) {
			query.categoriesAll = { $all: categories.map((id) => id) };
		}

		if (attributes) {
			for (const { key, values } of attributes) {
				query[`attrs.${key}`] = { $in: values };
			}
		}

		const sort: any = {};
		if (sortField) {
			if (sortField === "title") {
				sort[`${sortField}.${lang}`] = sortOrder === "asc" ? 1 : -1;
			} else {
				sort[sortField] = sortOrder === "asc" ? 1 : -1;
			}
		}

		const result = await this.productService.find(query, sort, skip, limit, lang);

		return {
			products: result.products.map((product) =>
				mapProductDocumentToProductDto(product, lang),
			),
			total: result.total,
			filters: result.filters,
			categories: result.categories,
			priceMin: result.priceMin,
			priceMax: result.priceMax,
		};
	}

	@Get("attribute/list")
	async getAttributes(@Query("lang") lang: LanguageEnum): Promise<AttributeDto[]> {
		const result = await this.productService.getAttributes();
		return result.map((attribute) => mapAttributeDocumentToAttributeDto(attribute, lang));
	}
}
