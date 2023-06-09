import {
  Controller,
  Get,
  Logger,
  NotFoundException,
  Param,
  Query,
  Redirect,
  Res,
} from '@nestjs/common';
import { OrderService } from '../../../shop_shared_server/service/order/order.service';
import {
  NOVA_POSHTA_DELIVERY_TYPE,
  NovaPoshtaDeliveryType,
} from '../../../shop_shared/constants/checkout';
import { LanguageEnum } from '../../../shop_shared/constants/localization';
import { OrderDto } from '../../../shop_shared/dto/order/order.dto';
import { mapOrderDocumentToOrderDto } from '../../../shop_shared_server/mapper/order/map.orderDocument-to-orderDto';
import { PublicError } from '../../../shop_shared_server/helpers/publicError';
import { CURRENCIES, CURRENCY } from '../../../shop_shared/constants/exchange';
import {
  CreateOrderItemDataDto,
  DeliveryNVCourierDto,
  DeliveryNVOfficeDto,
} from '../../../shop_shared/dto/order/create-order.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  private logger: Logger = new Logger(OrderController.name);

  @Get('get/:id')
  async getOrder(
    @Param('id') id: string,
    @Query('lang') lang: LanguageEnum,
  ): Promise<OrderDto> {
    const order = await this.orderService.getOrder(id);
    if (!order) {
      throw new NotFoundException();
    }

    return mapOrderDocumentToOrderDto(order);
  }

  @Get('create')
  @Redirect()
  async createOrder(
    @Res() res: any,

    @Query('lang') lang: unknown,
    @Query('currency') currency: unknown,

    @Query('first_name') first_name: unknown,
    @Query('last_name') last_name: unknown,
    @Query('phone_number') phone_number: unknown,

    @Query('items_data') items_data: unknown,

    @Query('where_to_deliver') where_to_deliver: unknown,

    @Query('city_name') city_name: unknown,
    @Query('office_name') office_name: unknown,
    @Query('street') street: unknown,
    @Query('building') building: unknown,
    @Query('room') room: unknown,
  ): Promise<{ url: string }> {
    try {
      // Basic validation

      // Currency
      if (!currency) {
        throw new PublicError('NO_CURRENCY');
      }
      // Must be string
      if (typeof currency !== 'string') {
        throw new PublicError('INVALID_CURRENCY');
      }
      if (!CURRENCIES.includes(currency as CURRENCY)) {
        throw new PublicError('INVALID_CURRENCY');
      }
      // First name
      if (!first_name) {
        throw new PublicError('NO_FIRST_NAME');
      }
      // Must be string
      if (typeof first_name !== 'string') {
        throw new PublicError('INVALID_FIRST_NAME');
      }
      // Greater than 3 and smaller than 30
      if (first_name.length < 3 || first_name.length > 30) {
        throw new PublicError('INVALID_FIRST_NAME');
      }
      // Last name
      if (!last_name) {
        throw new PublicError('NO_LAST_NAME');
      }
      // Must be string
      if (typeof last_name !== 'string') {
        throw new PublicError('INVALID_LAST_NAME');
      }
      // Greater than 3 and smaller than 30
      if (last_name.length < 3 || last_name.length > 30) {
        throw new PublicError('INVALID_LAST_NAME');
      }
      // Phone number
      if (!phone_number) {
        throw new PublicError('NO_PHONE_NUMBER');
      }
      // Must be string
      if (typeof phone_number !== 'string') {
        throw new PublicError('INVALID_PHONE_NUMBER');
      }
      // Items data
      if (!items_data) {
        throw new PublicError('NO_ITEMS');
      }
      // Must be string
      if (typeof items_data !== 'string') {
        throw new PublicError('INVALID_ITEMS');
      }
      // Parse items data
      const items_data_parsed: CreateOrderItemDataDto[] =
        JSON.parse(items_data);
      // Must be array
      if (!Array.isArray(items_data_parsed)) {
        throw new PublicError('INVALID_ITEMS');
      }
      // Must have at least one item
      if (items_data_parsed.length === 0) {
        throw new PublicError('INVALID_ITEMS');
      }
      // Check each item
      for (const item of items_data_parsed) {
        // Must have productId
        if (!item.productId) {
          throw new PublicError('INVALID_ITEMS');
        }
        // productId must be string
        if (typeof item.productId !== 'string') {
          throw new PublicError('INVALID_ITEMS');
        }
        // Must have attrs
        if (!item.attrs) {
          throw new PublicError('INVALID_ITEMS');
        }
        // attrs must be object
        if (typeof item.attrs !== 'object') {
          throw new PublicError('INVALID_ITEMS');
        }
        // attrs must have at least one attr
        if (Object.keys(item.attrs).length === 0) {
          throw new PublicError('INVALID_ITEMS');
        }
        // Check each attr
        for (const attr of Object.keys(item.attrs)) {
          // Must be array
          if (!Array.isArray(item.attrs[attr])) {
            throw new PublicError('INVALID_ITEMS');
          }
          // Must have at least one value
          if (item.attrs[attr].length === 0) {
            throw new PublicError('INVALID_ITEMS');
          }
          // Check each value
          for (const value of item.attrs[attr]) {
            // Must be string
            if (typeof value !== 'string') {
              throw new PublicError('INVALID_ITEMS');
            }
            // Must have at least one character
            if (value.length === 0) {
              throw new PublicError('INVALID_ITEMS');
            }
          }
        }
        // Must have qty
        if (!item.qty) {
          throw new PublicError('INVALID_ITEMS');
        }
        // Must be number
        if (typeof item.qty !== 'number') {
          throw new PublicError('INVALID_ITEMS');
        }
        // Must be greater than 0
        if (item.qty <= 0) {
          throw new PublicError('INVALID_ITEMS');
        }
      }
      // Where to deliver
      if (!where_to_deliver) {
        throw new PublicError('NO_WHERE_TO_DELIVER');
      }
      // Must be string
      if (typeof where_to_deliver !== 'string') {
        throw new PublicError('INVALID_WHERE_TO_DELIVER');
      }
      // Must be one of the delivery types
      if (
        !Object.values(NOVA_POSHTA_DELIVERY_TYPE).includes(
          where_to_deliver as NovaPoshtaDeliveryType,
        )
      ) {
        throw new PublicError('INVALID_WHERE_TO_DELIVER');
      }
      // City name
      if (!city_name) {
        throw new PublicError('NO_CITY_NAME');
      }
      // Must be string
      if (typeof city_name !== 'string') {
        throw new PublicError('INVALID_CITY_NAME');
      }
      // Greater than 3 and smaller than 30
      if (city_name.length < 3 || city_name.length > 30) {
        throw new PublicError('INVALID_CITY_NAME');
      }
      const getNVOffice = (city_name: string): DeliveryNVOfficeDto => {
        // Office name
        if (!office_name) {
          throw new PublicError('NO_OFFICE_NAME');
        }
        // Must be string
        if (typeof office_name !== 'string') {
          throw new PublicError('INVALID_OFFICE_NAME');
        }
        // Greater than 3 and smaller than 30
        if (office_name.length < 3 || office_name.length > 30) {
          throw new PublicError('INVALID_OFFICE_NAME');
        }

        return {
          cityName: city_name,
          officeName: office_name,
        };
      };
      const getNVCourier = (city_name: string): DeliveryNVCourierDto => {
        // Street
        if (!street) {
          throw new PublicError('NO_STREET');
        }
        // Must be string
        if (typeof street !== 'string') {
          throw new PublicError('INVALID_STREET');
        }
        // Greater than 3 and smaller than 30
        if (street.length < 3 || street.length > 30) {
          throw new PublicError('INVALID_STREET');
        }
        // Building
        if (!building) {
          throw new PublicError('NO_BUILDING');
        }
        // Must be string
        if (typeof building !== 'string') {
          throw new PublicError('INVALID_BUILDING');
        }
        // Greater than 1 and smaller than 10
        if (building.length < 1 || building.length > 10) {
          throw new PublicError('INVALID_BUILDING');
        }
        // Room
        if (!room) {
          throw new PublicError('NO_ROOM');
        }
        // Must be string
        if (typeof room !== 'string') {
          throw new PublicError('INVALID_ROOM');
        }
        // Greater than 1 and smaller than 10
        if (room.length < 1 || room.length > 10) {
          throw new PublicError('INVALID_ROOM');
        }
        return {
          cityName: city_name,
          street: street,
          building: building,
          room: room,
        };
      };
      // Delivery data
      const deliveryData: DeliveryNVOfficeDto | DeliveryNVCourierDto =
        where_to_deliver === NOVA_POSHTA_DELIVERY_TYPE.OFFICE
          ? getNVOffice(city_name)
          : getNVCourier(city_name);
      // Create order
      const order = await this.orderService.createOrder({
        currency,
        firstName: first_name,
        lastName: last_name,
        phoneNumber: phone_number,
        itemsData: items_data_parsed,
        delivery: {
          whereToDeliver: where_to_deliver as NovaPoshtaDeliveryType,
          data: deliveryData,
        },
      });

      // const monoResponse: {
      //   invoiceId: string;
      //   pageUrl: string;
      // } = await fetchMono({
      //   amount: Math.round(totalPrice * 100),
      //   ccy: 980,
      //   merchantPaymInfo: {
      //     reference: order[0]._id.toString(),
      //     destination: 'Покупка щастя',
      //     basketOrder: [],
      //   },
      //   redirectUrl: `http://localhost:3000/${lang}/order/${order[0]._id.toString()}`,
      //   webHookUrl: 'http://api.unicorn.ua/order/webhook/mono/',
      //   validity: 3600,
      //   paymentType: 'debit',
      // });

      return {
        url: `http://localhost:3000/${lang}/order/${order._id.toString()}`,
      };
    } catch (error) {
      let errorDescription = `INTERNAL_ERROR`;
      if (error instanceof PublicError) {
        errorDescription = error.message;
      } else {
        this.logger.error(error);
        this.logger.error(error.stack);
      }
      return {
        url: `http://localhost:3000/${lang}/order/failed_to_create?reason=${errorDescription}`,
      };
    }
  }
}
