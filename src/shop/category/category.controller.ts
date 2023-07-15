import { Controller, Get, Logger, Query } from "@nestjs/common";

import { LanguageEnum } from "../../../shop-shared/constants/localization";
import { CategoriesNodeDto } from "../../../shop-shared/dto/category/categoriesTree.dto";
import { CategoryDto } from "../../../shop-shared/dto/category/category.dto";
import { mapCategoriesTreeDocumentToCategoriesTreeDto } from "../../../shop-shared-server/mapper/category/map.categoriesTreeDocument.to.categoriesTreeDto";
import { mapCategoryToCategoryDto } from "../../../shop-shared-server/mapper/category/map.category.to.categoryDto";
import { CategoryService } from "../../../shop-shared-server/service/category/category.service";

@Controller("category")
export class CategoryController {
	constructor(private readonly categoryService: CategoryService) {}

	private logger: Logger = new Logger(CategoryController.name);

	@Get("tree")
	async getCategoriesTrees(@Query("lang") lang: LanguageEnum): Promise<CategoriesNodeDto[]> {
		const categoriesTree = await this.categoryService.getCategoriesTree();
		return mapCategoriesTreeDocumentToCategoriesTreeDto(categoriesTree, lang).root;
	}

	@Get("list")
	async getCategories(@Query("lang") lang: LanguageEnum): Promise<CategoryDto[]> {
		const categories = await this.categoryService.getCategories();
		return categories.map((category) => mapCategoryToCategoryDto(category, lang));
	}
}
