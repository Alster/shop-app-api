import { Module } from '@nestjs/common';
import { ProductController } from './product/product.controller';
import {
  Product,
  ProductSchema,
} from '../../shop_shared_server/schema/product.schema';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ItemAttribute,
  ItemAttributeSchema,
} from '../../shop_shared_server/schema/item-attribute.schema';
import {
  CategoriesTree,
  CategoriesTreeSchema,
} from '../../shop_shared_server/schema/categories-tree.schema';
import { CategoryController } from './category/category.controller';
import {
  Category,
  CategorySchema,
} from '../../shop_shared_server/schema/category.schema';
import { ProductService } from "../../shop_shared_server/service/product/product.service";
import { CategoryService } from "../../shop_shared_server/service/category/category.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: ItemAttribute.name, schema: ItemAttributeSchema },
      { name: CategoriesTree.name, schema: CategoriesTreeSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  providers: [ProductService, CategoryService],
  controllers: [ProductController, CategoryController],
})
export class ShopModule {}
