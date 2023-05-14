import { ItemAttributeDocument } from '../../../shop_shared_server/schema/item-attribute.schema';
import { AttributeDto } from '../../../shop_shared/dto/attribute.dto';
import { getTranslation } from "../../../shop_shared_server/helpers/translation-helpers";

export function mapAttributeDocumentToAttributeDTO(
  obj: ItemAttributeDocument,
  lang: string,
): AttributeDto {
  return {
    id: obj._id.toString(),
    title: getTranslation(obj.title, lang),
    description: getTranslation(obj.description, lang),
    key: obj.key,
    type: obj.type,
    values: obj.values.map((value) => {
      return {
        key: value.key,
        title: getTranslation(value.title, lang),
      };
    }),
    active: obj.active,
    createDate: 'no any date ololo',
  };
}
