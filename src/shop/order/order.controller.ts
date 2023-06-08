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

    @Query('lang') lang: LanguageEnum,
    @Query('currency') currency: string,

    @Query('first_name') first_name: string,
    @Query('last_name') last_name: string,
    @Query('phone_number') phone_number: string,

    @Query('items_data') items_data: string,

    @Query('where_to_deliver') where_to_deliver: string,

    @Query('city_name') city_name: string,
    @Query('office_name') office_name: string,
    @Query('street') street: string,
    @Query('building') building: string,
    @Query('room') room: string,
  ): Promise<{ url: string }> {
    try {
      // Basic validation
      if (!currency) {
        throw new PublicError('NO_CURRENCY');
      }
      if (!first_name) {
        throw new PublicError('NO_FIRST_NAME');
      }
      if (!last_name) {
        throw new PublicError('NO_LAST_NAME');
      }
      if (!phone_number) {
        throw new PublicError('NO_PHONE_NUMBER');
      }
      if (!items_data) {
        throw new PublicError('NO_ITEMS');
      }
      if (!where_to_deliver) {
        throw new PublicError('NO_WHERE_TO_DELIVER');
      }
      if (!city_name) {
        throw new PublicError('NO_CITY_NAME');
      }
      if (
        !office_name &&
        where_to_deliver === NOVA_POSHTA_DELIVERY_TYPE.OFFICE
      ) {
        throw new PublicError('NO_OFFICE_NAME');
      }
      if (!street && where_to_deliver === NOVA_POSHTA_DELIVERY_TYPE.COURIER) {
        throw new PublicError('NO_STREET');
      }
      if (!building && where_to_deliver === NOVA_POSHTA_DELIVERY_TYPE.COURIER) {
        throw new PublicError('NO_BUILDING');
      }
      if (!room && where_to_deliver === NOVA_POSHTA_DELIVERY_TYPE.COURIER) {
        throw new PublicError('NO_ROOM');
      }

      // Create order
      const order = await this.orderService.createOrder({
        currency,
        firstName: first_name,
        lastName: last_name,
        phoneNumber: phone_number,
        itemsData: JSON.parse(items_data),
        delivery: {
          whereToDeliver: where_to_deliver as NovaPoshtaDeliveryType,
          data:
            where_to_deliver === NOVA_POSHTA_DELIVERY_TYPE.OFFICE
              ? {
                  cityName: city_name,
                  officeName: office_name,
                }
              : {
                  cityName: city_name,
                  street: street,
                  building: building,
                  room: room,
                },
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
