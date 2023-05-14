import { ProductDocument } from '../../../shop_shared_server/schema/product.schema';
import { ProductDto } from '../../../shop_shared/dto/product.dto';
import { getTranslation } from "../../../shop_shared_server/helpers/translation-helpers";

export function mapProductDocumentToProductDto(
  obj: ProductDocument,
  lang: string,
): ProductDto {
  return {
    id: obj._id.toString(),
    title: getTranslation(obj.title, lang),
    description: getTranslation(obj.description, lang),
    categories: obj.categories.map((category) => category.toString()),
    characteristics: obj.characteristics,
    items: obj.items,
    attrs: obj.attrs,
    quantity: obj.quantity,
    price: obj.price,
    discount: obj.discount,
    active: obj.active,
    createDate: 'no any date ololo',
  };
}
