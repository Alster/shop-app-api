import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { LanguageEnum } from '../../../shop_shared/constants/localization';
import { CategoryService } from '../../../shop_shared_server/service/category/category.service';
import { CategoriesNodeDto } from '../../../shop_shared/dto/category/categories-tree.dto';
import {
  mapCategoriesNodeDTOToCategoryNode,
  mapCategoriesTreeDocumentToCategoriesTreeDTO,
} from '../../../shop_shared_server/mapper/category/map.categoriesTreeDocument-to-categoriesTreeDTO';
import { CategoryDto } from '../../../shop_shared/dto/category/category.dto';
import { mapCategoryToCategoryDto } from '../../../shop_shared_server/mapper/category/map.category-to-categoryDTO';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  private logger: Logger = new Logger(CategoryController.name);

  @Get('tree')
  async getCategoriesTrees(): Promise<CategoriesNodeDto[]> {
    const categoriesTree = await this.categoryService.getCategoriesTree();
    return mapCategoriesTreeDocumentToCategoriesTreeDTO(categoriesTree).root;
  }

  @Post('tree')
  async saveCategoriesTrees(
    @Body() categoriesNodes: CategoriesNodeDto[],
  ): Promise<void> {
    const nodes = categoriesNodes.map(mapCategoriesNodeDTOToCategoryNode);
    await this.categoryService.saveCategoriesTree(nodes);
  }

  @Get('list')
  async getCategories(): Promise<CategoryDto[]> {
    const categories = await this.categoryService.getCategories();
    return categories.map((category) =>
      mapCategoryToCategoryDto(category, LanguageEnum.UA),
    );
  }
}